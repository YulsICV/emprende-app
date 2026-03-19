import { useProduccion } from "../hooks/useProduccion"
import StockDisponible from "../components/produccion/StockDisponible"
import FormularioProduccion from "../components/produccion/FormularioProduccion"
import HistorialProduccion from "../components/produccion/HistorialProduccion"

export default function Produccion() {
    const {
        form, setForm,
        recetas,
        cargando,
        stockPorReceta,
        previewDescuento,
        hayStockInsuficiente,
        historial,
        guardar,
        eliminar,
    } = useProduccion()

    if (cargando) return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--texto-suave)" }}>
            ⏳ Cargando producción...
        </div>
    )

    if (recetas.length === 0) return (
        <div>
            <h2 className="page-titulo">🏭 Producción</h2>
            <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                <p style={{ fontSize: 40 }}>🏭</p>
                <p>Primero creá recetas para poder registrar producción.</p>
            </div>
        </div>
    )

    return (
        <div>
            <h2 className="page-titulo">🏭 Producción</h2>

            <StockDisponible stockPorReceta={stockPorReceta} />

            <FormularioProduccion
                form={form}
                setForm={setForm}
                recetas={recetas}
                previewDescuento={previewDescuento}
                hayStockInsuficiente={hayStockInsuficiente}
                onGuardar={guardar}
            />

            <HistorialProduccion
                historial={historial}
                onEliminar={eliminar}
            />

            {Object.keys(historial).length === 0 && (
                <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                    <p style={{ fontSize: 40 }}>🍩</p>
                    <p>Registrá lo que producís cada día.</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>
                        Al registrar producción se descuentan automáticamente los ingredientes del inventario.
                    </p>
                </div>
            )}
        </div>
    )
}