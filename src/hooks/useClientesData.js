// src/components/clientes/hooks/useClientes.js
import { useState } from "react"

const FORM_INICIAL = {
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
    tipo: "individual",
    alergias: false,
    notasAlergias: "",
    nota: ""
}

export function useClientes(db, actualizarDb) {
    const [form, setForm] = useState(FORM_INICIAL)
    const [editandoId, setEditandoId] = useState(null)

    const clientes = db?.clientes || []
    const ventas = db?.ventas || []
    const pedidos = db?.pedidos || []

    const ventasDelCliente = (nombre) => {
        const ventasCliente = ventas.filter(v => v.cliente === nombre)
        const pedidosCliente = pedidos.filter(p => p.cliente === nombre).map(p => ({
            ...p,
            descripcion: p.recetaNombre,
            total: p.total
        }))
        return [...ventasCliente, ...pedidosCliente].sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
        )
    }

    const guardar = () => {
        if (!form.nombre) return

        if (editandoId) {
            actualizarDb("clientes", clientes.map(c =>
                c.id === editandoId ? { ...form, id: editandoId } : c
            ))
            setEditandoId(null)
        } else {
            const nuevoCliente = {
                ...form,
                id: crypto.randomUUID(),
                fecha: new Date().toISOString()
            }
            actualizarDb("clientes", [...clientes, nuevoCliente])
        }
        setForm(FORM_INICIAL)
    }

    const editar = (cliente) => {
        setForm({
            nombre: cliente.nombre || "",
            telefono: cliente.telefono || "",
            correo: cliente.correo || "",
            direccion: cliente.direccion || "",
            tipo: cliente.tipo || "individual",
            alergias: cliente.alergias || false,
            notasAlergias: cliente.notasAlergias || "",
            nota: cliente.nota || ""
        })
        setEditandoId(cliente.id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const cancelar = () => {
        setEditandoId(null)
        setForm(FORM_INICIAL)
    }

    const eliminar = (id) => {
        if (!window.confirm("¿Eliminar este cliente?")) return
        actualizarDb("clientes", clientes.filter(c => c.id !== id))
    }

    return {
        form,
        setForm,
        editandoId,
        clientes,
        ventasDelCliente,
        guardar,
        editar,
        cancelar,
        eliminar
    }
}