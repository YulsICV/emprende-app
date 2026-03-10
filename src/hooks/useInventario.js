import { useState, useEffect } from "react"
import { parsearNumero } from "../utils/parsearNumero"
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

// FIX: convierte a unidad base para comparar correctamente kg vs g, L vs ml
function aUnidadBase(cantidad, unidad) {
    const n = parsearNumero(cantidad)
    switch (unidad) {
        case "kg": return n * 1000
        case "L":  return n * 1000
        default:   return n
    }
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

    // FIX: comparar en unidad base para que 1kg vs 500g funcione correctamente
    const bajoStock = inventario.filter(i => {
        if (!i.minimo) return false
        const cantidadBase = aUnidadBase(i.cantidad, i.unidad)
        const minimoBase   = aUnidadBase(i.minimo,   i.unidad)
        return cantidadBase <= minimoBase
    })

    const itemsFiltrados = inventario.filter(i =>
        i.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    const guardar = async () => {
        if (!form.nombre || !form.cantidadPaquetes || !form.tamañoPaquete) return

        const datos = {
            nombre: form.nombre,
            tipo: form.tipo || "ingrediente",
            cantidadPaquetes: numPaquetes,
            tamañoPaquete: numTamaño,
            unidad: form.unidad,
            costoPorPaquete: numCosto,
            minimo: numMinimo || "",
            cantidad: numPaquetes * numTamaño,
            costoTotal: numPaquetes * numCosto,
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