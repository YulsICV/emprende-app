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

export default function ListaRecetas({ recetas, onEliminar, onEditar }) {
    const [abierta, setAbierta] = useState(null)
    const [confirmarId, setConfirmarId] = useState(null)

    if (recetas.length === 0) return null

    const handleEliminar = (id) => {
        if (confirmarId === id) {
            onEliminar(id)
            setConfirmarId(null)
        } else {
            setConfirmarId(id)
        }
    }

    return (
        <div>
            <h3 className="seccion-titulo">Recetas guardadas</h3>
            {recetas.map((receta) => {
                const insumos = receta.insumos || []
                const costoInsumos = insumos.reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
                const costoIngredientes = receta.ingredientes.reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
                const confirmando = confirmarId === receta.id

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
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
                                <button className="btn-secundario" type="button"
                                    onClick={() => setAbierta(abierta === receta.id ? null : receta.id)}>
                                    {abierta === receta.id ? "▲ Ocultar" : "▼ Ver detalle"}
                                </button>
                                <button className="btn-secundario" type="button" onClick={() => onEditar(receta)}>
                                    ✏️ Editar
                                </button>

                                {/* Botón eliminar con confirmación inline */}
                                {confirmando ? (
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        background: "#fff5f5", border: "1.5px solid #fecaca",
                                        borderRadius: 10, padding: "4px 10px",
                                    }}>
                                        <span style={{ fontSize: 12, color: "#e53e3e", fontWeight: 600, whiteSpace: "nowrap" }}>
                                            ¿Eliminar?
                                        </span>
                                        <button type="button" onClick={() => handleEliminar(receta.id)} style={{
                                            all: "unset", cursor: "pointer",
                                            background: "#e53e3e", color: "#fff",
                                            fontSize: 12, fontWeight: 700,
                                            padding: "3px 10px", borderRadius: 7,
                                        }}>Sí</button>
                                        <button type="button" onClick={() => setConfirmarId(null)} style={{
                                            all: "unset", cursor: "pointer",
                                            background: "#e2e8f0", color: "#2d3748",
                                            fontSize: 12, fontWeight: 600,
                                            padding: "3px 10px", borderRadius: 7,
                                        }}>No</button>
                                    </div>
                                ) : (
                                    <button className="btn-peligro" type="button" onClick={() => handleEliminar(receta.id)}>
                                        🗑
                                    </button>
                                )}
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
                                    <TablaItems items={receta.ingredientes} titulo="Ingredientes" icono="🧁" />
                                    <TablaItems items={insumos} titulo="Insumos de empaque" icono="📦" />
                                </div>
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

