import { useState } from "react"
import { UNIDADES_USO, UNIDADES_PAQUETE } from "../../data/conversiones"

function CampoInventario({ valor, onChange, inventario, placeholder, onSeleccionar }) {
    const [sugerencias, setSugerencias] = useState([])
    const [mostrar, setMostrar] = useState(false)

    const handleChange = (texto) => {
        onChange(texto)
        if (texto.length < 1) { setSugerencias([]); setMostrar(false); return }
        const found = inventario.filter(i =>
            i.tipo === "insumo" &&
            i.nombre.toLowerCase().includes(texto.toLowerCase())
        )
        setSugerencias(found)
        setMostrar(true)
    }

    return (
        <div style={{ position: "relative" }}>
            <input type="text" value={valor}
                onChange={e => handleChange(e.target.value)}
                onBlur={() => setTimeout(() => setMostrar(false), 150)}
                placeholder={placeholder} />
            {mostrar && sugerencias.length > 0 && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                    background: "#fff", border: "1.5px solid var(--borde)",
                    borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    maxHeight: 180, overflowY: "auto"
                }}>
                    {sugerencias.map(item => (
                        <div key={item._id}
                            onMouseDown={e => { e.preventDefault(); onSeleccionar(item); setMostrar(false) }}
                            style={{ padding: "8px 12px", cursor: "pointer", fontSize: 14 }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--fondo)"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                            {item.nombre}
                            <span style={{ fontSize: 12, color: "var(--texto-suave)", marginLeft: 8 }}>
                                {item.cantidad}{item.unidad}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function FormularioProduccion({
    form, setForm, recetas,
    insumoForm, setInsumoForm,
    inventario,
    previewDescuento, hayStockInsuficiente,
    costoInsumos, costoRecetaAjustado, costoTotalProduccion,
    recetaSeleccionada,
    onGuardar, onAgregarInsumo, onEliminarInsumo,
}) {
    return (
        <div className="card">
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>➕ Registrar</h3>

            {/* ── TIPO ── */}
            <div className="form-grupo">
                <div style={{ display: "flex", gap: 8 }}>
                    {[
                        { valor: "produccion", label: "🍩 Producción", color: "#10b981" },
                        { valor: "perdida", label: "⚠️ Pérdida / Dañado", color: "#ef4444" }
                    ].map(({ valor, label, color }) => (
                        <button key={valor} type="button"
                            onClick={() => setForm(f => ({ ...f, tipo: valor }))}
                            style={{
                                flex: 1, padding: "8px 0", borderRadius: 8,
                                border: `2px solid ${form.tipo === valor ? color : "var(--borde)"}`,
                                background: form.tipo === valor ? color : "transparent",
                                color: form.tipo === valor ? "#fff" : "var(--texto-suave)",
                                cursor: "pointer", fontSize: 13, fontWeight: 600,
                                transition: "all 0.15s"
                            }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-grupo">
                    <label>Fecha</label>
                    <input type="date" value={form.fecha}
                        onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                </div>
                <div className="form-grupo">
                    <label>Cantidad *</label>
                    <input type="number" min="1" placeholder="Ej: 24"
                        value={form.cantidad}
                        onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
                </div>
            </div>

            <div className="form-grupo">
                <label>Producto (receta) *</label>
                <select value={form.recetaId}
                    onChange={e => setForm(f => ({ ...f, recetaId: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {recetas.map(r => (
                        <option key={r._id} value={r._id}>{r.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="form-grupo">
                <label>Notas (opcional)</label>
                <input type="text"
                    placeholder={form.tipo === "perdida" ? "Ej: Se cayeron, horno muy caliente..." : "Ej: Para feria del sábado..."}
                    value={form.notas}
                    onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
            </div>

            {/* ── PREVIEW DESCUENTO INGREDIENTES ── */}
            {form.tipo === "produccion" && previewDescuento.length > 0 && (
                <div style={{
                    padding: "10px 12px", borderRadius: 8, marginBottom: 12,
                    background: hayStockInsuficiente ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${hayStockInsuficiente ? "#fca5a5" : "#86efac"}`
                }}>
                    <p style={{
                        fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5,
                        color: hayStockInsuficiente ? "#dc2626" : "#16a34a"
                    }}>
                        {hayStockInsuficiente ? "⚠️ STOCK INSUFICIENTE" : "✅ SE DESCONTARÁ DEL INVENTARIO"}
                    </p>
                    {previewDescuento.map((i, idx) => (
                        <div key={idx} style={{
                            display: "flex", justifyContent: "space-between",
                            fontSize: 13, padding: "2px 0",
                            color: i.alcanza ? "var(--texto-suave)" : "#dc2626"
                        }}>
                            <span>{i.nombre}</span>
                            <span>
                                {i.consumo.toFixed(1)}{i.unidad}
                                {!i.alcanza && ` (solo hay ${i.stockActual.toFixed(1)})`}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── INSUMOS DE EMPAQUE (solo producción) ── */}
            {form.tipo === "produccion" && recetaSeleccionada && (
                <div style={{ borderTop: "1px solid var(--borde)", paddingTop: 16, marginBottom: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", letterSpacing: 0.5, marginBottom: 12 }}>
                        📦 INSUMOS DE EMPAQUE
                    </p>

                    {/* Formulario insumo */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        <div style={{ flex: 2, minWidth: 150 }}>
                            <CampoInventario
                                valor={insumoForm.nombre}
                                onChange={v => setInsumoForm(f => ({ ...f, nombre: v }))}
                                inventario={inventario}
                                placeholder="Buscar insumo..."
                                onSeleccionar={item => setInsumoForm(f => ({
                                    ...f,
                                    nombre: item.nombre,
                                    cantidadPaquete: item.tamañoPaquete || "",
                                    unidadPaquete: item.unidad || "unidad",
                                    precioPaquete: item.costoPorPaquete || ""
                                }))}
                            />
                        </div>
                        <input type="number" placeholder="Cant." value={insumoForm.cantidadUso}
                            onChange={e => setInsumoForm(f => ({ ...f, cantidadUso: e.target.value }))}
                            style={{ width: 70 }} />
                        <select value={insumoForm.unidadUso}
                            onChange={e => setInsumoForm(f => ({ ...f, unidadUso: e.target.value }))}
                            style={{ width: 90 }}>
                            {UNIDADES_USO.map(u => <option key={u}>{u}</option>)}
                        </select>
                        <button type="button" className="btn-secundario"
                            onClick={onAgregarInsumo} style={{ fontSize: 13 }}>
                            + Agregar
                        </button>
                    </div>

                    {/* Lista insumos agregados */}
                    {form.insumos.length > 0 && (
                        <div>
                            {form.insumos.map(ins => (
                                <div key={ins.id} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "6px 10px", background: "var(--fondo)", borderRadius: 8,
                                    marginBottom: 5, fontSize: 13
                                }}>
                                    <span>📦 <strong>{ins.nombre}</strong> — {ins.cantidadUso} {ins.unidadUso}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span style={{ color: "var(--texto-suave)" }}>₡{parseFloat(ins.costoParcial || 0).toFixed(0)}</span>
                                        <button type="button" onClick={() => onEliminarInsumo(ins.id)}
                                            style={{ all: "unset", cursor: "pointer", color: "#ef4444", fontWeight: 700 }}>✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Resumen de costos */}
                    {(costoRecetaAjustado > 0 || costoInsumos > 0) && (
                        <div style={{
                            marginTop: 12, padding: "10px 14px",
                            background: "#e8f8f5", borderRadius: 10,
                            borderLeft: "3px solid var(--acento)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                                <span style={{ color: "var(--texto-suave)" }}>🧁 Costo receta</span>
                                <span>₡{costoRecetaAjustado.toFixed(0)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                                <span style={{ color: "var(--texto-suave)" }}>📦 Costo insumos</span>
                                <span>₡{costoInsumos.toFixed(0)}</span>
                            </div>
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                fontSize: 14, fontWeight: 700,
                                borderTop: "1px solid #2ec4a9", paddingTop: 6, marginTop: 4
                            }}>
                                <span>💰 Costo total producción</span>
                                <span style={{ color: "var(--verde-oscuro)" }}>₡{costoTotalProduccion.toFixed(0)}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button className="btn-primario" type="button" onClick={onGuardar}
                style={{ background: form.tipo === "perdida" ? "#ef4444" : undefined }}>
                {form.tipo === "perdida" ? "⚠️ Registrar pérdida" : "💾 Registrar producción"}
            </button>
        </div>
    )
}