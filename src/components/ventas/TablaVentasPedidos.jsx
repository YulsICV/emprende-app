// src/components/ventas/TablaVentasPedidos.jsx
export default function TablaVentasPedidos({ 
    ventas = [], 
    costoIngredientesPedido, 
    gastoPorVenta 
}) {
    const formatMoney = (num) => num > 0 
        ? `₡${num.toLocaleString("es-CR", { maximumFractionDigits: 0 })}` 
        : "—"
    
    const formatFecha = (iso) => new Date(iso).toLocaleDateString("es-CR", {
        day: "numeric", month: "short", year: "numeric"
    })

    if (ventas.length === 0) {
        return (
            <div className="card">
                <h3 className="seccion-titulo" style={{ marginTop: 0 }}>
                    ✅ Ventas de pedidos entregados
                </h3>
                <p style={{ color: "var(--texto-suave)", fontSize: 14 }}>
                    Aquí aparecen automáticamente los pedidos que marqués como entregados.
                </p>
            </div>
        )
    }

    const ventasOrdenadas = [...ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    return (
        <div className="card">
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>
                ✅ Ventas de pedidos entregados
            </h3>
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
                        {ventasOrdenadas.map(v => {
                            const costo = costoIngredientesPedido(v)
                            const ganancia = parseFloat(v.total || 0) - costo - gastoPorVenta
                            
                            return (
                                <tr key={v.id}>
                                    <td style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                        {formatFecha(v.fecha)}
                                    </td>
                                    <td><strong>{v.cliente}</strong></td>
                                    <td>{v.recetaNombre}</td>
                                    <td>{v.cantidad}</td>
                                    <td style={{ color: "#ef4444", fontSize: 13 }}>
                                        {formatMoney(costo)}
                                    </td>
                                    <td style={{ color: "#f59e0b", fontSize: 13 }}>
                                        {formatMoney(gastoPorVenta)}
                                    </td>
                                    <td style={{ fontWeight: 700 }}>
                                        ₡{parseFloat(v.total || 0).toLocaleString()}
                                    </td>
                                    <td style={{ 
                                        fontWeight: 700, 
                                        color: ganancia >= 0 ? "#10b981" : "#ef4444" 
                                    }}>
                                        {formatMoney(ganancia)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}