import { parsearNumero } from "../../utils/parsearNumero"

export default function ResumenInventario({ inventario, metricas }) {
    if (!metricas || typeof metricas !== "object" || !("valorInventarioActual" in metricas)) return null
    const { valorInventarioActual, totalInvertido, costoConsumidoPedidos, topConsumo } = metricas

    return (
        <div className="card" style={{ order: 2 }}>
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>📊 Resumen del inventario</h3>

            <div className="resumen-grid" style={{ marginBottom: 16 }}>
                <div className="resumen-item" style={{ borderLeft: "3px solid var(--acento)" }}>
                    <div className="valor">₡{valorInventarioActual.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                    <div className="etiqueta">💰 Valor stock actual</div>
                </div>
                <div className="resumen-item" style={{ borderLeft: "3px solid #6366f1" }}>
                    <div className="valor">₡{totalInvertido.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                    <div className="etiqueta">🛒 Total invertido</div>
                </div>
                <div className="resumen-item" style={{ borderLeft: "3px solid #10b981" }}>
                    <div className="valor">₡{costoConsumidoPedidos.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</div>
                    <div className="etiqueta">🍩 Consumido en pedidos</div>
                </div>
                <div className="resumen-item" style={{ borderLeft: "3px solid #f59e0b" }}>
                    <div className="valor">{inventario.length}</div>
                    <div className="etiqueta">📦 Productos en stock</div>
                </div>
            </div>

            {topConsumo.length > 0 && (
                <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--texto-suave)", marginBottom: 10, letterSpacing: 0.5 }}>
                        MÁS USADOS EN PEDIDOS ENTREGADOS
                    </p>
                    {topConsumo.map(([nombre, cantidad]) => {
                        const item = inventario.find(i =>
                            i.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
                        )
                        const unidad = item?.unidad || ""
                        const stockActual = parsearNumero(item?.cantidad)
                        const totalOriginal = parsearNumero(item?.tamañoPaquete) * parsearNumero(item?.cantidadPaquetes)
                        const porcentajeStock = totalOriginal > 0
                            ? Math.min(100, (stockActual / totalOriginal) * 100)
                            : 0
                        return (
                            <div key={nombre} style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 14 }}>
                                    <span>{nombre}</span>
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <span style={{ color: "var(--texto-suave)" }}>
                                            consumido: <strong>{cantidad.toFixed(1)}{unidad}</strong>
                                        </span>
                                        <span style={{ color: stockActual < (parsearNumero(item?.minimo) || Infinity) ? "#d97706" : "var(--acento)" }}>
                                            stock: <strong>{stockActual.toFixed(1)}{unidad}</strong>
                                        </span>
                                    </div>
                                </div>
                                <div style={{ height: 5, background: "var(--borde)", borderRadius: 3 }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${porcentajeStock}%`,
                                        background: porcentajeStock < 20 ? "#ef4444" : porcentajeStock < 50 ? "#f59e0b" : "var(--acento)",
                                        borderRadius: 3,
                                        transition: "width 0.4s"
                                    }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

