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

export function useInventario() {
    const [form, setForm] = useState(FORM_INICIAL)
    const [editandoId, setEditandoId] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [modalEliminar, setModalEliminar] = useState(null)
    const [inventario, setInventario] = useState([])
    const [cargando, setCargando] = useState(true)

    // ── Cargar inventario desde MongoDB al montar ──
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

    const bajoStock = inventario.filter(i =>
        i.minimo && parsearNumero(i.cantidad) <= parsearNumero(i.minimo)
    )
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

        if (editandoId) {
            const updated = await apiInventario.actualizar({ ...datos, id: editandoId })
            setInventario(prev => prev.map(i => i._id === editandoId ? updated : i))
            setEditandoId(null)
        } else {
            const nuevo = await apiInventario.crear(datos)
            setInventario(prev => [nuevo, ...prev])
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
        setEditandoId(item._id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const cancelarEdicion = () => {
        setEditandoId(null)
        setForm(FORM_INICIAL)
    }

    const eliminar = async (id) => {
        await apiInventario.eliminar(id)
        setInventario(prev => prev.filter(i => i._id !== id))
        setModalEliminar(null)
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
