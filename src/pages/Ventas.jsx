// src/pages/Ventas.jsx
import { useCalculosVentas } from "../hooks/useCalculosVentas"
import ResumenMes from "../components/ventas/ResumenMes"
import TablaVentasPedidos from "../components/ventas/TablaVentasPedidos"
import VentasManuales from "../components/ventas/VentasManuales"

export default function Ventas({ db, actualizarDb }) {
    const {
        ventas,
        ventasAutomaticas,
        ventasManuales,
        ventasEsteMes,
        totalGastosMensuales,
        gastoPorVenta,
        costoIngredientesPedido,
        totalMes,
        totalGeneral,
        gananciaNeta
    } = useCalculosVentas(db)

    const handleGuardarManual = (venta) => {
        actualizarDb("ventas", [...ventas, venta])
    }

    const handleEliminarManual = (id) => {
        if (!window.confirm("¿Eliminar esta venta?")) return
        actualizarDb("ventas", ventas.filter(v => v.id !== id))
    }

    return (
        <div>
            <h2 className="page-titulo">💰 Ventas</h2>

            <ResumenMes 
                totalMes={totalMes}
                totalGastosMensuales={totalGastosMensuales}
                gananciaNeta={gananciaNeta}
                totalGeneral={totalGeneral}
                ventasEsteMesCount={ventasEsteMes.length}
                gastoPorVenta={gastoPorVenta}
            />

            <TablaVentasPedidos 
                ventas={ventasAutomaticas}
                costoIngredientesPedido={costoIngredientesPedido}
                gastoPorVenta={gastoPorVenta}
            />

            <VentasManuales 
                ventas={ventasManuales}
                onGuardar={handleGuardarManual}
                onEliminar={handleEliminarManual}
            />

            {ventas.length === 0 && (
                <div className="card" style={{ 
                    textAlign: "center", 
                    color: "var(--texto-suave)", 
                    padding: "40px 20px" 
                }}>
                    <p style={{ fontSize: 40 }}>💰</p>
                    <p>Aún no hay ventas registradas.</p>
                    <p style={{ fontSize: 13 }}>
                        Las ventas aparecen automáticamente al entregar pedidos, o podés agregar ventas sueltas arriba.
                    </p>
                </div>
            )}
        </div>
    )
}