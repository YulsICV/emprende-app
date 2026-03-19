import { useState, useEffect, useCallback } from "react"
import { apiProduccion, apiRecetas, apiInventario, apiPedidos } from "./useApi"

const FORM_INICIAL = {
    fecha: new Date().toISOString().split("T")[0],
    recetaId: "",
    cantidad: "",
    notas: "",
    tipo: "produccion"
}

export function useProduccion() {
    const [form, setForm] = useState(FORM_INICIAL)
    const [produccion, setProduccion] = useState([])
    const [recetas, setRecetas] = useState([])
    const [inventario, setInventario] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [cargando, setCargando] = useState(true)

    const recargar = useCallback(async () => {
        setCargando(true)
        try {
            const [prod, rec, inv, ped] = await Promise.all([
                apiProduccion.getAll(),
                apiRecetas.getAll(),
                apiInventario.getAll(),
                apiPedidos.getAll(),
            ])
            setProduccion(Array.isArray(prod) ? prod : [])
            setRecetas(Array.isArray(rec) ? rec : [])
            setInventario(Array.isArray(inv) ? inv : [])
            setPedidos(Array.isArray(ped) ? ped : [])
        } catch (err) {
            console.error("Error cargando producción:", err)
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => { recargar() }, [recargar])

    const recetaSeleccionada = recetas.find(r => r._id === form.recetaId)

    // Stock disponible por receta
    const stockPorReceta = recetas.map(receta => {
        const registros = produccion.filter(p => p.recetaId === receta._id)

        const totalProducido = registros
            .filter(p => p.tipo === "produccion")
            .reduce((s, p) => s + (parseInt(p.cantidad) || 0), 0)

        const totalPerdido = registros
            .filter(p => p.tipo === "perdida")
            .reduce((s, p) => s + (parseInt(p.cantidad) || 0), 0)

        const totalVendidoPedidos = pedidos
            .filter(p => p.recetaNombre === receta.nombre && p.estado === "entregado")
            .reduce((s, p) => s + (parseInt(p.cantidad) || 0), 0)

        const disponible = totalProducido - totalPerdido - totalVendidoPedidos

        return { receta, totalProducido, totalPerdido, totalVendidoPedidos, disponible }
    }).filter(r => r.totalProducido > 0)

    // Preview de lo que se descontaría del inventario
    const previewDescuento = recetaSeleccionada && parseInt(form.cantidad) > 0 ? (() => {
        const factor = parseInt(form.cantidad) / (parseInt(recetaSeleccionada.unidades) || 1)
        const todosItems = [
            ...(recetaSeleccionada.ingredientes || []),
            ...(recetaSeleccionada.insumos || [])
        ]
        return todosItems.map(ing => {
            const consumo = (parseFloat(ing.cantidadUso) || 0) * factor
            const itemInv = inventario.find(i =>
                i.nombre.toLowerCase().trim() === ing.nombre.toLowerCase().trim()
            )
            const stockActual = parseFloat(itemInv?.cantidad || 0)
            return { nombre: ing.nombre, consumo, unidad: ing.unidadUso, stockActual, alcanza: stockActual >= consumo }
        })
    })() : []

    const hayStockInsuficiente = previewDescuento.some(i => !i.alcanza)

    const guardar = async () => {
        if (!form.recetaId || !form.cantidad) return
        const receta = recetas.find(r => r._id === form.recetaId)
        if (!receta) return

        const cantidad = parseInt(form.cantidad) || 0

        const nuevo = await apiProduccion.crear({
            fecha: form.fecha,
            recetaId: form.recetaId,
            recetaNombre: receta.nombre,
            cantidad,
            tipo: form.tipo,
            notas: form.notas || "",
        })
        setProduccion(prev => [nuevo, ...prev])

        // Descontar inventario si es producción
        if (form.tipo === "produccion" && inventario.length > 0) {
            const factor = cantidad / (parseInt(receta.unidades) || 1)
            const todosItems = [...(receta.ingredientes || []), ...(receta.insumos || [])]
            const actualizaciones = inventario
                .map(item => {
                    const usado = todosItems.find(i =>
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

        setForm(FORM_INICIAL)
    }

    const eliminar = async (id) => {
        await apiProduccion.eliminar(id)
        setProduccion(prev => prev.filter(p => p._id !== id))
    }

    // Historial agrupado por fecha
    const historial = produccion
        .slice()
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .reduce((grupos, item) => {
            const fecha = item.fecha.split("T")[0]
            if (!grupos[fecha]) grupos[fecha] = []
            grupos[fecha].push(item)
            return grupos
        }, {})

    return {
        form, setForm,
        produccion,
        recetas,
        cargando,
        recetaSeleccionada,
        stockPorReceta,
        previewDescuento,
        hayStockInsuficiente,
        historial,
        guardar,
        eliminar,
    }
}