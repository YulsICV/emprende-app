import { useState, useEffect } from "react"
import { apiRecetario, apiInventario } from "./useApi"

export function useRecetario() {
    const [recetas, setRecetas] = useState([])
    const [inventario, setInventario] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        Promise.all([
            apiRecetario.getAll(),
            apiInventario.getAll(),
        ]).then(([recs, inv]) => {
            setRecetas(Array.isArray(recs) ? recs : [])
            setInventario(Array.isArray(inv) ? inv : [])
        }).catch(err => console.error("Error cargando recetario:", err))
        .finally(() => setCargando(false))
    }, [])

    const guardarReceta = async (form, editando) => {
        if (!form.nombre.trim()) return

        const datos = {
            nombre: form.nombre,
            categoria: form.categoria,
            unidades: form.unidades,
            fotoBase64: form.fotoBase64 || "",
            fotoUrl: form.fotoUrl || "",
            equipo: form.equipo || "",
            temperatura: form.temperatura || "",
            tiempoCoccion: form.tiempoCoccion || "",
            pasos: form.pasos || [],
            ingredientes: form.ingredientes || [],
        }

        if (editando) {
            const updated = await apiRecetario.actualizar({ ...datos, id: editando._id })
            setRecetas(prev => prev.map(r => r._id === editando._id ? updated : r))
        } else {
            const nueva = await apiRecetario.crear(datos)
            setRecetas(prev => [nueva, ...prev])
        }
    }

    const eliminarReceta = async (receta) => {
        await apiRecetario.eliminar(receta._id)
        setRecetas(prev => prev.filter(r => r._id !== receta._id))
    }

    const agregarIngredienteInventario = async (nuevoIngrediente) => {
        const yaExiste = inventario.some(i =>
            i.nombre.toLowerCase().trim() === nuevoIngrediente.nombre.toLowerCase().trim()
        )
        if (yaExiste) return
        const creado = await apiInventario.crear(nuevoIngrediente)
        setInventario(prev => [creado, ...prev])
    }

    return {
        recetas,
        inventario,
        cargando,
        guardarReceta,
        eliminarReceta,
        agregarIngredienteInventario,
    }
}