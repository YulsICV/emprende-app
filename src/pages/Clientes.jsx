import { useClientes } from "../hooks/useClientesData"
import ModalCliente from "../components/clientes/ModalCliente"
import ListaClientes from "../components/clientes/ListaClientes"

export default function Clientes() {
    const {
        form, setForm,
        editandoId,
        modalAbierto,
        clientes,
        cargando,
        pedidosDelCliente,
        abrirModalNuevo,
        abrirModalEditar,
        cerrarModal,
        guardar,
        eliminar,
    } = useClientes()

    if (cargando) return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--texto-suave)" }}>
            ⏳ Cargando clientes...
        </div>
    )

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 className="page-titulo" style={{ margin: 0 }}>👥 Clientes</h2>
                <button className="btn-primario" type="button" onClick={abrirModalNuevo}>
                    ➕ Nuevo cliente
                </button>
            </div>

            {clientes.length === 0 ? (
                <div className="card" style={{ textAlign: "center", color: "var(--texto-suave)", padding: "40px 20px" }}>
                    <p style={{ fontSize: 40 }}>👥</p>
                    <p>Aún no tienes clientes registrados.</p>
                    <p style={{ fontSize: 13, marginTop: 8 }}>
                        Agrega tu primer cliente con el botón de arriba.
                    </p>
                    <button className="btn-primario" type="button" onClick={abrirModalNuevo} style={{ marginTop: 16 }}>
                        ➕ Agregar primer cliente
                    </button>
                </div>
            ) : (
                <ListaClientes
                    clientes={clientes}
                    pedidosDelCliente={pedidosDelCliente}
                    onEditar={abrirModalEditar}
                    onEliminar={eliminar}
                />
            )}

            {modalAbierto && (
                <ModalCliente
                    form={form}
                    setForm={setForm}
                    editandoId={editandoId}
                    onGuardar={guardar}
                    onCerrar={cerrarModal}
                />
            )}
        </div>
    )
}