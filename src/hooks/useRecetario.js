import { useState, useEffect } from "react"
import { apiRecetario, apiInventario, apiRecetas } from "./useApi"
import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"

function calcularCostoParcial(ing, inventario) {
    const item = inventario.find(i =>
        i.nombre.toLowerCase().trim() === ing.nombre.toLowerCase().trim()
    )
    if (!item) return 0

    const cantidadUso = parseFloat(ing.cantidadUso) || 0
    const cantidadPaquete = parseFloat(item.tamañoPaquete) || 0
    const precioPaquete = parseFloat(item.costoPorPaquete) || 0
    if (!cantidadUso || !cantidadPaquete || !precioPaquete) return 0

    const enGramosUso = CONVERSIONES_A_GRAMOS[ing.unidadUso]
    const enGramosPaquete = CONVERSIONES_A_GRAMOS[item.unidad]

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

        const datosRecetario = {
            nombre: form.nombre,
            categoria: form.categoria,
            unidades: form.unidades,
            fotoBase64: form.fotoBase64 || "",
            fotoUrl: form.fotoUrl || "",
            equipo: form.equipo || [],
            temperatura: form.temperatura || "",
            tiempoCoccion: form.tiempoCoccion || "",
            pasos: form.pasos || [],
            ingredientes: (form.ingredientes || []).map(i => ({
                nombre: i.nombre,
                cantidadUso: i.cantidadUso,
                unidadUso: i.unidadUso,
                id: i.id,
            })),
        }

        if (editando) {
            const updated = await apiRecetario.actualizar({ ...datosRecetario, id: editando._id })
            setRecetas(prev => prev.map(r => r._id === editando._id ? updated : r))

            const recetaCostoId = editando.recetaCostoId
            if (recetaCostoId) {
                const ingredientesConCosto = (form.ingredientes || []).map(ing => ({
                    ...ing,
                    cantidadPaquete: inventario.find(i => i.nombre.toLowerCase() === ing.nombre.toLowerCase())?.tamañoPaquete || ing.cantidadPaquete || "",
                    unidadPaquete: inventario.find(i => i.nombre.toLowerCase() === ing.nombre.toLowerCase())?.unidad || ing.unidadPaquete || "g",
                    precioPaquete: inventario.find(i => i.nombre.toLowerCase() === ing.nombre.toLowerCase())?.costoPorPaquete || ing.precioPaquete || "",
                    costoParcial: calcularCostoParcial(ing, inventario).toFixed(1),
                }))

                const costoIngredientes = ingredientesConCosto.reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
                const unidades = parseFloat(form.unidades) || 0
                const costoPorUnidad = unidades > 0 ? costoIngredientes / unidades : 0

                await apiRecetas.actualizar({
                    id: recetaCostoId,
                    nombre: form.nombre,
                    categoria: form.categoria,
                    unidades,
                    ingredientes: ingredientesConCosto,
                    fotoBase64: form.fotoBase64 || "",
                    fotoUrl: form.fotoUrl || "",
                    equipo: form.equipo || [],
                    temperatura: form.temperatura || "",
                    tiempoCoccion: form.tiempoCoccion || "",
                    pasos: form.pasos || [],
                    costoTotal: parseFloat(costoIngredientes.toFixed(2)),
                    costoPorUnidad: parseFloat(costoPorUnidad.toFixed(2)),
                })
            }
        } else {
            const nueva = await apiRecetario.crear(datosRecetario)
            setRecetas(prev => [nueva, ...prev])
        }
    }

    const eliminarReceta = async (receta) => {
        await apiRecetario.eliminar(receta._id)
        setRecetas(prev => prev.filter(r => r._id !== receta._id))

        if (receta.recetaCostoId) {
            await apiRecetas.eliminar(receta.recetaCostoId)
        }
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