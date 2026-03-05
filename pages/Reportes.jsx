import { useState } from "react"

function Reportes({ db }) {
    const [filtro, setFiltro] = useState("todo")

    const filtrarVentas = () => {
        const ahora = new Date()
        return db.ventas.filter(v => {
            const fecha = new Date(v.fecha)
            if (filtro === "hoy") {
                return fecha.toDateString() === ahora.toDateString()
            }
            if (filtro === "semana") {
                const hace7dias = new Date(ahora)
                hace7dias.setDate(ahora.getDate() - 7)
                return fecha >= hace7dias
            }
            if (filtro === "mes") {
                return fecha.getMonth() === ahora.getMonth() &&
                    fecha.getFullYear() === ahora.getFullYear()
            }
            return true
        })
    }

    const ventas = filtrarVentas()
    const totalVentas = ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0)
    const totalGanancia = ventas.reduce((s, v) => s + parseFloat(v.ganancia || 0), 0)
    const totalPedidos = ventas.length
    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0

    const ventasPorReceta = db.recetas.map(r => ({
        nombre: r.nombre,
        unidades: ventas.filter(v => v.recetaNombre === r.nombre)
            .reduce((s, v) => s + parseInt(v.cantidad || 0), 0),
        total: ventas.filter(v => v.recetaNombre === r.nombre)
            .reduce((s, v) => s + parseFloat(v.total || 0), 0)
    })).filter(r => r.total > 0)

    const ventasPorCliente = db.clientes.map(c => ({
        nombre: c.nombre,
        pedidos: ventas.filter(v => v.cliente === c.nombre).length,
        total: ventas.filter(v => v.cliente === c.nombre)
            .reduce((s, v) => s + parseFloat(v.total || 0), 0)
    })).filter(c => c.total > 0)

    const ventasPorMes = ventas.reduce((acc, v) => {
        const mes = new Date(v.fecha).toLocaleDateString("es-CR", { month: "long", year: "numeric" })
        if (!acc[mes]) acc[mes] = { total: 0, ganancia: 0, pedidos: 0 }
        acc[mes].total += parseFloat(v.total || 0)
        acc[mes].ganancia += parseFloat(v.ganancia || 0)
        acc[mes].pedidos += 1
        return acc
    }, {})

    return (
        <div>
            <h2>📊 Reportes</h2>

            <div>
                <button type="button" onClick={() => setFiltro("hoy")}>Hoy</button>
                <button type="button" onClick={() => setFiltro("semana")}>Esta semana</button>
                <button type="button" onClick={() => setFiltro("mes")}>Este mes</button>
                <button type="button" onClick={() => setFiltro("todo")}>Todo</button>
            </div>

            {totalPedidos === 0 ? (
                <p>No hay ventas en este período.</p>
            ) : (
                <div>
                    <div>
                        <p>💰 Total vendido: ₡{totalVentas.toFixed(0)}</p>
                        <p>📈 Ganancia neta: ₡{totalGanancia.toFixed(0)}</p>
                        <p>🛒 Total pedidos: {totalPedidos}</p>
                        <p>🎯 Ticket promedio: ₡{ticketPromedio.toFixed(0)}</p>
                    </div>

                    {ventasPorReceta.length > 0 && (
                        <div>
                            <h3>Ventas por receta</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Receta</th>
                                        <th>Unidades</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ventasPorReceta.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r.nombre}</td>
                                            <td>{r.unidades}</td>
                                            <td>₡{r.total.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {ventasPorCliente.length > 0 && (
                        <div>
                            <h3>Ventas por cliente</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Pedidos</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ventasPorCliente.map((c, i) => (
                                        <tr key={i}>
                                            <td>{c.nombre}</td>
                                            <td>{c.pedidos}</td>
                                            <td>₡{c.total.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {Object.keys(ventasPorMes).length > 0 && (
                        <div>
                            <h3>Ventas por mes</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mes</th>
                                        <th>Pedidos</th>
                                        <th>Total</th>
                                        <th>Ganancia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(ventasPorMes).map(([mes, datos], i) => (
                                        <tr key={i}>
                                            <td>{mes}</td>
                                            <td>{datos.pedidos}</td>
                                            <td>₡{datos.total.toFixed(0)}</td>
                                            <td>₡{datos.ganancia.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Reportes