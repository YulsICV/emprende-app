function Metrica({ valor, etiqueta, color, icono }) {
    return (
        <div className="resumen-item" style={{ borderLeft: `3px solid ${color || "var(--acento)"}` }}>
            <div className="valor" style={{ color: color || "inherit" }}>{valor}</div>
            <div className="etiqueta">{icono} {etiqueta}</div>
        </div>
    )
}

import { useState } from "react"

export default function Reportes({ db, actualizarDb }) {
    const [mostrarFormGasto, setMostrarFormGasto] = useState(false)
    const [gastoForm, setGastoForm] = useState({ nombre: "", monto: "", frecuencia: "mensual" })

    const gastosFijos = db.gastosFijos || []

    const guardarGasto = () => {
        if (!gastoForm.nombre || !gastoForm.monto) return
        const nuevo = { ...gastoForm, id: crypto.randomUUID(), fecha: new Date().toISOString() }
        actualizarDb("gastosFijos", [...gastosFijos, nuevo])
        setGastoForm({ nombre: "", monto: "", frecuencia: "mensual" })
        setMostrarFormGasto(false)
    }

    const eliminarGasto = (id) => actualizarDb("gastosFijos", gastosFijos.filter(g => g.id !== id))

    const totalGastosMensuales = gastosFijos.reduce((s, g) => {
        const m = parseFloat(g.monto) || 0
        if (g.frecuencia === "mensual") return s + m
        if (g.frecuencia === "semanal") return s + m * 4
        if (g.frecuencia === "anual") return s + m / 12
        return s + m
    }, 0)

    const pedidos = db.pedidos || []
    const ventas = db.ventas || []
    const clientes = db.clientes || []
    const recetas = db.recetas || []
    const inventario = db.inventario || []

    // ── MÉTRICAS PEDIDOS ──
    const pedidosPendientes = pedidos.filter(p => p.estado === "pendiente")
    const pedidosProceso = pedidos.filter(p => p.estado === "en proceso")
    const pedidosEntregados = pedidos.filter(p => p.estado === "entregado")

    const ingresosPedidos = pedidosEntregados.reduce((s, p) => s + (parseFloat(p.total) || 0), 0)
    const anticiposPendientes = pedidos
        .filter(p => p.estado !== "entregado")
        .reduce((s, p) => s + (parseFloat(p.anticipo) || 0), 0)
    const saldosPorCobrar = pedidos
        .filter(p => p.estado !== "entregado")
        .reduce((s, p) => s + (parseFloat(p.saldoPendiente) || 0), 0)

    // ── RECETAS MÁS PEDIDAS ──
    const conteoRecetas = {}
    pedidos.forEach(p => {
        conteoRecetas[p.recetaNombre] = (conteoRecetas[p.recetaNombre] || 0) + (parseInt(p.cantidad) || 0)
    })
    const topRecetas = Object.entries(conteoRecetas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    // ── PEDIDOS POR MES (últimos 6) ──
    const pedidosPorMes = {}
    const ahora = new Date()
    for (let i = 5; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        const key = d.toLocaleDateString("es-CR", { month: "short", year: "2-digit" })
        pedidosPorMes[key] = 0
    }
    pedidos.forEach(p => {
        if (!p.fecha) return
        const d = new Date(p.fecha)
        const key = d.toLocaleDateString("es-CR", { month: "short", year: "2-digit" })
        if (key in pedidosPorMes) pedidosPorMes[key]++
    })
    const maxPedidosMes = Math.max(...Object.values(pedidosPorMes), 1)

    // ── CLIENTES TOP ──
    const gastoCliente = {}
    pedidos.forEach(p => {
        gastoCliente[p.cliente] = (gastoCliente[p.cliente] || 0) + (parseFloat(p.total) || 0)
    })
    const topClientes = Object.entries(gastoCliente)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    // ── INVENTARIO EN ALERTA ──
    const itemsBajoStock = inventario.filter(item =>
        item.alertaMinima && parseFloat(item.cantidad) <= parseFloat(item.alertaMinima)
    )

    return (
        <div>
            <h2 className="page-titulo">📊 Reportes</h2>

            {/* ── ESTADO DE PEDIDOS ── */}
            <div className="card">
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>Estado de pedidos</h3>
                <div className="resumen-grid">
                    <Metrica valor={pedidosPendientes.length} etiqueta="Pendientes" icono="🕐" color="#f59e0b" />
                    <Metrica valor={pedidosProceso.length} etiqueta="En proceso" icono="⚙️" color="#3b82f6" />
                    <Metrica valor={pedidosEntregados.length} etiqueta="Entregados" icono="✅" color="#10b981" />
                    <Metrica valor={pedidos.length} etiqueta="Total" icono="🛒" />
                </div>
            </div>

            {/* ── FINANZAS ── */}
            <div className="card">
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>Finanzas</h3>
                <div className="resumen-grid">
                    <Metrica valor={`₡${ingresosPedidos.toLocaleString()}`} etiqueta="Ingresos cobrados" icono="💰" color="#10b981" />
                    <Metrica valor={`₡${anticiposPendientes.toLocaleString()}`} etiqueta="Anticipos recibidos" icono="🤝" color="#6366f1" />
                    <Metrica valor={`₡${saldosPorCobrar.toLocaleString()}`} etiqueta="Por cobrar" icono="📋" color="#f59e0b" />
                </div>
            </div>

            {/* ── PEDIDOS POR MES ── */}
            {pedidos.length > 0 && (
                <div className="card">
                    <h3 className="seccion-titulo" style={{ marginTop: 0 }}>Pedidos por mes</h3>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, paddingBottom: 4 }}>
                        {Object.entries(pedidosPorMes).map(([mes, cantidad]) => (
                            <div key={mes} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <span style={{ fontSize: 11, color: "var(--texto-suave)", fontWeight: 600 }}>
                                    {cantidad > 0 ? cantidad : ""}
                                </span>
                                <div style={{
                                    width: "100%",
                                    height: `${Math.max(4, (cantidad / maxPedidosMes) * 80)}px`,
                                    background: "var(--acento)",
                                    borderRadius: "4px 4px 0 0",
                                    opacity: cantidad === 0 ? 0.2 : 1,
                                    transition: "height 0.3s"
                                }} />
                                <span style={{ fontSize: 10, color: "var(--texto-suave)", textAlign: "center" }}>{mes}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── TOP RECETAS ── */}
            {topRecetas.length > 0 && (
                <div className="card">
                    <h3 className="seccion-titulo" style={{ marginTop: 0 }}>🍩 Recetas más pedidas</h3>
                    {topRecetas.map(([nombre, cantidad], i) => (
                        <div key={nombre} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <span style={{
                                width: 24, height: 24, borderRadius: "50%", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                background: i === 0 ? "#fbbf24" : i === 1 ? "#d1d5db" : i === 2 ? "#cd7c3f" : "var(--fondo)",
                                fontSize: 12, fontWeight: 700, flexShrink: 0
                            }}>
                                {i + 1}
                            </span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                    <span style={{ fontSize: 14 }}>{nombre}</span>
                                    <span style={{ fontSize: 13, color: "var(--texto-suave)" }}>{cantidad} unid.</span>
                                </div>
                                <div style={{ height: 4, background: "var(--borde)", borderRadius: 2 }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${(cantidad / topRecetas[0][1]) * 100}%`,
                                        background: "var(--acento)",
                                        borderRadius: 2
                                    }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── TOP CLIENTES ── */}
            {topClientes.length > 0 && (
                <div className="card">
                    <h3 className="seccion-titulo" style={{ marginTop: 0 }}>⭐ Mejores clientes</h3>
                    {topClientes.map(([nombre, total], i) => (
                        <div key={nombre} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "8px 0", borderBottom: i < topClientes.length - 1 ? "1px solid var(--borde)" : "none"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 18 }}>
                                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👤"}
                                </span>
                                <span>{nombre}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: "var(--acento)" }}>
                                ₡{total.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── INVENTARIO EN ALERTA ── */}
            {itemsBajoStock.length > 0 && (
                <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
                    <h3 className="seccion-titulo" style={{ marginTop: 0, color: "#d97706" }}>
                        ⚠️ Inventario con stock bajo ({itemsBajoStock.length})
                    </h3>
                    {itemsBajoStock.map(item => (
                        <div key={item.id} style={{
                            display: "flex", justifyContent: "space-between",
                            padding: "6px 0", borderBottom: "1px solid var(--borde)", fontSize: 14
                        }}>
                            <span>{item.nombre}</span>
                            <span style={{ color: "#d97706", fontWeight: 600 }}>
                                {item.cantidad} {item.unidad} (mín. {item.alertaMinima})
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── RESUMEN GENERAL ── */}
            <div className="card">
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>Resumen general</h3>
                <div className="resumen-grid">
                    <Metrica valor={clientes.length} etiqueta="Clientes" icono="👥" />
                    <Metrica valor={recetas.length} etiqueta="Recetas" icono="🍩" />
                    <Metrica valor={inventario.length} etiqueta="Items inventario" icono="📦" />
                </div>
            </div>

            {pedidos.length === 0 && ventas.length === 0 && (
                <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                    <p style={{ fontSize: 40 }}>📊</p>
                    <p>Aún no hay datos suficientes para mostrar reportes.</p>
                    <p style={{ fontSize: 13 }}>Empieza agregando pedidos y clientes.</p>
                </div>
            )}

            {/* ── GASTOS FIJOS MENSUALES ── */}
            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="seccion-titulo" style={{ margin: 0 }}>💡 Gastos fijos del negocio</h3>
                    <button
                        type="button"
                        className="btn-secundario"
                        onClick={() => setMostrarFormGasto(v => !v)}
                        style={{ fontSize: 13 }}
                    >
                        {mostrarFormGasto ? "✕ Cancelar" : "+ Agregar gasto"}
                    </button>
                </div>

                {mostrarFormGasto && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 16, alignItems: "flex-end" }}>
                        <div className="form-grupo" style={{ margin: 0 }}>
                            <label>Gasto</label>
                            <input type="text" placeholder="Ej: Gas, Luz, Internet..."
                                value={gastoForm.nombre}
                                onChange={e => setGastoForm({ ...gastoForm, nombre: e.target.value })} />
                        </div>
                        <div className="form-grupo" style={{ margin: 0 }}>
                            <label>Monto (₡)</label>
                            <input type="number" placeholder="0"
                                value={gastoForm.monto}
                                onChange={e => setGastoForm({ ...gastoForm, monto: e.target.value })} />
                        </div>
                        <div className="form-grupo" style={{ margin: 0 }}>
                            <label>Frecuencia</label>
                            <select value={gastoForm.frecuencia}
                                onChange={e => setGastoForm({ ...gastoForm, frecuencia: e.target.value })}>
                                <option value="semanal">Semanal</option>
                                <option value="mensual">Mensual</option>
                                <option value="anual">Anual</option>
                            </select>
                        </div>
                        <button className="btn-primario" type="button" onClick={guardarGasto}
                            style={{ height: 38, whiteSpace: "nowrap" }}>
                            💾 Guardar
                        </button>
                    </div>
                )}

                {gastosFijos.length > 0 ? (
                    <>
                        {gastosFijos.map(g => (
                            <div key={g.id} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "8px 0", borderBottom: "1px solid var(--borde)", fontSize: 14
                            }}>
                                <div>
                                    <span style={{ fontWeight: 600 }}>{g.nombre}</span>
                                    <span style={{
                                        marginLeft: 8, fontSize: 12, color: "var(--texto-suave)",
                                        background: "var(--fondo)", padding: "1px 7px", borderRadius: 10
                                    }}>
                                        {g.frecuencia}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <span style={{ fontWeight: 700 }}>₡{parseFloat(g.monto).toLocaleString()}</span>
                                    {g.frecuencia !== "mensual" && (
                                        <span style={{ fontSize: 12, color: "var(--texto-suave)" }}>
                                            ≈ ₡{(g.frecuencia === "semanal"
                                                ? parseFloat(g.monto) * 4
                                                : parseFloat(g.monto) / 12).toLocaleString("es-CR", { maximumFractionDigits: 0 })}/mes
                                        </span>
                                    )}
                                    <button type="button" onClick={() => eliminarGasto(g.id)}
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: 14, padding: "10px 0", borderTop: "2px solid var(--borde)" }}>
                            <div className="resumen-grid">
                                <div className="resumen-item" style={{ borderLeft: "3px solid #ef4444" }}>
                                    <div className="valor">₡{totalGastosMensuales.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                                    <div className="etiqueta">💡 Total mensual</div>
                                </div>
                                <div className="resumen-item" style={{ borderLeft: "3px solid #f59e0b" }}>
                                    <div className="valor">₡{(totalGastosMensuales / 30).toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                                    <div className="etiqueta">📅 Costo por día</div>
                                </div>
                                {pedidos.filter(p => p.estado === "entregado").length > 0 && (
                                    <div className="resumen-item" style={{ borderLeft: "3px solid #6366f1" }}>
                                        <div className="valor">
                                            ₡{(totalGastosMensuales / pedidos.filter(p => p.estado === "entregado").length)
                                                .toLocaleString("es-CR", { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="etiqueta">🛒 Por pedido entregado</div>
                                    </div>
                                )}
                            </div>
                            <p style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 8 }}>
                                💡 El costo por pedido es referencial. Considerá subirlo a tu margen en Recetas para cubrirlo.
                            </p>
                        </div>
                    </>
                ) : (
                    <p style={{ color: "var(--texto-suave)", fontSize: 14, padding: "12px 0" }}>
                        Agregá tus gastos fijos: gas, luz, agua, internet, tiempo de trabajo, etc.
                    </p>
                )}
            </div>
        </div>
    )
}