// src/pages/Clientes.jsx
import { useClientes } from "../hooks/useClientesData"
import FormularioCliente from "../components/clientes/FormularioCliente"
import ListaClientes from "../components/clientes/ListaClientes"

export default function Clientes({ db, actualizarDb }) {
    const {
        form,
        setForm,
        editandoId,
        clientes,
        ventasDelCliente,
        guardar,
        editar,
        cancelar,
        eliminar
    } = useClientes(db, actualizarDb)

    return (
        <div>
            <h2 className="page-titulo">👥 Clientes</h2>

            <FormularioCliente
                form={form}
                setForm={setForm}
                guardar={guardar}
                editandoId={editandoId}
                cancelar={cancelar}
            />

            {clientes.length === 0 ? (
                <div className="card" style={{ 
                    textAlign: "center", 
                    color: "var(--texto-suave)", 
                    padding: "40px 20px" 
                }}>
                    <p style={{ fontSize: 40 }}>👥</p>
                    <p>Aún no tienes clientes registrados.</p>
                    <p style={{ fontSize: 13, marginTop: 8 }}>
                        Agrega tu primer cliente usando el formulario de arriba.
                    </p>
                </div>
            ) : (
                <ListaClientes
                    db={db}
                    ventasDelCliente={ventasDelCliente}
                    eliminar={eliminar}
                    onEditar={editar}
                />
            )}
        </div>
    )
}