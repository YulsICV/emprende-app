export default function ListaClientes({ db, ventasDelCliente, eliminar }) {
    return (
        <div>
            <h3>Mis clientes</h3>
            {db.clientes.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Tipo</th>
                            <th>Alergias</th>
                            <th>Pedidos</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {db.clientes.map(c => {
                            const historial = ventasDelCliente(c.nombre)
                            const totalComprado = historial.reduce((s, v) => s + parseFloat(v.total || 0), 0)
                            return (
                                <tr key={c.id}>
                                    <td>{c.nombre}</td>
                                    <td>{c.telefono || "-"}</td>
                                    <td>{c.tipo}</td>
                                    <td>{c.alergias ? `⚠️ ${c.notasAlergias}` : "No"}</td>
                                    <td>{historial.length}</td>
                                    <td>₡{totalComprado.toFixed(0)}</td>
                                    <td>
                                        <button type="button" onClick={() => eliminar(c.id)}>🗑</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}