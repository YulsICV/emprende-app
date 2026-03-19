import { useState, useEffect, useCallback } from "react"
import { apiPedidos, apiClientes, apiRecetas, apiInventario } from "./useApi"

const FORM_INICIAL = {
    fechaEntrega: "",
    cliente: "",
    clienteId: "",
    clienteNuevo: "",
    telefonoNuevo: "",
    correoNuevo: "",
    direcNuevo: "",
    alergiasNuevo: false,
    notasAlergiasNuevo: "",
    recetaId: "",
    cantidad: "",
    anticipo: "",
    estado: "pendiente",
    metodoPago: "SINPE",
    notasInternas: "",
    tematica: "",
    costoTematica: "",
    colores: "",
    tipoEnvio: "recogido",
    envio: "",
    costoEmpaque: "",
    especificaciones: "",
    cargoCambio: "",
    motivoCambio: "",
    camposExtra: {
        tematica: false,
        colores: false,
        empaque: false,
        especificaciones: false,
        cambioUltimaMomento: false
    }
}

export function calcularTotal(f, receta) {
    if (!receta) return 0
    return (receta.precioMenudeo || 0) * (parseInt(f.cantidad) || 0)
        + (f.tipoEnvio === "conCosto" ? parseFloat(f.envio || 0) : 0)
        + parseFloat(f.costoTematica || 0)
        + parseFloat(f.costoEmpaque || 0)
        + parseFloat(f.cargoCambio || 0)
}

export function usePedidos() {
    const [form, setForm] = useState(FORM_INICIAL)
    const [esNuevoCliente, setEsNuevoCliente] = useState(false)
    const [editandoId, setEditandoId] = useState(null)
    const [pedidos, setPedidos] = useState([])
    const [clientes, setClientes] = useState([])
    const [recetas, setRecetas] = useState([])
    const [inventario, setInventario] = useState([])
    const [cargando, setCargando] = useState(true)

    const recargar = useCallback(async () => {
        setCargando(true)
        try {
            const [p, c, r, inv] = await Promise.all([
                apiPedidos.getAll(),
                apiClientes.getAll(),
                apiRecetas.getAll(),
                apiInventario.getAll(),
            ])
            setPedidos(Array.isArray(p) ? p : [])
            setClientes(Array.isArray(c) ? c : [])
            setRecetas(Array.isArray(r) ? r : [])
            setInventario(Array.isArray(inv) ? inv : [])
        } catch (err) {
            console.error("Error cargando pedidos:", err)
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => { recargar() }, [recargar])

    const recetaSeleccionada = recetas.find(r => r._id === form.recetaId)
    const nombreCliente = esNuevoCliente ? form.clienteNuevo : form.cliente
    const total = calcularTotal(form, recetaSeleccionada)
    const saldoPendiente = total - parseFloat(form.anticipo || 0)

    const resetForm = () => {
        setForm(FORM_INICIAL)
        setEsNuevoCliente(false)
        setEditandoId(null)
    }

    const guardar = async () => {
        if (!nombreCliente || !form.recetaId || !form.cantidad || !form.fechaEntrega) return
        if (esNuevoCliente && !form.telefonoNuevo) return

        const receta = recetas.find(r => r._id === form.recetaId)
        const totalCalculado = calcularTotal(form, receta)
        const saldo = totalCalculado - parseFloat(form.anticipo || 0)

        let clienteId = form.clienteId
        let telefono = form.telefonoNuevo
        let correo = form.correoNuevo

        // Si es cliente nuevo, crearlo primero
        if (esNuevoCliente && form.clienteNuevo) {
            const nuevoCliente = await apiClientes.crear({
                nombre: form.clienteNuevo,
                telefono: form.telefonoNuevo,
                correo: form.correoNuevo,
                direccion: form.direcNuevo,
                tipo: "individual",
                alergias: form.alergiasNuevo || false,
                notasAlergias: form.notasAlergiasNuevo || "",
                nota: "",
            })
            setClientes(prev => [nuevoCliente, ...prev])
            clienteId = nuevoCliente._id
        } else {
            const clienteExistente = clientes.find(c => c.nombre === form.cliente)
            telefono = clienteExistente?.telefono || ""
            correo = clienteExistente?.correo || ""
            clienteId = clienteExistente?._id || ""
        }

        const datosPedido = {
            fechaEntrega: form.fechaEntrega,
            cliente: nombreCliente,
            clienteId,
            telefono,
            correo,
            recetaId: form.recetaId,
            recetaNombre: receta?.nombre || "",
            recetaUnidades: receta?.unidades || 0,
            cantidad: parseInt(form.cantidad) || 0,
            anticipo: parseFloat(form.anticipo || 0),
            estado: form.estado || "pendiente",
            metodoPago: form.metodoPago,
            tipoEnvio: form.tipoEnvio,
            envio: parseFloat(form.envio || 0),
            total: totalCalculado,
            saldoPendiente: saldo,
            tematica: form.tematica || "",
            costoTematica: parseFloat(form.costoTematica || 0),
            colores: form.colores || "",
            costoEmpaque: parseFloat(form.costoEmpaque || 0),
            especificaciones: form.especificaciones || "",
            cargoCambio: parseFloat(form.cargoCambio || 0),
            motivoCambio: form.motivoCambio || "",
            notasInternas: form.notasInternas || "",
        }

        if (editandoId) {
            const updated = await apiPedidos.actualizar({ ...datosPedido, id: editandoId })
            setPedidos(prev => prev.map(p => p._id === editandoId ? updated : p))
        } else {
            const nuevo = await apiPedidos.crear(datosPedido)
            setPedidos(prev => [nuevo, ...prev])
        }

        resetForm()
    }

    const editarPedido = (p) => {
        const receta = recetas.find(r => r.nombre === p.recetaNombre)
        setForm({
            fechaEntrega: p.fechaEntrega || "",
            cliente: p.cliente || "",
            clienteId: p.clienteId || "",
            clienteNuevo: "",
            telefonoNuevo: p.telefono || "",
            correoNuevo: p.correo || "",
            direcNuevo: "",
            alergiasNuevo: false,
            notasAlergiasNuevo: "",
            recetaId: receta?._id || "",
            cantidad: String(p.cantidad || ""),
            anticipo: String(p.anticipo || ""),
            estado: p.estado || "pendiente",
            metodoPago: p.metodoPago || "SINPE",
            notasInternas: p.notasInternas || "",
            tematica: p.tematica || "",
            costoTematica: String(p.costoTematica || ""),
            colores: p.colores || "",
            tipoEnvio: p.tipoEnvio || "recogido",
            envio: String(p.envio || ""),
            costoEmpaque: String(p.costoEmpaque || ""),
            especificaciones: p.especificaciones || "",
            cargoCambio: String(p.cargoCambio || ""),
            motivoCambio: p.motivoCambio || "",
            camposExtra: {
                tematica: !!p.tematica,
                colores: !!p.colores,
                empaque: !!(p.costoEmpaque),
                especificaciones: !!p.especificaciones,
                cambioUltimaMomento: !!p.motivoCambio
            }
        })
        setEditandoId(p._id)
        setEsNuevoCliente(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const cambiarEstado = async (id, nuevoEstado) => {
        const pedido = pedidos.find(p => p._id === id)
        if (!pedido) return

        // Al entregar: descontar inventario
        if (nuevoEstado === "entregado" && pedido.estado !== "entregado") {
            const receta = recetas.find(r => r.nombre === pedido.recetaNombre)
            if (receta && inventario.length > 0) {
                const factor = (parseInt(pedido.cantidad) || 0) / (parseInt(receta.unidades) || 1)
                const todosLosItems = [...(receta.ingredientes || []), ...(receta.insumos || [])]
                const actualizaciones = inventario
                    .map(item => {
                        const usado = todosLosItems.find(i =>
                            i.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim()
                        )
                        if (!usado) return null
                        const consumo = (parseFloat(usado.cantidadUso) || 0) * factor
                        const nuevaCantidad = parseFloat(Math.max(0, (parseFloat(item.cantidad) || 0) - consumo).toFixed(2))
                        return apiInventario.actualizar({ id: item._id, cantidad: nuevaCantidad, cantidadBase: nuevaCantidad })
                    })
                    .filter(Boolean)
                await Promise.all(actualizaciones)
                recargar()
            }
        }

        const updated = await apiPedidos.actualizar({ id, estado: nuevoEstado })
        setPedidos(prev => prev.map(p => p._id === id ? updated : p))
    }

    const eliminar = async (id) => {
        await apiPedidos.eliminar(id)
        setPedidos(prev => prev.filter(p => p._id !== id))
    }

    return {
        form, setForm,
        esNuevoCliente, setEsNuevoCliente,
        editandoId,
        pedidos,
        clientes,
        recetas,
        inventario,
        cargando,
        recetaSeleccionada,
        nombreCliente,
        total,
        saldoPendiente,
        guardar,
        editarPedido,
        cambiarEstado,
        eliminar,
        resetForm,
    }
}