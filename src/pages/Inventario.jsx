import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"
import { parsearNumero } from "../utils/parsearNumero"
import { useInventario, formatearCantidad } from "../hooks/useInventario"
import { useMetricasInventario } from "../hooks/useMetricasInventario"
import FormularioInventario from "../components/inventario/FormularioInventario"
import ResumenInventario from "../components/inventario/ResumenInventario"
import TablaInventario from "../components/inventario/TablaInventario"
import ModalEliminar from "../components/inventario/ModalEliminar"

function aGramos(cantidad, unidad) {
    const n = parsearNumero(cantidad)
    const factor = CONVERSIONES_A_GRAMOS[unidad]
    if (!factor) return n
    return n * factor
}

export default function Inventario({ db }) {
    const {
        form, setForm,
        editandoId,
        busqueda, setBusqueda,
        modalEliminar, setModalEliminar,
        inventario,
        cargando,
        bajoStock,
        itemsFiltrados,
        totalInventario,
        costoTotal,
        guardar,
        editar,
        cancelarEdicion,
        eliminar,
    } = useInventario()

    const dbConInventario = { ...db, inventario }
    const metricas = useMetricasInventario(dbConInventario)

    if (cargando) return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--texto-suave)" }}>
            ⏳ Cargando inventario...
        </div>
    )

    return (
        <div>
            <h2 className="page-titulo">📦 Inventario</h2>

            {bajoStock.length > 0 && (
                <div className="alerta">
                    <p style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ Productos con stock bajo:</p>
                    {bajoStock.map(i => (
                        <p key={i._id} style={{ margin: "2px 0" }}>
                            • <strong>{i.nombre}</strong>:{" "}
                            {formatearCantidad(i.cantidadBase ?? aGramos(i.cantidad, i.unidad), i.unidad)}
                            {i.minimo && (
                                <span style={{ color: "var(--texto-suave)" }}>
                                    {" "}(mín. {i.minimo} {i.unidad})
                                </span>
                            )}
                        </p>
                    ))}
                </div>
            )}

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

            <TablaInventario
                inventario={inventario}
                itemsFiltrados={itemsFiltrados}
                bajoStock={bajoStock}
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                onEditar={editar}
                onEliminar={setModalEliminar}
            />

            <ModalEliminar
                item={modalEliminar}
                onConfirmar={eliminar}
                onCancelar={() => setModalEliminar(null)}
            />
        </div>
    )
}