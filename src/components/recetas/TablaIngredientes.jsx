function TablaItem({ items, titulo, icono, onEliminar, onEditar }) {
    if (items.length === 0) return null
    return (
        <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: "var(--texto-suave)", marginBottom: 8, letterSpacing: 0.5 }}>
                {icono} {titulo.toUpperCase()}
            </p>
            <div style={{ overflowX: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
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
                        {items.map((ing) => (
                            <tr key={ing.id}>
                                <td>
                                    <input type="text" value={ing.nombre}
                                        onChange={e => onEditar(ing.id, "nombre", e.target.value)}
                                        style={{ width: 100 }} />
                                </td>
                                <td>
                                    <input type="number" value={ing.cantidadUso}
                                        onChange={e => onEditar(ing.id, "cantidadUso", e.target.value)}
                                        style={{ width: 70 }} />
                                </td>
                                <td style={{ fontSize: 13 }}>{ing.unidadUso}</td>
                                <td>
                                    <input type="number" value={ing.cantidadPaquete}
                                        onChange={e => onEditar(ing.id, "cantidadPaquete", e.target.value)}
                                        style={{ width: 70 }} />
                                </td>
                                <td style={{ fontSize: 13 }}>{ing.unidadPaquete}</td>
                                <td>
                                    <input type="number" value={ing.precioPaquete}
                                        onChange={e => onEditar(ing.id, "precioPaquete", e.target.value)}
                                        style={{ width: 80 }} />
                                </td>
                                <td style={{ fontWeight: 600, color: "var(--verde-oscuro)" }}>
                                    ₡{parseFloat(ing.costoParcial || 0).toFixed(0)}
                                </td>
                                <td>
                                    <button className="btn-peligro" type="button"
                                        onClick={() => onEliminar(ing.id)}>✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default function TablaIngredientes({ ingredientes, onEliminar, onEditar }) {
    if (ingredientes.length === 0) return null
    return (
        <div className="card">
            <h4 className="seccion-titulo">🧁 Ingredientes de la receta</h4>
            <TablaItem
                items={ingredientes}
                titulo="Ingredientes"
                icono="🧁"
                onEliminar={onEliminar}
                onEditar={onEditar}
            />
        </div>
    )
}