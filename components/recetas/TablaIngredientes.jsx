function TablaIngredientes({ ingredientes, onEliminar, onEditar }) {
    if (ingredientes.length === 0) return null

    return (
        <div className="card">
            <h4 className="seccion-titulo">Ingredientes agregados</h4>
            <div style={{ overflowX: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th>Ingrediente</th>
                            <th>Cant. uso</th>
                            <th>Unidad</th>
                            <th>Cant. paquete</th>
                            <th>Unidad</th>
                            <th>Precio paquete</th>
                            <th>Costo</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredientes.map((ing) => (
                            <tr key={ing.id}>
                                <td>
                                    <input
                                        type="text"
                                        value={ing.nombre}
                                        onChange={(e) => onEditar(ing.id, "nombre", e.target.value)}
                                        style={{ width: 100 }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={ing.cantidadUso}
                                        onChange={(e) => onEditar(ing.id, "cantidadUso", e.target.value)}
                                        style={{ width: 70 }}
                                    />
                                </td>
                                <td style={{ fontSize: 13 }}>{ing.unidadUso}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={ing.cantidadPaquete}
                                        onChange={(e) => onEditar(ing.id, "cantidadPaquete", e.target.value)}
                                        style={{ width: 70 }}
                                    />
                                </td>
                                <td style={{ fontSize: 13 }}>{ing.unidadPaquete}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={ing.precioPaquete}
                                        onChange={(e) => onEditar(ing.id, "precioPaquete", e.target.value)}
                                        style={{ width: 80 }}
                                    />
                                </td>
                                <td style={{ fontWeight: 600, color: "var(--verde-oscuro)" }}>
                                    ₡{parseFloat(ing.costoParcial).toFixed(0)}
                                </td>
                                <td>
                                    <button className="btn-peligro" type="button" onClick={() => onEliminar(ing.id)}>✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TablaIngredientes