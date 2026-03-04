function Reportes({ db }) {
    const totalVentas = db.ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0)
    const totalGanancia = db.ventas.reduce((s, v) => s + parseFloat(v.ganancia || 0), 0)
    const totalPedidos = db.ventas.length
    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0

    return (
        <div>
            <h2>📊 Reportes</h2>

            <div>
                <p>Total vendido: ₡{totalVentas.toFixed(0)}</p>
                <p>Ganancia neta: ₡{totalGanancia.toFixed(0)}</p>
                <p>Total pedidos: {totalPedidos}</p>
                <p>Ticket promedio: ₡{ticketPromedio.toFixed(0)}</p>
            </div>

            {totalPedidos === 0 && (
                <p>Aún no hay ventas registradas.</p>
            )}
        </div>
    )
}

export default Reportes