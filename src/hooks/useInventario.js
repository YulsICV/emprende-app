import { useState, useEffect } from "react"
import { parsearNumero } from "../utils/parsearNumero"
import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"
import { apiInventario } from "./useApi"

const FORM_INICIAL = {
    nombre: "",
    cantidadPaquetes: "",
    tamañoPaquete: "",
    unidad: "g",
    costoPorPaquete: "",
    minimo: "",
    tipo: "ingrediente"
}

function aGramos(cantidad, unidad) {
    const n = parsearNumero(cantidad)
    const factor = CONVERSIONES_A_GRAMOS[unidad]
    if (!factor) return n
    return n * factor
}

export function formatearCantidad(cantidadBase, unidad) {
    const factor = CONVERSIONES_A_GRAMOS[unidad]
    if (!factor) return `${cantidadBase} ${unidad}`
    const enUnidadOriginal = cantidadBase / factor
    if ((unidad === "kg" || unidad === "l" || unidad === "L") && enUnidadOriginal < 1) {
        const unidadMenor = unidad === "kg" ? "g" : "ml"
        return `${Math.round(cantidadBase)} ${unidadMenor}`
    }
    if (unidad === "lb" && enUnidadOriginal < 1) {
        return `${Math.round(cantidadBase / CONVERSIONES_A_GRAMOS["oz"])} oz`
    }
    const val = parseFloat(enUnidadOriginal.toFixed(2))
    return `${val} ${unidad}`
}

export function useInventario() {
    const [form, setForm] = useState(FORM_INICIAL)
    const [editandoId, setEditandoId] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [modalEliminar, setModalEliminar] = useState(null)
    const [inventario, setInventario] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        apiInventario.getAll()
            .then(data => setInventario(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error cargando inventario:", err))
            .finally(() => setCargando(false))
    }, [])

    const numPaquetes = parsearNumero(form.cantidadPaquetes)
    const numTamaño   = parsearNumero(form.tamañoPaquete)
    const numCosto    = parsearNumero(form.costoPorPaquete)
    const numMinimo   = parsearNumero(form.minimo)
    const totalInventario = numPaquetes * numTamaño
    const costoTotal      = numPaquetes * numCosto

    const bajoStock = inventario.filter(i => {
        if (!i.minimo) return false
        const cantidadEnBase = i.cantidadBase ?? aGramos(i.cantidad, i.unidad)
        const minimoEnBase = aGramos(parsearNumero(i.minimo), i.unidad)
        return cantidadEnBase <= minimoEnBase
    })

    const itemsFiltrados = inventario.filter(i =>
        i.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    const guardar = async () => {
        if (!form.nombre || !form.cantidadPaquetes || !form.tamañoPaquete) return

        const cantidadTotal = numPaquetes * numTamaño
        const cantidadBase = aGramos(cantidadTotal, form.unidad)
        const costoPorGramo = cantidadBase > 0 ? (numPaquetes * numCosto) / cantidadBase : 0

        const datos = {
            nombre: form.nombre,
            tipo: form.tipo || "ingrediente",
            cantidadPaquetes: numPaquetes,
            tamañoPaquete: numTamaño,
            unidad: form.unidad,
            costoPorPaquete: numCosto,
            minimo: numMinimo || "",
            cantidad: cantidadTotal,
            cantidadBase,
            costoTotal: numPaquetes * numCosto,
            costoPorGramo,
        }

        try {
            if (editandoId) {
                const updated = await apiInventario.actualizar({ ...datos, id: editandoId })
                if (!updated?._id) throw new Error(updated?.error || "Error al actualizar")
                setInventario(prev => prev.map(i => i._id === editandoId ? updated : i))
                setEditandoId(null)
            } else {
                const nuevo = await apiInventario.crear(datos)
                if (!nuevo?._id) throw new Error(nuevo?.error || "Error al guardar")
                setInventario(prev => [nuevo, ...prev])
            }
            setForm(FORM_INICIAL)
        } catch (err) {
            console.error("Error guardando inventario:", err)
            alert("❌ No se pudo guardar: " + err.message)
        }
    }

    const editar = (item) => {
        setForm({
            nombre: item.nombre,
            tipo: item.tipo || "ingrediente",
            cantidadPaquetes: String(item.cantidadPaquetes),
            tamañoPaquete: String(item.tamañoPaquete),
            unidad: item.unidad || "g",
            costoPorPaquete: item.costoPorPaquete ? String(item.costoPorPaquete) : "",
            minimo: item.minimo ? String(item.minimo) : ""
        })
        setEditandoId(item._id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const cancelarEdicion = () => {
        setEditandoId(null)
        setForm(FORM_INICIAL)
    }

    const eliminar = async (id) => {
        try {
            await apiInventario.eliminar(id)
            setInventario(prev => prev.filter(i => i._id !== id))
            setModalEliminar(null)
        } catch (err) {
            console.error("Error eliminando:", err)
            alert("❌ No se pudo eliminar: " + err.message)
        }
    }

    return {
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
    }
}