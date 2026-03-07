import { useState } from "react"

const VENTA_INICIAL = {
    cliente: "",
    descripcion: "",
    cantidad: "",
    total: "",
    metodoPago: "SINPE",
    fecha: new Date().toISOString().split("T")[0]
}

export default function Ventas({ db, actualizarDb }) {
    const [mostrarForm, setMostrarForm] = useState(false)
    const [form, setForm] = useState(VENTA_INICIAL)

    const ventas = db.ventas || []
    const ventasAutomaticas = ventas.filter(v => v.tipo === "pedido")
    const ventasManuales = ventas.filter(v => v.tipo === "manual")

    // ── GASTOS FIJOS proporcionales ──
    const gastosFijos = db.gastosFijos || []
    const totalGastosMensuales = gastosFijos.reduce((s, g) => {
        const m = parseFloat(g.monto) || 0
        if (g.frecuencia === "semanal") return s + m * 4
        if (g.frecuencia === "anual") return s + m / 12
        return s + m
    }, 0)

    // Pedidos del mes actual para saber cuántos pedidos absorben los gastos
    const ahora = new Date()
    const ventasEsteMes = ventas.filter(v => {
        const f = new Date(v.fecha)
        return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear()
    })
    const gastoPorVenta = ventasEsteMes.length > 0 ? totalGastosMensuales / ventasEsteMes.length : 0

    // Costo de ingredientes de un pedido usando la receta
    const costoIngredientesPedido = (venta) => {
        if (venta.tipo !== "pedido") return 0
        const pedido = (db.pedidos || []).find(p => p.id === venta.pedidoId)
        const receta = (db.recetas || []).find(r => r.nombre === venta.recetaNombre)
        if (!receta || !pedido) return 0
        const factor = (parseInt(pedido.cantidad) || 0) / (parseInt(receta.unidades) || 1)
        const costoIng = (receta.ingredientes || []).reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
        const costoIns = (receta.insumos || []).reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
        return (costoIng + costoIns) * factor
    }

    // Totales
    const totalMes = ventasEsteMes.reduce((s, v) => s + parseFloat(v.total || 0), 0)
    const totalGeneral = ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0)

    const gananciaNeta = ventasEsteMes.reduce((s, v) => {
        const ingreso = parseFloat(v.total || 0)
        const costo = costoIngredientesPedido(v)
        const gastos = gastoPorVenta
        return s + ingreso - costo - gastos
    }, 0)

    const guardarVentaManual = () => {
        if (!form.descripcion || !form.total) return
        actualizarDb("ventas", [...ventas, {
            id: crypto.randomUUID(),
            ...form,
            cantidad: form.cantidad || 1,
            total: parseFloat(form.total) || 0,
            tipo: "manual",
            fecha: new Date(form.fecha + "T12:00:00").toISOString()
        }])
        setForm(VENTA_INICIAL)
        setMostrarForm(false)
    }

    const eliminarVentaManual = (id) => {
        if (!window.confirm("¿Eliminar esta venta?")) return
        actualizarDb("ventas", ventas.filter(v => v.id !== id))
    }

    const formatFecha = (iso) => new Date(iso).toLocaleDateString("es-CR", {
        day: "numeric", month: "short", year: "numeric"
    })

    return (
        <div>
            <h2 className="page-titulo">💰 Ventas</h2>

            {/* ── RESUMEN DEL MES ── */}
            <div className="card">
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>📅 Este mes</h3>
                <div className="resumen-grid">
                    <div className="resumen-item" style={{ borderLeft: "3px solid var(--acento)" }}>
                        <div className="valor">₡{totalMes.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                        <div className="etiqueta">💰 Ingresos</div>
                    </div>
                    <div className="resumen-item" style={{ borderLeft: "3px solid #ef4444" }}>
                        <div className="valor">₡{totalGastosMensuales.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                        <div className="etiqueta">💡 Gastos fijos</div>
                    </div>
                    <div className="resumen-item" style={{ borderLeft: "3px solid #10b981" }}>
                        <div className="valor" style={{ color: gananciaNeta >= 0 ? "#10b981" : "#ef4444" }}>
                            ₡{gananciaNeta.toLocaleString("es-CR", { maximumFractionDigits: 0 })}
                        </div>
                        <div className="etiqueta">✨ Ganancia neta</div>
                    </div>
                    <div className="resumen-item" style={{ borderLeft: "3px solid #6366f1" }}>
                        <div className="valor">₡{totalGeneral.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                        <div className="etiqueta">📊 Total histórico</div>
                    </div>
                </div>

                {totalGastosMensuales > 0 && ventasEsteMes.length > 0 && (
                    <div style={{
                        marginTop: 12, padding: "8px 12px",
                        background: "var(--fondo)", borderRadius: 8, fontSize: 13,
                        color: "var(--texto-suave)"
                    }}>
                        💡 Los gastos fijos de ₡{totalGastosMensuales.toLocaleString()} se dividen entre {ventasEsteMes.length} venta{ventasEsteMes.length !== 1 ? "s" : ""} del mes
                        → <strong>₡{gastoPorVenta.toLocaleString("es-CR", { maximumFractionDigits: 0 })} por venta</strong>
                    </div>
                )}
                {totalGastosMensuales === 0 && (
                    <p style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 8 }}>
                        💡 Agregá gastos fijos en Reportes para ver la ganancia neta real.
                    </p>
                )}
            </div>

            {/* ── VENTAS DE PEDIDOS (automáticas) ── */}
            <div className="card">
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>✅ Ventas de pedidos entregados</h3>
                {ventasAutomaticas.length === 0 ? (
                    <p style={{ color: "var(--texto-suave)", fontSize: 14 }}>
                        Aquí aparecen automáticamente los pedidos que marqués como entregados.
                    </p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Receta</th>
                                    <th>Cant.</th>
                                    <th>Costo prod.</th>
                                    <th>Gastos fijos</th>
                                    <th>Total</th>
                                    <th>Ganancia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventasAutomaticas
                                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                                    .map(v => {
                                        const costo = costoIngredientesPedido(v)
                                        const ganancia = parseFloat(v.total || 0) - costo - gastoPorVenta
                                        return (
                                            <tr key={v.id}>
                                                <td style={{ color: "var(--texto-suave)", fontSize: 13 }}>{formatFecha(v.fecha)}</td>
                                                <td><strong>{v.cliente}</strong></td>
                                                <td>{v.recetaNombre}</td>
                                                <td>{v.cantidad}</td>
                                                <td style={{ color: "#ef4444", fontSize: 13 }}>
                                                    {costo > 0 ? `₡${costo.toLocaleString("es-CR", { maximumFractionDigits: 0 })}` : "—"}
                                                </td>
                                                <td style={{ color: "#f59e0b", fontSize: 13 }}>
                                                    {gastoPorVenta > 0 ? `₡${gastoPorVenta.toLocaleString("es-CR", { maximumFractionDigits: 0 })}` : "—"}
                                                </td>
                                                <td style={{ fontWeight: 700 }}>
                                                    ₡{parseFloat(v.total || 0).toLocaleString()}
                                                </td>
                                                <td style={{ fontWeight: 700, color: ganancia >= 0 ? "#10b981" : "#ef4444" }}>
                                                    ₡{ganancia.toLocaleString("es-CR", { maximumFractionDigits: 0 })}
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── VENTAS SUELTAS (manuales) ── */}
            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="seccion-titulo" style={{ margin: 0 }}>🏪 Ventas espontáneas</h3>
                    <button className="btn-secundario" type="button"
                        onClick={() => setMostrarForm(v => !v)} style={{ fontSize: 13 }}>
                        {mostrarForm ? "✕ Cancelar" : "+ Registrar venta"}
                    </button>
                </div>

                {mostrarForm && (
                    <div style={{ marginBottom: 16, padding: 12, background: "var(--fondo)", borderRadius: 10 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div className="form-grupo" style={{ margin: 0 }}>
                                <label>Fecha</label>
                                <input type="date" value={form.fecha}
                                    onChange={e => setForm({ ...form, fecha: e.target.value })} />
                            </div>
                            <div className="form-grupo" style={{ margin: 0 }}>
                                <label>Cliente (opcional)</label>
                                <input type="text" placeholder="Nombre o anónimo"
                                    value={form.cliente}
                                    onChange={e => setForm({ ...form, cliente: e.target.value })} />
                            </div>
                            <div className="form-grupo" style={{ margin: 0, gridColumn: "1/-1" }}>
                                <label>Descripción *</label>
                                <input type="text" placeholder="Ej: 6 galletas decoradas, 1 queque..."
                                    value={form.descripcion}
                                    onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                            </div>
                            <div className="form-grupo" style={{ margin: 0 }}>
                                <label>Cantidad</label>
                                <input type="number" placeholder="1" value={form.cantidad}
                                    onChange={e => setForm({ ...form, cantidad: e.target.value })} />
                            </div>
                            <div className="form-grupo" style={{ margin: 0 }}>
                                <label>Total (₡) *</label>
                                <input type="number" placeholder="0" value={form.total}
                                    onChange={e => setForm({ ...form, total: e.target.value })} />
                            </div>
                            <div className="form-grupo" style={{ margin: 0 }}>
                                <label>Método de pago</label>
                                <select value={form.metodoPago}
                                    onChange={e => setForm({ ...form, metodoPago: e.target.value })}>
                                    <option value="SINPE">SINPE</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                </select>
                            </div>
                        </div>
                        <button className="btn-primario" type="button" onClick={guardarVentaManual}
                            style={{ marginTop: 12 }}>
                            💾 Guardar venta
                        </button>
                    </div>
                )}

                {ventasManuales.length === 0 ? (
                    <p style={{ color: "var(--texto-suave)", fontSize: 14 }}>
                        Ferias, encargos rápidos, ventas en efectivo que no vienen de un pedido formal.
                    </p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Descripción</th>
                                    <th>Cliente</th>
                                    <th>Método</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventasManuales
                                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                                    .map(v => (
                                        <tr key={v.id}>
                                            <td style={{ color: "var(--texto-suave)", fontSize: 13 }}>{formatFecha(v.fecha)}</td>
                                            <td><strong>{v.descripcion}</strong></td>
                                            <td>{v.cliente || "—"}</td>
                                            <td style={{ fontSize: 13 }}>{v.metodoPago}</td>
                                            <td style={{ fontWeight: 700, color: "var(--verde-oscuro)" }}>
                                                ₡{parseFloat(v.total || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                <button type="button" onClick={() => eliminarVentaManual(v.id)}
                                                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {ventas.length === 0 && (
                <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                    <p style={{ fontSize: 40 }}>💰</p>
                    <p>Aún no hay ventas registradas.</p>
                    <p style={{ fontSize: 13 }}>Las ventas aparecen automáticamente al entregar pedidos, o podés agregar ventas sueltas arriba.</p>
                </div>
            )}
        </div>
    )
}