import React, { useState, useEffect, useRef } from "react"

const EQUIPOS = ["Horno", "Estufa", "Batidora", "Freidora de aire", "Microondas", "Ninguno", "Otro"]

// Componente separado para que su estado NO se reinicie cuando el padre re-renderiza
function SelectorCategoria({ value, onChange, categorias, onAgregarCategoria }) {
    const [mostrar, setMostrar] = useState(false)
    const [nueva, setNueva] = useState("")
    const inputRef = useRef(null)

    const handleAgregar = () => {
        const limpia = nueva.trim()
        if (!limpia) return
        onAgregarCategoria(limpia)
        setNueva("")
        setMostrar(false)
    }

    const handleToggle = () => {
        setMostrar(v => {
            if (!v) setTimeout(() => inputRef.current?.focus(), 50)
            return !v
        })
    }

    return (
        <div className="form-grupo">
            <label>Categoría</label>
            <div style={{ display: "flex", gap: 6 }}>
                <select value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1 }}>
                    {categorias.map((cat, i) => <option key={i}>{cat}</option>)}
                </select>
                <button
                    type="button"
                    onClick={handleToggle}
                    title="Agregar nueva categoría"
                    style={{
                        all: "unset", cursor: "pointer",
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: mostrar ? "var(--verde-oscuro)" : "var(--verde-claro)",
                        color: mostrar ? "#fff" : "var(--verde-oscuro)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, fontWeight: 700,
                        border: "1.5px solid var(--verde)",
                        transition: "all 0.15s",
                    }}
                >{mostrar ? "✕" : "+"}</button>
            </div>
            {mostrar && (
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ej: Sin azúcar, Navidad..."
                        value={nueva}
                        onChange={e => setNueva(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAgregar()}
                        style={{ flex: 1, fontSize: 13, padding: "7px 10px" }}
                    />
                    <button
                        type="button"
                        onClick={handleAgregar}
                        style={{
                            all: "unset", cursor: "pointer",
                            padding: "7px 14px", borderRadius: 8, flexShrink: 0,
                            background: "var(--verde-oscuro)", color: "#fff",
                            fontSize: 13, fontWeight: 600,
                            display: "flex", alignItems: "center",
                        }}
                    >Agregar</button>
                </div>
            )}
        </div>
    )
}

export default function FormularioRecetas({ form, setForm }) {
    const [categorias, setCategorias] = useState(() => {
        const saved = localStorage.getItem("categorias")
        return saved ? JSON.parse(saved) : ["Sencilla", "Clásica", "Especial", "Premium"]
    })

    useEffect(() => {
        localStorage.setItem("categorias", JSON.stringify(categorias))
    }, [categorias])

    const agregarCategoria = (limpia) => {
        if (categorias.includes(limpia)) return
        const nuevas = [...categorias, limpia]
        setCategorias(nuevas)
        setForm(prev => ({ ...prev, categoria: limpia }))
    }

    const handleFotoFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => setForm(prev => ({ ...prev, fotoBase64: ev.target.result, fotoUrl: "" }))
        reader.readAsDataURL(file)
    }

    const agregarPaso = () =>
        setForm(prev => ({ ...prev, pasos: [...(prev.pasos || []), ""] }))

    const editarPaso = (i, val) => {
        setForm(prev => {
            const pasos = [...(prev.pasos || [])]
            pasos[i] = val
            return { ...prev, pasos }
        })
    }

    const eliminarPaso = (i) =>
        setForm(prev => ({ ...prev, pasos: (prev.pasos || []).filter((_, idx) => idx !== i) }))

    const foto = form.fotoBase64 || form.fotoUrl

    return (
        <div className="card">

            {/* ── Datos básicos ── */}
            <div className="form-fila">
                <div className="form-grupo">
                    <label>Nombre de la receta</label>
                    <input
                        type="text"
                        value={form.nombre}
                        onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Ej: Minidonas San Valentín"
                    />
                </div>

                <SelectorCategoria
                    value={form.categoria}
                    onChange={cat => setForm(prev => ({ ...prev, categoria: cat }))}
                    categorias={categorias}
                    onAgregarCategoria={agregarCategoria}
                />

                <div className="form-grupo">
                    <label>Unidades producidas</label>
                    <input
                        type="number"
                        value={form.unidades}
                        onChange={e => setForm(prev => ({ ...prev, unidades: e.target.value }))}
                        placeholder="Ej: 45"
                    />
                </div>
            </div>

            {/* ── Envío gratis ── */}
            <div style={{ marginTop: 8, marginBottom: 20 }}>
                <label style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    cursor: "pointer", userSelect: "none",
                    padding: "8px 14px", borderRadius: 10,
                    border: `1.5px solid ${form.envioGratis ? "#10b981" : "var(--borde)"}`,
                    background: form.envioGratis ? "#f0fdf4" : "transparent",
                    transition: "all 0.2s"
                }}>
                    <div style={{
                        width: 40, height: 22, borderRadius: 11,
                        background: form.envioGratis ? "#10b981" : "var(--borde)",
                        position: "relative", transition: "background 0.2s", flexShrink: 0
                    }}>
                        <div style={{
                            position: "absolute", top: 3,
                            left: form.envioGratis ? 21 : 3,
                            width: 16, height: 16, borderRadius: "50%",
                            background: "#fff", transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                        }} />
                        <input
                            type="checkbox"
                            checked={!!form.envioGratis}
                            onChange={e => setForm(prev => ({ ...prev, envioGratis: e.target.checked }))}
                            style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                        />
                    </div>
                    <span style={{ fontSize: 14, color: form.envioGratis ? "#059669" : "var(--texto-suave)", fontWeight: form.envioGratis ? 600 : 400 }}>
                        🚚 Esta receta incluye envío gratis
                    </span>
                </label>
                {form.envioGratis && (
                    <p style={{ fontSize: 12, color: "#059669", marginTop: 5, marginLeft: 4 }}>
                        ✅ Al crear un pedido con esta receta, el envío se marcará como gratis automáticamente.
                    </p>
                )}
            </div>

            {/* ── Márgenes ── */}
            <div className="form-fila" style={{ marginBottom: 20 }}>
                <div className="form-grupo">
                    <label>Margen mayoreo (%)</label>
                    <input type="number" value={form.margenMay}
                        onChange={e => setForm(prev => ({ ...prev, margenMay: parseFloat(e.target.value) }))} />
                </div>
                <div className="form-grupo">
                    <label>Margen menudeo (%)</label>
                    <input type="number" value={form.margenMen}
                        onChange={e => setForm(prev => ({ ...prev, margenMen: parseFloat(e.target.value) }))} />
                </div>
            </div>

            {/* ── Foto ── */}
            <div style={{ borderTop: "1px solid var(--gris-borde)", paddingTop: 16, marginBottom: 20 }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", marginBottom: 12, letterSpacing: 0.5 }}>
                    📷 FOTO DE LA RECETA
                </p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
                    {foto && (
                        <div style={{ position: "relative", flexShrink: 0 }}>
                            <img src={foto} alt="foto receta"
                                style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 12, border: "2px solid var(--gris-borde)" }}
                                onError={e => { e.target.style.display = "none" }}
                            />
                            <button type="button"
                                onClick={() => setForm(prev => ({ ...prev, fotoBase64: "", fotoUrl: "" }))}
                                style={{
                                    all: "unset", cursor: "pointer",
                                    position: "absolute", top: -8, right: -8,
                                    background: "#e53e3e", color: "#fff", borderRadius: "50%",
                                    width: 22, height: 22, display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    fontSize: 12, fontWeight: 700,
                                }}>✕</button>
                        </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 200 }}>
                        <label style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "var(--verde-claro)", color: "var(--verde-oscuro)",
                            border: "1.5px dashed var(--verde)", borderRadius: 10,
                            padding: "10px 16px", cursor: "pointer",
                            fontSize: 13, fontWeight: 600,
                        }}>
                            📁 Subir desde dispositivo
                            <input type="file" accept="image/*" onChange={handleFotoFile} style={{ display: "none" }} />
                        </label>
                        <input type="url"
                            placeholder="O pega un link de imagen (https://...)"
                            value={form.fotoUrl || ""}
                            onChange={e => setForm(prev => ({ ...prev, fotoUrl: e.target.value, fotoBase64: "" }))}
                        />
                    </div>
                </div>
            </div>

            {/* ── Condiciones de preparación ── */}
            <div style={{ borderTop: "1px solid var(--gris-borde)", paddingTop: 16, marginBottom: 20 }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", marginBottom: 12, letterSpacing: 0.5 }}>
                    🔧 CONDICIONES DE PREPARACIÓN
                </p>
                <div className="form-fila">
                    <div className="form-grupo">
                        <label>Tipo de equipo</label>
                        <select value={form.equipo || ""} onChange={e => setForm(prev => ({ ...prev, equipo: e.target.value }))}>
                            <option value="">Seleccionar...</option>
                            {EQUIPOS.map(eq => <option key={eq}>{eq}</option>)}
                        </select>
                    </div>
                    <div className="form-grupo">
                        <label>Temperatura (°C)</label>
                        <input type="number" placeholder="Ej: 180"
                            value={form.temperatura || ""}
                            onChange={e => setForm(prev => ({ ...prev, temperatura: e.target.value }))} />
                    </div>
                    <div className="form-grupo">
                        <label>Tiempo de cocción (min)</label>
                        <input type="number" placeholder="Ej: 25"
                            value={form.tiempoCoccion || ""}
                            onChange={e => setForm(prev => ({ ...prev, tiempoCoccion: e.target.value }))} />
                    </div>
                </div>
            </div>

            {/* ── Pasos de elaboración ── */}
            <div style={{ borderTop: "1px solid var(--gris-borde)", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", letterSpacing: 0.5, margin: 0 }}>
                        📋 PASOS DE ELABORACIÓN
                    </p>
                    <button type="button" className="btn-secundario" onClick={agregarPaso}
                        style={{ fontSize: 12, padding: "5px 12px" }}>
                        + Agregar paso
                    </button>
                </div>

                {(!form.pasos || form.pasos.length === 0) && (
                    <p style={{ fontSize: 13, color: "var(--texto-suave)", fontStyle: "italic" }}>
                        Sin pasos aún — hacé clic en "+ Agregar paso" para empezar.
                    </p>
                )}

                {(form.pasos || []).map((paso, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: "var(--verde-claro)", color: "var(--verde-oscuro)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 8,
                        }}>{i + 1}</div>
                        <textarea
                            value={paso}
                            onChange={e => editarPaso(i, e.target.value)}
                            placeholder={`Paso ${i + 1}...`}
                            rows={2}
                            style={{
                                flex: 1, padding: "10px 14px",
                                border: "1.5px solid var(--gris-borde)", borderRadius: 10,
                                fontSize: 14, fontFamily: "inherit", resize: "vertical",
                                outline: "none", color: "var(--texto)", background: "#fff",
                                width: "100%", boxSizing: "border-box",
                            }}
                            onFocus={e => e.target.style.borderColor = "var(--verde)"}
                            onBlur={e => e.target.style.borderColor = "var(--gris-borde)"}
                        />
                        <button type="button" className="btn-peligro" onClick={() => eliminarPaso(i)}
                            style={{ marginTop: 6, padding: "6px 10px" }}>✕</button>
                    </div>
                ))}
            </div>

        </div>
    )
}