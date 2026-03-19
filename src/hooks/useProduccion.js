import { useState, useEffect, useCallback } from "react"
import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"
import { apiProduccion, apiRecetas, apiInventario, apiPedidos } from "./useApi"

const FORM_INICIAL = {
    fecha: new Date().toISOString().split("T")[0],
    recetaId: "",
    cantidad: "",
    notas: "",
    tipo: "produccion",
    insumos: [], // ← nuevo
}

const INSUMO_FORM_INICIAL = {
    nombre: "", cantidadUso: "", unidadUso: "unidad",
    cantidadPaquete: "", unidadPaquete: "unidad", precioPaquete: ""
}

function calcularCostoParcial(item) {
    const cantidadUso = parseFloat(item.cantidadUso) || 0
    const cantidadPaquete = parseFloat(item.cantidadPaquete) || 0
    const precioPaquete = parseFloat(item.precioPaquete) || 0
    if (!cantidadUso || !cantidadPaquete || !precioPaquete) return 0
    const enGramosUso = CONVERSIONES_A_GRAMOS[item.unidadUso]
    const enGramosPaquete = CONVERSIONES_A_GRAMOS[item.unidadPaquete]
    let costo
    if (enGramosUso == null || enGramosPaquete == null) {
        costo = (precioPaquete / cantidadPaquete) * cantidadUso
    } else {
        const usoEnGramos = cantidadUso * enGramosUso
        const paqueteEnGramos = cantidadPaquete * enGramosPaquete
        costo = (precioPaquete / paqueteEnGramos) * usoEnGramos
    }
    return isNaN(costo) ? 0 : costo
}

export function useProduccion() {
    const [form, setForm] = useState(FORM_INICIAL)
    const [insumoForm, setInsumoForm] = useState(INSUMO_FORM_INICIAL)
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

    // Preview de ingredientes que se descontarían
    const previewDescuento = recetaSeleccionada && parseInt(form.cantidad) > 0 ? (() => {
        const factor = parseInt(form.cantidad) / (parseInt(recetaSeleccionada.unidades) || 1)
        return (recetaSeleccionada.ingredientes || []).map(ing => {
            const consumo = (parseFloat(ing.cantidadUso) || 0) * factor
            const itemInv = inventario.find(i =>
                i.nombre.toLowerCase().trim() === ing.nombre.toLowerCase().trim()
            )
            const stockActual = parseFloat(itemInv?.cantidad || 0)
            return { nombre: ing.nombre, consumo, unidad: ing.unidadUso, stockActual, alcanza: stockActual >= consumo }
        })
    })() : []

    const hayStockInsuficiente = previewDescuento.some(i => !i.alcanza)

    // Costo de insumos agregados
    const costoInsumos = form.insumos.reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)

    // Costo total producción = costo receta + insumos
    const costoReceta = recetaSeleccionada?.costoTotal || 0
    const cantidadNum = parseInt(form.cantidad) || 0
    const unidadesReceta = parseInt(recetaSeleccionada?.unidades) || 1
    const factorCantidad = cantidadNum / unidadesReceta
    const costoRecetaAjustado = costoReceta * factorCantidad
    const costoTotalProduccion = costoRecetaAjustado + costoInsumos

    // Agregar insumo al form
    const agregarInsumo = () => {
        if (!insumoForm.nombre || !insumoForm.cantidadUso) return
        const item = inventario.find(i =>
            i.nombre.toLowerCase().trim() === insumoForm.nombre.toLowerCase().trim()
        )
        let ins = { ...insumoForm, id: crypto.randomUUID() }
        if (item) {
            ins = {
                ...ins,
                cantidadPaquete: item.tamañoPaquete || "",
                unidadPaquete: item.unidad || "unidad",
                precioPaquete: item.costoPorPaquete || ""
            }
        }
        ins.costoParcial = calcularCostoParcial(ins).toFixed(1)
        setForm(prev => ({ ...prev, insumos: [...prev.insumos, ins] }))
        setInsumoForm(INSUMO_FORM_INICIAL)
    }

    const eliminarInsumo = (id) =>
        setForm(prev => ({ ...prev, insumos: prev.insumos.filter(i => i.id !== id) }))

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
            insumos: form.insumos || [],
            costoReceta: costoRecetaAjustado,
            costoInsumos,
            costoTotal: costoTotalProduccion,
        })
        setProduccion(prev => [nuevo, ...prev])

        // Descontar ingredientes + insumos del inventario
        if (form.tipo === "produccion" && inventario.length > 0) {
            const factor = cantidad / (parseInt(receta.unidades) || 1)
            const ingredientes = receta.ingredientes || []
            const insumos = form.insumos || []

            const actualizaciones = inventario
                .map(item => {
                    const usadoIng = ingredientes.find(i =>
                        i.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim()
                    )
                    const usadoIns = insumos.find(i =>
                        i.nombre.toLowerCase().trim() === item.nombre.toLowerCase().trim()
                    )
                    if (!usadoIng && !usadoIns) return null

                    let consumo = 0
                    if (usadoIng) consumo += (parseFloat(usadoIng.cantidadUso) || 0) * factor
                    if (usadoIns) consumo += parseFloat(usadoIns.cantidadUso) || 0

                    const nuevaCantidad = parseFloat(
                        Math.max(0, (parseFloat(item.cantidad) || 0) - consumo).toFixed(2)
                    )
                    return apiInventario.actualizar({ id: item._id, cantidad: nuevaCantidad, cantidadBase: nuevaCantidad })
                })
                .filter(Boolean)

            await Promise.all(actualizaciones)
            recargar()
        }

        setForm(FORM_INICIAL)
        setInsumoForm(INSUMO_FORM_INICIAL)
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
        insumoForm, setInsumoForm,
        produccion,
        recetas,
        inventario,
        cargando,
        recetaSeleccionada,
        stockPorReceta,
        previewDescuento,
        hayStockInsuficiente,
        costoInsumos,
        costoRecetaAjustado,
        costoTotalProduccion,
        historial,
        guardar,
        eliminar,
        agregarInsumo,
        eliminarInsumo,
    }
}