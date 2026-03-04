function TablaIngredientes({ ingredientes, onEliminar }) {
    if (ingredientes.length === 0) return null

    return (
        <table>
            <thead>
                <tr>
                    <th>Ingrediente</th>
                    <th>Cantidad</th>
                    <th>Costo</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {ingredientes.map((ing) => (
                    <tr key={ing.id}>
                        <td>{ing.nombre}</td>
                        <td>{ing.cantidadUso}{ing.unidadUso}</td>
                        <td>₡{ing.costoParcial}</td>
                        <td>
                            <button type="button" onClick={() => onEliminar(ing.id)}>✕</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default TablaIngredientes