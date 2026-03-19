import { usePedidos } from "../hooks/usePedidos"
import FormularioPedido from "../components/pedidos/FormularioPedido"
import ListaPedidos from "../components/pedidos/ListaPedidos"

export default function Pedidos() {
    const {
        form, setForm,
        esNuevoCliente, setEsNuevoCliente,
        editandoId,
        pedidos,
        clientes,
        recetas,
        cargando,
        recetaSeleccionada,
        total,
        saldoPendiente,
        guardar,
        editarPedido,
        cambiarEstado,
        eliminar,
        resetForm,
    } = usePedidos()

    if (cargando) return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--texto-suave)" }}>
            ⏳ Cargando pedidos...
        </div>
    )

    return (
        <div>
            <h2 className="page-titulo">🛒 Pedidos</h2>

            <FormularioPedido
                form={form}
                setForm={setForm}
                esNuevoCliente={esNuevoCliente}
                setEsNuevoCliente={setEsNuevoCliente}
                clientes={clientes}
                recetas={recetas}
                editandoId={editandoId}
                total={total}
                saldoPendiente={saldoPendiente}
                recetaSeleccionada={recetaSeleccionada}
                onGuardar={guardar}
                onCancelar={resetForm}
            />

            <ListaPedidos
                pedidos={pedidos}
                onCambiarEstado={cambiarEstado}
                onEditar={editarPedido}
                onEliminar={eliminar}
            />
        </div>
    )
}