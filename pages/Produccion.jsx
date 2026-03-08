import { useState } from "react"

const FORM_INICIAL = {
    fecha: new Date().toISOString().split("T")[0],
    recetaId: "",
    cantidad: "",
    notas: "",
    tipo: "produccion" // "produccion" | "perdida"
}

export default function Produccion({ db, actualizarDb }) {
    const [form, setForm] = useState(FORM_INICIAL)
    const [confirmando, setConfirmando] = useState(null) // id del registro a eliminar

    const produccion = db.produccion || []
    const recetas = db.recetas || []
    const inventario = db.inventario || []

    // ── STOCK DISPONIBLE ──
    const stockPorReceta = recetas.map(receta => {
        const registros = produccion.filter(p => p.recetaId === receta.id)

        const totalProducido = registros
            .filter(p => p.tipo === "produccion")
            .reduce((s, p) => s + (parseInt(p.cantidad) || 0), 0)

        const totalPerdido = registros
            .filter(p => p.tipo === "perdida")
            .reduce((s, p) => s + (parseInt(p.cantidad) || 0), 0)

        const totalVendidoPedidos = (db.pedidos || [])
            .filter(p => p.recetaNombre === receta.nombre && p.estado === "entregado")
            .reduce((s, p) => s + (parseInt(p.cantidad) || 0), 0)

        const totalVendidoManual = (db.ventas || [])
            .filter(v => v.tipo === "manual" && v.recetaId === receta.id)
            .reduce((s, v) => s + (parseInt(v.cantidad) || 0), 0)

        const disponible = totalProducido - totalPerdido - totalVendidoPedidos - totalVendidoManual

        return {
            receta, totalProducido, totalPerdido,
            totalVendidoPedidos, totalVendidoManual, disponible
        }
    }).filter(r => r.totalProducido > 0)

    // ── GUARDAR ──
    const guardar = () => {
        if (!form.recetaId || !form.cantidad) return
        const receta = recetas.find(r => r.id === form.recetaId)
        if (!receta) return

        const cantidad = parseInt(form.cantidad) || 0
        const nuevo = {
            id: crypto.randomUUID(),
            fecha: new Date(form.fecha + "T12:00:00").toISOString(),
            recetaId: form.recetaId,
            recetaNombre: receta.nombre,
            cantidad,
            notas: form.notas,
            tipo: form.tipo
        }

        // Descontar inventario solo si es producción (no pérdida)
        if (form.tipo === "produccion" && inventario.length > 0) {
            const factor = cantidad / (parseInt(receta.unidades) || 1)
            const todosItems = [...(receta.ingredientes || []), ...(receta.insumos || [])]
            const inventarioActualizado = inventario.map(item => {
                const usado = todosItems.find(i =>
                    i.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim()
                )
                if (!usado) return item
                const consumo = (parseFloat(usado.cantidadUso) || 0) * factor
                return {
                    ...item,
                    cantidad: parseFloat(Math.max(0, (parseFloat(item.cantidad) || 0) - consumo).toFixed(2))
                }
            })
            actualizarDb("produccion", [...produccion, nuevo], { inventario: inventarioActualizado })
        } else {
            actualizarDb("produccion", [...produccion, nuevo])
        }

        setForm(FORM_INICIAL)
    }

    const eliminar = (id) => {
        actualizarDb("produccion", produccion.filter(p => p.id !== id))
        setConfirmando(null)
    }

    // ── HISTORIAL AGRUPADO POR FECHA ──
    const historial = produccion
        .slice()
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .reduce((grupos, item) => {
            const fecha = item.fecha.split("T")[0]
            if (!grupos[fecha]) grupos[fecha] = []
            grupos[fecha].push(item)
            return grupos
        }, {})

    const recetaSeleccionada = recetas.find(r => r.id === form.recetaId)

    // Preview de ingredientes que se descontarían
    const previewDescuento = recetaSeleccionada && form.cantidad > 0 ? (() => {
        const factor = parseInt(form.cantidad) / (parseInt(recetaSeleccionada.unidades) || 1)
        const todosItems = [
            ...(recetaSeleccionada.ingredientes || []),
            ...(recetaSeleccionada.insumos || [])
        ]
        return todosItems.map(ing => {
            const consumo = (parseFloat(ing.cantidadUso) || 0) * factor
            const itemInv = inventario.find(i =>
                i.nombre.toLowerCase().trim() === ing.nombre.toLowerCase().trim()
            )
            const stockActual = parseFloat(itemInv?.cantidad || 0)
            const alcanza = stockActual >= consumo
            return { nombre: ing.nombre, consumo, unidad: ing.unidadUso, stockActual, alcanza }
        })
    })() : []

    const hayStockInsuficiente = previewDescuento.some(i => !i.alcanza)

    return (
        <div>
            <h2 className="page-titulo">🏭 Producción</h2>

            {/* ── STOCK DISPONIBLE ── */}
            {stockPorReceta.length > 0 && (
                <div className="card">
                    <h3 className="seccion-titulo" style={{ marginTop: 0 }}>📦 Stock de producto terminado</h3>
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Producido</th>
                                    <th>Pérdidas</th>
                                    <th>Vendido pedidos</th>
                                    <th>Vendido suelto</th>
                                    <th>Disponible</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockPorReceta.map(({ receta, totalProducido, totalPerdido, totalVendidoPedidos, totalVendidoManual, disponible }) => (
                                    <tr key={receta.id}>
                                        <td><strong>{receta.nombre}</strong></td>
                                        <td>{totalProducido}</td>
                                        <td style={{ color: totalPerdido > 0 ? "#ef4444" : "var(--texto-suave)" }}>
                                            {totalPerdido > 0 ? `⚠️ ${totalPerdido}` : "—"}
                                        </td>
                                        <td style={{ color: "var(--texto-suave)" }}>{totalVendidoPedidos || "—"}</td>
                                        <td style={{ color: "var(--texto-suave)" }}>{totalVendidoManual || "—"}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 700,
                                                color: disponible <= 0 ? "#ef4444" : disponible <= 5 ? "#f59e0b" : "#10b981"
                                            }}>
                                                {disponible <= 0 ? "🔴 Agotado" : `🟢 ${disponible} unid.`}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── FORMULARIO ── */}
            <div className="card">
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>➕ Registrar</h3>

                {/* Tipo: producción o pérdida */}
                <div className="form-grupo">
                    <div style={{ display: "flex", gap: 8 }}>
                        {[
                            { valor: "produccion", label: "🍩 Producción", color: "#10b981" },
                            { valor: "perdida", label: "⚠️ Pérdida / Dañado", color: "#ef4444" }
                        ].map(({ valor, label, color }) => (
                            <button key={valor} type="button"
                                onClick={() => setForm({ ...form, tipo: valor })}
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
                            onChange={e => setForm({ ...form, fecha: e.target.value })} />
                    </div>
                    <div className="form-grupo">
                        <label>Cantidad *</label>
                        <input type="number" min="1" placeholder="Ej: 24"
                            value={form.cantidad}
                            onChange={e => setForm({ ...form, cantidad: e.target.value })} />
                    </div>
                </div>

                <div className="form-grupo">
                    <label>Producto (receta) *</label>
                    <select value={form.recetaId}
                        onChange={e => setForm({ ...form, recetaId: e.target.value })}>
                        <option value="">— Seleccionar —</option>
                        {recetas.map(r => (
                            <option key={r.id} value={r.id}>{r.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="form-grupo">
                    <label>Notas (opcional)</label>
                    <input type="text"
                        placeholder={form.tipo === "perdida" ? "Ej: Se cayeron, horno muy caliente..." : "Ej: Para feria del sábado..."}
                        value={form.notas}
                        onChange={e => setForm({ ...form, notas: e.target.value })} />
                </div>

                {/* Preview descuento inventario */}
                {form.tipo === "produccion" && previewDescuento.length > 0 && (
                    <div style={{
                        padding: "10px 12px", borderRadius: 8, marginBottom: 12,
                        background: hayStockInsuficiente ? "#fef2f2" : "#f0fdf4",
                        border: `1px solid ${hayStockInsuficiente ? "#fca5a5" : "#86efac"}`
                    }}>
                        <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5,
                            color: hayStockInsuficiente ? "#dc2626" : "#16a34a" }}>
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

                <button className="btn-primario" type="button" onClick={guardar}
                    style={{ background: form.tipo === "perdida" ? "#ef4444" : undefined }}>
                    {form.tipo === "perdida" ? "⚠️ Registrar pérdida" : "💾 Registrar producción"}
                </button>
            </div>

            {/* ── HISTORIAL ── */}
            {Object.keys(historial).length > 0 && (
                <div className="card">
                    <h3 className="seccion-titulo" style={{ marginTop: 0 }}>📋 Historial</h3>
                    {Object.entries(historial).map(([fecha, items]) => (
                        <div key={fecha} style={{ marginBottom: 16 }}>
                            <p style={{
                                fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                                color: "var(--texto-suave)", marginBottom: 8
                            }}>
                                📅 {new Date(fecha + "T12:00:00").toLocaleDateString("es-CR", {
                                    weekday: "long", day: "numeric", month: "long"
                                }).toUpperCase()}
                            </p>
                            {items.map(item => (
                                <div key={item.id} style={{
                                    display: "flex", justifyContent: "space-between",
                                    alignItems: "center", padding: "8px 0",
                                    borderBottom: "1px solid var(--borde)", fontSize: 14
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span>{item.tipo === "perdida" ? "⚠️" : "🍩"}</span>
                                        <strong>{item.recetaNombre}</strong>
                                        <span style={{
                                            background: item.tipo === "perdida" ? "#fef2f2" : "var(--fondo)",
                                            color: item.tipo === "perdida" ? "#dc2626" : "var(--texto-suave)",
                                            padding: "1px 8px", borderRadius: 10, fontSize: 12
                                        }}>
                                            {item.tipo === "perdida" ? "-" : "+"}{item.cantidad} unid.
                                        </span>
                                        {item.notas && (
                                            <span style={{ fontSize: 12, color: "var(--texto-suave)", fontStyle: "italic" }}>
                                                — {item.notas}
                                            </span>
                                        )}
                                    </div>

                                    {confirmando === item.id ? (
                                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                            <span style={{ fontSize: 12, color: "#ef4444" }}>¿Eliminar?</span>
                                            <button type="button" onClick={() => eliminar(item.id)}
                                                style={{ padding: "3px 10px", borderRadius: 6, border: "none",
                                                    background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 12 }}>
                                                Sí
                                            </button>
                                            <button type="button" onClick={() => setConfirmando(null)}
                                                style={{ padding: "3px 10px", borderRadius: 6,
                                                    border: "1px solid var(--borde)", background: "none",
                                                    cursor: "pointer", fontSize: 12 }}>
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setConfirmando(item.id)}
                                            style={{ background: "none", border: "none", color: "#ef4444",
                                                cursor: "pointer", fontSize: 16 }}>
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {recetas.length === 0 && (
                <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                    <p style={{ fontSize: 40 }}>🏭</p>
                    <p>Primero creá recetas para poder registrar producción.</p>
                </div>
            )}

            {recetas.length > 0 && produccion.length === 0 && (
                <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                    <p style={{ fontSize: 40 }}>🍩</p>
                    <p>Registrá lo que producís cada día.</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>
                        Al registrar producción se descuentan automáticamente los ingredientes del inventario.
                    </p>
                </div>
            )}
        </div>
    )
}