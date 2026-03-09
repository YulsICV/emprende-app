// src/components/ventas/ResumenMes.jsx
export default function ResumenMes({ 
    totalMes, 
    totalGastosMensuales, 
    gananciaNeta, 
    totalGeneral,
    ventasEsteMesCount,
    gastoPorVenta 
}) {
    const formatMoney = (num) => `₡${num.toLocaleString("es-CR", { maximumFractionDigits: 0 })}`
    const colorGanancia = gananciaNeta >= 0 ? "#10b981" : "#ef4444"

    return (
        <div className="card">
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>📅 Este mes</h3>
            <div className="resumen-grid">
                <ResumenItem 
                    valor={formatMoney(totalMes)} 
                    etiqueta="💰 Ingresos" 
                    color="var(--acento)" 
                />
                <ResumenItem 
                    valor={formatMoney(totalGastosMensuales)} 
                    etiqueta="💡 Gastos fijos" 
                    color="#ef4444" 
                />
                <ResumenItem 
                    valor={formatMoney(gananciaNeta)} 
                    etiqueta="✨ Ganancia neta" 
                    color={colorGanancia}
                    valorColor={colorGanancia}
                />
                <ResumenItem 
                    valor={formatMoney(totalGeneral)} 
                    etiqueta="📊 Total histórico" 
                    color="#6366f1" 
                />
            </div>

            {totalGastosMensuales > 0 && ventasEsteMesCount > 0 && (
                <div style={{
                    marginTop: 12, padding: "8px 12px",
                    background: "var(--fondo)", borderRadius: 8, fontSize: 13,
                    color: "var(--texto-suave)"
                }}>
                    💡 Los gastos fijos de {formatMoney(totalGastosMensuales)} se dividen entre {ventasEsteMesCount} venta{ventasEsteMesCount !== 1 ? "s" : ""} del mes
                    → <strong>{formatMoney(gastoPorVenta)} por venta</strong>
                </div>
            )}
            {totalGastosMensuales === 0 && (
                <p style={{ fontSize: 12, color: "var(--texto-suave)", marginTop: 8 }}>
                    💡 Agregá gastos fijos en Reportes para ver la ganancia neta real.
                </p>
            )}
        </div>
    )
}

function ResumenItem({ valor, etiqueta, color, valorColor }) {
    return (
        <div className="resumen-item" style={{ borderLeft: `3px solid ${color}` }}>
            <div className="valor" style={{ color: valorColor }}>{valor}</div>
            <div className="etiqueta">{etiqueta}</div>
        </div>
    )
}