import { useState, useRef, useEffect } from "react"
import { UNIDADES_USO, UNIDADES_PAQUETE } from "../../data/conversiones"

function CampoConInventario({ valor, onChange, inventario, placeholder, onSeleccionar }) {
    const [sugerencias, setSugerencias] = useState([])
    const [mostrar, setMostrar] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (inputRef.current && !inputRef.current.closest(".dropdown-wrapper")?.contains(e.target)) {
                setMostrar(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleChange = (texto) => {
        onChange(texto)
        if (texto.length < 1) { setSugerencias([]); setMostrar(false); return }
        const found = inventario.filter(i =>
            i.tipo !== "insumo" &&
            i.nombre.toLowerCase().includes(texto.toLowerCase())
        )
        setSugerencias(found)
        setMostrar(true)
    }

    return (
        <div className="dropdown-wrapper" style={{ position: "relative" }}>
            <input
                ref={inputRef}
                type="text"
                value={valor}
                onChange={e => handleChange(e.target.value)}
                onFocus={() => valor.length >= 1 && sugerencias.length > 0 && setMostrar(true)}
                onBlur={() => setTimeout(() => setMostrar(false), 150)}
                placeholder={placeholder}
                autoComplete="off"
            />
            {mostrar && sugerencias.length > 0 && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
                    background: "var(--fondo-card, #fff)", border: "1.5px solid var(--borde)",
                    borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    maxHeight: 180, overflowY: "auto"
                }}>
                    <div style={{ padding: "5px 10px", fontSize: 11, color: "var(--texto-suave)", fontWeight: 700, letterSpacing: 0.5, borderBottom: "1px solid var(--borde)" }}>
                        DEL INVENTARIO
                    </div>
                    {sugerencias.map(item => (
                        <div
                            key={item._id}
                            onMouseDown={e => { e.preventDefault(); onSeleccionar(item); setMostrar(false) }}
                            style={{
                                padding: "8px 12px", cursor: "pointer", fontSize: 14,
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                borderBottom: "1px solid var(--borde)"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--fondo)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <span>{item.nombre}</span>
                            <span style={{ fontSize: 12, color: "var(--texto-suave)" }}>
                                {item.cantidad}{item.unidad} · ₡{parseFloat(item.costoPorPaquete || 0).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {mostrar && sugerencias.length === 0 && valor.length > 1 && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
                    background: "var(--fondo-card, #fff)", border: "1.5px solid var(--borde)",
                    borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "var(--texto-suave)"
                }}>
                    ✏️ "{valor}" no está en inventario — completá los datos abajo
                </div>
            )}
        </div>
    )
}

export default function FormularioIngrediente({ ingForm, setIngForm, onAgregar, inventario = [], onAgregarAInventario }) {
    const esNuevo = ingForm.nombre.length > 2 &&
        !inventario.some(i => i.nombre.toLowerCase() === ingForm.nombre.toLowerCase())

    const seleccionarDelInventario = (item) => {
        setIngForm({
            ...ingForm,
            nombre: item.nombre,
            cantidadPaquete: item.tamañoPaquete || "",
            unidadPaquete: item.unidad || "g",
            precioPaquete: item.costoPorPaquete || ""
        })
    }

    const handleAgregarAInventario = () => {
        if (!ingForm.nombre || !ingForm.cantidadPaquete || !ingForm.precioPaquete) return
        onAgregarAInventario({
            nombre: ingForm.nombre,
            tipo: "ingrediente",
            cantidadPaquetes: 1,
            tamañoPaquete: parseFloat(ingForm.cantidadPaquete) || 0,
            unidad: ingForm.unidadPaquete,
            costoPorPaquete: parseFloat(ingForm.precioPaquete) || 0,
            minimo: "",
            cantidad: parseFloat(ingForm.cantidadPaquete) || 0,
            costoTotal: parseFloat(ingForm.precioPaquete) || 0,
            fecha: new Date().toISOString()
        })
    }

    return (
        <div className="card">
            <h3 className="seccion-titulo">🧁 Ingredientes</h3>
            <div className="form-fila">
                <div className="form-grupo">
                    <label>Ingrediente</label>
                    <CampoConInventario
                        valor={ingForm.nombre}
                        onChange={v => setIngForm({ ...ingForm, nombre: v })}
                        inventario={inventario}
                        placeholder="Ej: Harina, Azúcar..."
                        onSeleccionar={seleccionarDelInventario}
                    />
                </div>
                <div className="form-grupo">
                    <label>Cantidad que usás</label>
                    <input type="number" value={ingForm.cantidadUso}
                        onChange={e => setIngForm({ ...ingForm, cantidadUso: e.target.value })}
                        placeholder="Ej: 2" />
                </div>
                <div className="form-grupo">
                    <label>Unidad de uso</label>
                    <select value={ingForm.unidadUso}
                        onChange={e => setIngForm({ ...ingForm, unidadUso: e.target.value })}>
                        {UNIDADES_USO.map(u => <option key={u}>{u}</option>)}
                    </select>
                </div>
            </div>
            <div className="form-fila">
                <div className="form-grupo">
                    <label>Total del paquete</label>
                    <input type="number" value={ingForm.cantidadPaquete}
                        onChange={e => setIngForm({ ...ingForm, cantidadPaquete: e.target.value })}
                        placeholder="Ej: 100" />
                </div>
                <div className="form-grupo">
                    <label>Unidad del paquete</label>
                    <select value={ingForm.unidadPaquete}
                        onChange={e => setIngForm({ ...ingForm, unidadPaquete: e.target.value })}>
                        {UNIDADES_PAQUETE.map(u => <option key={u}>{u}</option>)}
                    </select>
                </div>
                <div className="form-grupo">
                    <label>Precio del paquete (₡)</label>
                    <input type="number" value={ingForm.precioPaquete}
                        onChange={e => setIngForm({ ...ingForm, precioPaquete: e.target.value })}
                        placeholder="Ej: 2000" />
                </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <button className="btn-secundario" type="button" onClick={onAgregar}>
                    + Agregar ingrediente
                </button>
                {esNuevo && ingForm.cantidadPaquete && ingForm.precioPaquete && (
                    <button type="button"
                        onMouseDown={e => { e.preventDefault(); handleAgregarAInventario() }}
                        style={{
                            padding: "7px 14px", borderRadius: 8, border: "1.5px solid #10b981",
                            background: "#f0fdf4", color: "#059669", cursor: "pointer",
                            fontSize: 13, fontWeight: 600
                        }}>
                        📦 Guardar también en inventario
                    </button>
                )}
            </div>
            {esNuevo && (!ingForm.cantidadPaquete || !ingForm.precioPaquete) && (
                <p style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 6 }}>
                    💡 Completá "Total del paquete" y "Precio" para guardarlo en el inventario también.
                </p>
            )}
        </div>
    )
}