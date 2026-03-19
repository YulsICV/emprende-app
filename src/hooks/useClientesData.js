import { useState, useEffect, useCallback } from "react"
import { apiClientes, apiPedidos } from "./useApi"

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

export function useClientes() {
    const [form, setForm] = useState(FORM_INICIAL)
    const [editandoId, setEditandoId] = useState(null)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [confirmarEliminarId, setConfirmarEliminarId] = useState(null)
    const [clientes, setClientes] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [cargando, setCargando] = useState(true)

    const recargar = useCallback(async () => {
        setCargando(true)
        try {
            const [c, p] = await Promise.all([
                apiClientes.getAll(),
                apiPedidos.getAll(),
            ])
            setClientes(Array.isArray(c) ? c : [])
            setPedidos(Array.isArray(p) ? p : [])
        } catch (err) {
            console.error("Error cargando clientes:", err)
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => { recargar() }, [recargar])

    const pedidosDelCliente = (nombre) =>
        pedidos.filter(p => p.cliente === nombre)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    const abrirModalNuevo = () => {
        setForm(FORM_INICIAL)
        setEditandoId(null)
        setModalAbierto(true)
    }

    const abrirModalEditar = (cliente) => {
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
        setEditandoId(cliente._id)
        setModalAbierto(true)
    }

    const cerrarModal = () => {
        setModalAbierto(false)
        setEditandoId(null)
        setForm(FORM_INICIAL)
    }

    const guardar = async () => {
        if (!form.nombre.trim()) return
        try {
            if (editandoId) {
                const updated = await apiClientes.actualizar({ ...form, id: editandoId })
                setClientes(prev => prev.map(c => c._id === editandoId ? updated : c))
            } else {
                const nuevo = await apiClientes.crear(form)
                setClientes(prev => [nuevo, ...prev])
            }
            cerrarModal()
        } catch (err) {
            console.error("Error guardando cliente:", err)
            alert("❌ No se pudo guardar: " + err.message)
        }
    }

    const eliminar = async (id) => {
        try {
            await apiClientes.eliminar(id)
            setClientes(prev => prev.filter(c => c._id !== id))
            setConfirmarEliminarId(null)
        } catch (err) {
            console.error("Error eliminando cliente:", err)
            alert("❌ No se pudo eliminar: " + err.message)
        }
    }

    return {
        form, setForm,
        editandoId,
        modalAbierto,
        confirmarEliminarId, setConfirmarEliminarId,
        clientes,
        pedidos,
        cargando,
        pedidosDelCliente,
        abrirModalNuevo,
        abrirModalEditar,
        cerrarModal,
        guardar,
        eliminar,
    }
}