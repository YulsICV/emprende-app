import { useState } from "react"
import FormularioCliente from "../components/clientes/FormularioCliente"
import ListaClientes from "../components/clientes/ListaClientes"

export default function Clientes({ db, actualizarDb }) {
    const [form, setForm] = useState({
        nombre: "",
        telefono: "",
        tipo: "individual",
        alergias: false,
        notasAlergias: "",
        nota: ""
    })

    const guardar = () => {
        if (!form.nombre) return

        const nuevoCliente = {
            ...form,
            id: crypto.randomUUID(),
            fecha: new Date().toISOString()
        }

        actualizarDb("clientes", [...db.clientes, nuevoCliente])
        setForm({ nombre: "", telefono: "", tipo: "individual", nota: "" })
    }

    const eliminar = (id) => {
        actualizarDb("clientes", db.clientes.filter(c => c.id !== id))
    }

    const ventasDelCliente = (nombre) =>
        db.ventas.filter(v => v.cliente === nombre)

    return (
        <div>
            <FormularioCliente form={form} setForm={setForm} guardar={guardar} />
            <ListaClientes db={db} ventasDelCliente={ventasDelCliente} eliminar={eliminar} />
        </div>
    )
}

