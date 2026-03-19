export default function StockDisponible({ stockPorReceta }) {
    if (stockPorReceta.length === 0) return null

    return (
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
                            <th>Disponible</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockPorReceta.map(({ receta, totalProducido, totalPerdido, totalVendidoPedidos, disponible }) => (
                            <tr key={receta._id}>
                                <td><strong>{receta.nombre}</strong></td>
                                <td>{totalProducido}</td>
                                <td style={{ color: totalPerdido > 0 ? "#ef4444" : "var(--texto-suave)" }}>
                                    {totalPerdido > 0 ? `⚠️ ${totalPerdido}` : "—"}
                                </td>
                                <td style={{ color: "var(--texto-suave)" }}>{totalVendidoPedidos || "—"}</td>
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
    )
}