import { useState, useEffect, useCallback } from "react"
import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"
import { apiRecetas, apiInventario, apiRecetario } from "./useApi"

const FORM_INICIAL = {
    nombre: "", categoria: "Clásica", unidades: "",
    ingredientes: [], insumos: [],
    margenMay: 35, margenMen: 70, envioGratis: false,
    fotoBase64: "", fotoUrl: "",
    equipo: "", temperatura: "", tiempoCoccion: "",
    pasos: [],
    recetarioId: null,
}

const ING_FORM_INICIAL = {
    nombre: "", cantidadUso: "", unidadUso: "taza",
    cantidadPaquete: "", unidadPaquete: "g", precioPaquete: ""
}

function calcularCostoParcial(item, CONVERSIONES) {
    const cantidadUso = parseFloat(item.cantidadUso) || 0
    const cantidadPaquete = parseFloat(item.cantidadPaquete) || 0
    const precioPaquete = parseFloat(item.precioPaquete) || 0
    if (!cantidadUso || !cantidadPaquete || !precioPaquete) return 0
    const enGramosUso = CONVERSIONES[item.unidadUso]
    const enGramosPaquete = CONVERSIONES[item.unidadPaquete]
    let costo
    if (enGramosUso === null || enGramosPaquete === null || enGramosUso === undefined || enGramosPaquete === undefined) {
        costo = (precioPaquete / cantidadPaquete) * cantidadUso
    } else {
        const usoEnGramos = cantidadUso * enGramosUso
        const paqueteEnGramos = cantidadPaquete * enGramosPaquete
        costo = (precioPaquete / paqueteEnGramos) * usoEnGramos
    }
    return isNaN(costo) ? 0 : costo
}

function enriquecerIngrediente(ing, inventario) {
    const item = inventario.find(i =>
        i.nombre.toLowerCase().trim() === ing.nombre.toLowerCase().trim()
    )
    if (!item) return {
        ...ing,
        cantidadPaquete: ing.cantidadPaquete || "",
        unidadPaquete: ing.unidadPaquete || ing.unidadUso || "g",
        precioPaquete: ing.precioPaquete || "",
        costoParcial: ing.costoParcial || "0"
    }
    const itemParaCalculo = {
        cantidadUso: ing.cantidadUso,
        unidadUso: ing.unidadUso,
        cantidadPaquete: item.tamañoPaquete || "",
        unidadPaquete: item.unidad || "g",
        precioPaquete: item.costoPorPaquete || "",
    }
    const costo = calcularCostoParcial(itemParaCalculo, CONVERSIONES_A_GRAMOS)
    return {
        ...ing,
        cantidadPaquete: itemParaCalculo.cantidadPaquete,
        unidadPaquete: itemParaCalculo.unidadPaquete,
        precioPaquete: itemParaCalculo.precioPaquete,
        costoParcial: costo.toFixed(1)
    }
}

// Versión limpia para recetario: solo nombre, pasos, ingredientes sin costos
function construirEntradaRecetario(form, recetaCostoId) {
    return {
        nombre: form.nombre,
        categoria: form.categoria,
        unidades: form.unidades,
        envioGratis: form.envioGratis,
        fotoBase64: form.fotoBase64 || "",
        fotoUrl: form.fotoUrl || "",
        equipo: form.equipo || "",
        temperatura: form.temperatura || "",
        tiempoCoccion: form.tiempoCoccion || "",
        pasos: form.pasos || [],
        ingredientes: (form.ingredientes || []).map(i => ({
            nombre: i.nombre,
            cantidadUso: i.cantidadUso,
            unidadUso: i.unidadUso,
        })),
        insumos: (form.insumos || []).map(i => ({
            nombre: i.nombre,
            cantidadUso: i.cantidadUso,
            unidadUso: i.unidadUso,
        })),
        recetaCostoId,
        fecha: new Date().toISOString(),
    }
}

export function useRecetas() {
    const [form, setForm] = useState(FORM_INICIAL)
    const [ingForm, setIngForm] = useState(ING_FORM_INICIAL)
    const [insumoForm, setInsumoForm] = useState(ING_FORM_INICIAL)
    const [editandoId, setEditandoId] = useState(null)
    const [recetasCostos, setRecetasCostos] = useState([])
    const [recetario, setRecetario] = useState([])
    const [inventario, setInventario] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        Promise.all([
            apiRecetas.getAll(),
            apiInventario.getAll(),
            apiRecetario.getAll(),
        ]).then(([recetas, inv, recetarioData]) => {
            setRecetasCostos(Array.isArray(recetas) ? recetas : [])
            setInventario(Array.isArray(inv) ? inv : [])
            setRecetario(Array.isArray(recetarioData) ? recetarioData : [])
        }).catch(err => console.error("Error cargando datos:", err))
        .finally(() => setCargando(false))
    }, [])

    // ── Cálculos ──
    const costoIngredientes = form.ingredientes.reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
    const costoInsumos = (form.insumos || []).reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
    const costoTotal = costoIngredientes + costoInsumos
    const costoPorUnidad = form.unidades > 0 ? costoTotal / form.unidades : 0
    const precioMayoreo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMay / 100)) : 0
    const precioMenudeo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMen / 100)) : 0

    // ── Editar receta ──
    const editarReceta = useCallback((receta) => {
        const ingredientesEnriquecidos = (receta.ingredientes || []).map(ing => enriquecerIngrediente(ing, inventario))
        const insumosEnriquecidos = (receta.insumos || []).map(ins => enriquecerIngrediente(ins, inventario))
        setForm({
            nombre: receta.nombre,
            categoria: receta.categoria,
            unidades: receta.unidades,
            ingredientes: ingredientesEnriquecidos,
            insumos: insumosEnriquecidos,
            margenMay: receta.margenMay,
            margenMen: receta.margenMen,
            envioGratis: receta.envioGratis || false,
            fotoBase64: receta.fotoBase64 || "",
            fotoUrl: receta.fotoUrl || "",
            equipo: receta.equipo || "",
            temperatura: receta.temperatura || "",
            tiempoCoccion: receta.tiempoCoccion || "",
            pasos: receta.pasos || [],
            recetarioId: receta.recetarioId || null,
        })
        setEditandoId(receta._id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [inventario])

    // ── Guardar receta ──
    const guardarReceta = async () => {
        if (!form.nombre || !form.unidades || form.ingredientes.length === 0) return

        const datos = {
            ...form,
            costoTotal,
            costoPorUnidad,
            precioMayoreo,
            precioMenudeo,
            fecha: new Date().toISOString()
        }

        if (editandoId) {
            // Actualizar en Recetas & Costos
            const updated = await apiRecetas.actualizar({ ...datos, id: editandoId })
            setRecetasCostos(prev => prev.map(r => r._id === editandoId ? updated : r))

            // Sincronizar recetario
            const entradaRecetario = construirEntradaRecetario(form, editandoId)
            if (form.recetarioId) {
                // Ya existe — actualizar
                const updatedRec = await apiRecetario.actualizar({ ...entradaRecetario, id: form.recetarioId })
                setRecetario(prev => prev.map(r => r._id === form.recetarioId ? updatedRec : r))
            } else {
                // No tenía vínculo — crear y vincular
                const nuevaEntrada = await apiRecetario.crear(entradaRecetario)
                setRecetario(prev => [nuevaEntrada, ...prev])
                await apiRecetas.actualizar({ id: editandoId, recetarioId: nuevaEntrada._id })
                setRecetasCostos(prev => prev.map(r =>
                    r._id === editandoId ? { ...r, recetarioId: nuevaEntrada._id } : r
                ))
            }

            setEditandoId(null)
        } else {
            // Crear en Recetas & Costos
            const nueva = await apiRecetas.crear(datos)
            setRecetasCostos(prev => [nueva, ...prev])

            // Crear automáticamente en recetario (sin costos ni precios)
            const entradaRecetario = construirEntradaRecetario(form, nueva._id)
            const nuevaEntrada = await apiRecetario.crear(entradaRecetario)
            setRecetario(prev => [nuevaEntrada, ...prev])

            // Guardar vínculo bidireccional
            await apiRecetas.actualizar({ id: nueva._id, recetarioId: nuevaEntrada._id })
            setRecetasCostos(prev => prev.map(r =>
                r._id === nueva._id ? { ...r, recetarioId: nuevaEntrada._id } : r
            ))
        }

        setForm(FORM_INICIAL)
    }

    // ── Eliminar receta ──
    const eliminarReceta = async (id) => {
        // id ya viene como _id desde ListaRecetas (corregido)
        const receta = recetasCostos.find(r => r._id === id)

        await apiRecetas.eliminar(id)
        setRecetasCostos(prev => prev.filter(r => r._id !== id))

        // Eliminar entrada vinculada del recetario
        if (receta?.recetarioId) {
            await apiRecetario.eliminar(receta.recetarioId)
            setRecetario(prev => prev.filter(r => r._id !== receta.recetarioId))
        }
    }

    // ── Ingredientes ──
    const agregarIngrediente = () => {
        if (!ingForm.nombre || !ingForm.cantidadUso) return
        const item = inventario.find(i => i.nombre.toLowerCase().trim() === ingForm.nombre.toLowerCase().trim())
        let ing = { ...ingForm, id: crypto.randomUUID() }
        if (item) {
            ing = { ...ing, cantidadPaquete: item.tamañoPaquete || "", unidadPaquete: item.unidad || "g", precioPaquete: item.costoPorPaquete || "" }
        }
        ing.costoParcial = calcularCostoParcial(ing, CONVERSIONES_A_GRAMOS).toFixed(1)
        setForm(prev => ({ ...prev, ingredientes: [...prev.ingredientes, ing] }))
        setIngForm(ING_FORM_INICIAL)
    }

    const eliminarIngrediente = (id) =>
        setForm(prev => ({ ...prev, ingredientes: prev.ingredientes.filter(i => i.id !== id) }))

    const editarIngrediente = (id, campo, valor) => {
        setForm(prev => ({
            ...prev, ingredientes: prev.ingredientes.map(ing => {
                if (ing.id !== id) return ing
                const updated = { ...ing, [campo]: valor }
                if (['cantidadUso', 'unidadUso', 'cantidadPaquete', 'unidadPaquete', 'precioPaquete'].includes(campo)) {
                    updated.costoParcial = calcularCostoParcial(updated, CONVERSIONES_A_GRAMOS).toFixed(1)
                }
                return updated
            })
        }))
    }

    // ── Insumos ──
    const agregarInsumo = () => {
        if (!insumoForm.nombre || !insumoForm.cantidadUso) return
        const item = inventario.find(i => i.nombre.toLowerCase().trim() === insumoForm.nombre.toLowerCase().trim())
        let ins = { ...insumoForm, id: crypto.randomUUID() }
        if (item) {
            ins = { ...ins, cantidadPaquete: item.tamañoPaquete || "", unidadPaquete: item.unidad || "g", precioPaquete: item.costoPorPaquete || "" }
        }
        ins.costoParcial = calcularCostoParcial(ins, CONVERSIONES_A_GRAMOS).toFixed(1)
        setForm(prev => ({ ...prev, insumos: [...(prev.insumos || []), ins] }))
        setInsumoForm(ING_FORM_INICIAL)
    }

    const eliminarInsumo = (id) =>
        setForm(prev => ({ ...prev, insumos: prev.insumos.filter(i => i.id !== id) }))

    const editarInsumo = (id, campo, valor) => {
        setForm(prev => ({
            ...prev, insumos: prev.insumos.map(ins => {
                if (ins.id !== id) return ins
                const updated = { ...ins, [campo]: valor }
                if (['cantidadUso', 'unidadUso', 'cantidadPaquete', 'unidadPaquete', 'precioPaquete'].includes(campo)) {
                    updated.costoParcial = calcularCostoParcial(updated, CONVERSIONES_A_GRAMOS).toFixed(1)
                }
                return updated
            })
        }))
    }

    // ── Agregar a inventario ──
    const agregarAInventario = async (nuevoItem) => {
        const yaExiste = inventario.some(i => i.nombre.toLowerCase().trim() === nuevoItem.nombre.toLowerCase().trim())
        if (yaExiste) return
        const creado = await apiInventario.crear(nuevoItem)
        setInventario(prev => [creado, ...prev])
    }

    return {
        form, setForm,
        ingForm, setIngForm,
        insumoForm, setInsumoForm,
        editandoId, setEditandoId,
        recetasCostos,
        recetario,
        inventario,
        cargando,
        costoIngredientes,
        costoInsumos,
        costoTotal,
        costoPorUnidad,
        precioMayoreo,
        precioMenudeo,
        guardarReceta,
        eliminarReceta,
        editarReceta,
        agregarIngrediente,
        eliminarIngrediente,
        editarIngrediente,
        agregarInsumo,
        eliminarInsumo,
        editarInsumo,
        agregarAInventario,
    }
}