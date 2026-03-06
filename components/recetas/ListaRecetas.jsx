import { useState } from "react"

function ListaRecetas({ recetas, onEliminar, onEditar }) {
    const [abierta, setAbierta] = useState(null)

    if (recetas.length === 0) return null

    return (
        <div>
            <h3 className="seccion-titulo">Recetas guardadas</h3>
            {recetas.map((receta) => (
                <div className="card" key={receta.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h4>{receta.nombre}</h4>
                            <p style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                {receta.categoria} · {receta.unidades} unidades
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                className="btn-secundario"
                                type="button"
                                onClick={() => setAbierta(abierta === receta.id ? null : receta.id)}
                            >
                                {abierta === receta.id ? "▲ Ocultar" : "▼ Ver detalle"}
                            </button>
                            <button
                                className="btn-secundario"
                                type="button"
                                onClick={() => onEditar(receta)}
                            >
                                ✏️ Editar
                            </button>
                            <button className="btn-peligro" type="button" onClick={() => onEliminar(receta.id)}>
                                🗑
                            </button>
                        </div>
                    </div>

                    <div className="resumen-grid" style={{ marginTop: 12 }}>
                        <div className="resumen-item">
                            <div className="valor">₡{parseFloat(receta.costoTotal).toFixed(0)}</div>
                            <div className="etiqueta">Costo total</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{parseFloat(receta.costoPorUnidad).toFixed(0)}</div>
                            <div className="etiqueta">Costo por unidad</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{receta.precioMayoreo}</div>
                            <div className="etiqueta">Precio mayoreo</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{receta.precioMenudeo}</div>
                            <div className="etiqueta">Precio menudeo</div>
                        </div>
                    </div>

                    {abierta === receta.id && (
                        <div style={{ marginTop: 16 }}>
                            <h4 style={{ marginBottom: 8, fontSize: 14, color: "var(--texto-suave)" }}>
                                Desglose de ingredientes
                            </h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ingrediente</th>
                                        <th>Cantidad usada</th>
                                        <th>Paquete</th>
                                        <th>Precio paquete</th>
                                        <th>Costo usado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receta.ingredientes.map((ing) => (
                                        <tr key={ing.id}>
                                            <td>{ing.nombre}</td>
                                            <td>{ing.cantidadUso} {ing.unidadUso}</td>
                                            <td>{ing.cantidadPaquete} {ing.unidadPaquete}</td>
                                            <td>₡{ing.precioPaquete}</td>
                                            <td>₡{parseFloat(ing.costoParcial).toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ marginTop: 12, textAlign: "right" }}>
                                <p style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                    Costo usado en receta: ₡{parseFloat(receta.costoTotal).toFixed(0)}
                                </p>
                                <p style={{ fontWeight: 600, color: "var(--verde-oscuro)", marginTop: 4 }}>
                                    Gasto real en compras: ₡{receta.ingredientes.reduce((s, ing) => s + parseFloat(ing.precioPaquete || 0), 0).toFixed(0)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default ListaRecetas