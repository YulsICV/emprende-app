import { useState } from "react"
import { parsearNumero } from "../utils/parsearNumero"

const FORM_INICIAL = {
    nombre: "",
    cantidadPaquetes: "",
    tamañoPaquete: "",
    unidad: "g",
    costoPorPaquete: "",
    minimo: "",
    tipo: "ingrediente"
}

export function useInventario(db, actualizarDb) {
    const [form, setForm] = useState(FORM_INICIAL)
    const [editandoId, setEditandoId] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [modalEliminar, setModalEliminar] = useState(null)

    const inventario = db.inventario || []
    const numPaquetes = parsearNumero(form.cantidadPaquetes)
    const numTamaño   = parsearNumero(form.tamañoPaquete)
    const numCosto    = parsearNumero(form.costoPorPaquete)
    const numMinimo   = parsearNumero(form.minimo)
    const totalInventario = numPaquetes * numTamaño
    const costoTotal      = numPaquetes * numCosto

    const bajoStock = inventario.filter(i =>
        i.minimo && parsearNumero(i.cantidad) <= parsearNumero(i.minimo)
    )
    const itemsFiltrados = inventario.filter(i =>
        i.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    const guardar = () => {
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
        if (editandoId) {
            actualizarDb("inventario", inventario.map(i =>
                i.id === editandoId ? { ...datos, id: editandoId } : i
            ))
            setEditandoId(null)
        } else {
            actualizarDb("inventario", [...inventario, {
                ...datos,
                id: crypto.randomUUID(),
                fecha: new Date().toISOString()
            }])
        }
        setForm(FORM_INICIAL)
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
        setEditandoId(item.id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const cancelarEdicion = () => {
        setEditandoId(null)
        setForm(FORM_INICIAL)
    }

    const eliminar = (id) => {
        actualizarDb("inventario", inventario.filter(i => i.id !== id))
        setModalEliminar(null)
    }

    return {
        form, setForm,
        editandoId,
        busqueda, setBusqueda,
        modalEliminar, setModalEliminar,
        inventario,
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
