import { parsearNumero } from "../utils/parsearNumero"
import { useInventario } from "../hooks/useInventario"
import { useMetricasInventario } from "../hooks/useMetricasInventario"
import FormularioInventario from "../components/inventario/FormularioInventario"
import ResumenInventario from "../components/inventario/ResumenInventario"
import TablaInventario from "../components/inventario/TablaInventario"
import ModalEliminar from "../components/inventario/ModalEliminar"

export default function Inventario({ db, actualizarDb }) {
    const {
        form, setForm,
        editandoId,
        busqueda, setBusqueda,
        modalEliminar, setModalEliminar,
        inventario,
        bajoStock,
        itemsFiltrados,
        totalInventario,
        costoTotal,
        guardar,
        editar,
        cancelarEdicion,
        eliminar,
    } = useInventario(db, actualizarDb)

    const metricas = useMetricasInventario(db)

    return (
        <div>
            <h2 className="page-titulo">📦 Inventario</h2>

            {/* Alertas stock bajo */}
            {bajoStock.length > 0 && (
                <div className="alerta">
                    <p style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ Productos con stock bajo:</p>
                    {bajoStock.map(i => (
                        <p key={i.id} style={{ margin: "2px 0" }}>
                            • <strong>{i.nombre}</strong>: {parsearNumero(i.cantidad).toFixed(1)}{i.unidad}
                            {i.minimo && (
                                <span style={{ color: "var(--texto-suave)" }}>
                                    {" "}(mín. {i.minimo}{i.unidad})
                                </span>
                            )}
                        </p>
                    ))}
                </div>
            )}

            {/* Layout dos columnas: formulario | resumen */}
            <div style={{
                display: "grid",
                gridTemplateColumns: inventario.length > 0 ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr",
                gap: 16,
                alignItems: "start"
            }}>
                <FormularioInventario
                    form={form}
                    setForm={setForm}
                    editandoId={editandoId}
                    totalInventario={totalInventario}
                    costoTotal={costoTotal}
                    onGuardar={guardar}
                    onCancelar={cancelarEdicion}
                />

                {inventario.length > 0 && (
                    <ResumenInventario
                        inventario={inventario}
                        metricas={metricas}
                    />
                )}
            </div>

            {/* Tabla */}
            <TablaInventario
                inventario={inventario}
                itemsFiltrados={itemsFiltrados}
                bajoStock={bajoStock}
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                onEditar={editar}
                onEliminar={setModalEliminar}
            />

            {/* Modal eliminar */}
            <ModalEliminar
                item={modalEliminar}
                onConfirmar={eliminar}
                onCancelar={() => setModalEliminar(null)}
            />
        </div>
    )
}