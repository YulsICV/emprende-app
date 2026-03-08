import { useState } from "react"

function TablaItems({ items, titulo, icono }) {
    if (!items || items.length === 0) return null
    return (
        <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-suave)", marginBottom: 8, letterSpacing: 0.5 }}>
                {icono} {titulo.toUpperCase()}
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Cantidad usada</th>
                        <th>Paquete</th>
                        <th>Precio paquete</th>
                        <th>Costo usado</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((ing) => (
                        <tr key={ing.id}>
                            <td>{ing.nombre}</td>
                            <td>{ing.cantidadUso} {ing.unidadUso}</td>
                            <td>{ing.cantidadPaquete} {ing.unidadPaquete}</td>
                            <td>₡{parseFloat(ing.precioPaquete || 0).toLocaleString()}</td>
                            <td style={{ fontWeight: 600 }}>₡{parseFloat(ing.costoParcial || 0).toFixed(0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function ListaRecetas({ recetas, onEliminar, onEditar }) {
    const [abierta, setAbierta] = useState(null)

    if (recetas.length === 0) return null

    return (
        <div>
            <h3 className="seccion-titulo">Recetas guardadas</h3>
            {recetas.map((receta) => {
                const insumos = receta.insumos || []
                const costoInsumos = insumos.reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
                const costoIngredientes = receta.ingredientes.reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)

                return (
                    <div className="card" key={receta.id}>
                        {/* Cabecera */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <h4 style={{ margin: 0 }}>{receta.nombre}</h4>
                                    {receta.envioGratis && (
                                        <span style={{ fontSize: 11, background: "#d1fae5", color: "#059669", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                                            🚚 Envío gratis
                                        </span>
                                    )}
                                </div>
                                <p style={{ color: "var(--texto-suave)", fontSize: 13, marginTop: 2 }}>
                                    {receta.categoria} · {receta.unidades} unidades
                                    {insumos.length > 0 && ` · ${insumos.length} insumo${insumos.length !== 1 ? "s" : ""}`}
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <button className="btn-secundario" type="button"
                                    onClick={() => setAbierta(abierta === receta.id ? null : receta.id)}>
                                    {abierta === receta.id ? "▲ Ocultar" : "▼ Ver detalle"}
                                </button>
                                <button className="btn-secundario" type="button" onClick={() => onEditar(receta)}>
                                    ✏️ Editar
                                </button>
                                <button className="btn-peligro" type="button" onClick={() => onEliminar(receta.id)}>
                                    🗑
                                </button>
                            </div>
                        </div>

                        {/* Resumen de costos */}
                        <div className="resumen-grid" style={{ marginTop: 12 }}>
                            <div className="resumen-item">
                                <div className="valor">₡{parseFloat(receta.costoTotal || 0).toFixed(0)}</div>
                                <div className="etiqueta">Costo total</div>
                            </div>
                            <div className="resumen-item">
                                <div className="valor">₡{parseFloat(receta.costoPorUnidad || 0).toFixed(0)}</div>
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

                        {/* Detalle expandible */}
                        {abierta === receta.id && (
                            <div style={{ marginTop: 16, borderTop: "1px solid var(--borde)", paddingTop: 16 }}>
                                <div style={{ overflowX: "auto" }}>
                                    <TablaItems
                                        items={receta.ingredientes}
                                        titulo="Ingredientes"
                                        icono="🧁"
                                    />
                                    <TablaItems
                                        items={insumos}
                                        titulo="Insumos de empaque"
                                        icono="📦"
                                    />
                                </div>

                                {/* Totales del desglose */}
                                <div style={{ marginTop: 12, textAlign: "right", borderTop: "1px solid var(--borde)", paddingTop: 10 }}>
                                    {insumos.length > 0 && (
                                        <>
                                            <p style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                                🧁 Costo ingredientes: ₡{costoIngredientes.toFixed(0)}
                                            </p>
                                            <p style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                                📦 Costo insumos: ₡{costoInsumos.toFixed(0)}
                                            </p>
                                        </>
                                    )}
                                    <p style={{ color: "var(--texto-suave)", fontSize: 13 }}>
                                        Costo usado en receta: ₡{parseFloat(receta.costoTotal || 0).toFixed(0)}
                                    </p>
                                    <p style={{ fontWeight: 600, color: "var(--verde-oscuro)", marginTop: 4 }}>
                                        Gasto real en compras: ₡{[...receta.ingredientes, ...insumos]
                                            .reduce((s, i) => s + parseFloat(i.precioPaquete || 0), 0).toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default ListaRecetas