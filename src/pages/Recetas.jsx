import { useState, useMemo, useCallback } from "react"
import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"
import FormularioRecetas from "../components/recetas/FormularioRecetas"
import FormularioIngrediente from "../components/recetas/FormularioIngrediente"
import TablaIngredientes from "../components/recetas/TablaIngredientes"
import ListaRecetas from "../components/recetas/ListaRecetas"

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

// Función mejorada para calcular costo parcial con conversión de unidades
function calcularCostoParcial(item, CONVERSIONES) {
    const cantidadUso = parseFloat(item.cantidadUso) || 0
    const cantidadPaquete = parseFloat(item.cantidadPaquete) || 0
    const precioPaquete = parseFloat(item.precioPaquete) || 0
    
    if (!cantidadUso || !cantidadPaquete || !precioPaquete) return 0

    const enGramosUso = CONVERSIONES[item.unidadUso]
    const enGramosPaquete = CONVERSIONES[item.unidadPaquete]
    
    let costo
    // Si alguna unidad no está en las conversiones, asumimos que son la misma unidad base
    if (enGramosUso === null || enGramosPaquete === null || enGramosUso === undefined || enGramosPaquete === undefined) {
        // Conversión directa si son la misma unidad, o proporcional si son diferentes pero compatibles
        if (item.unidadUso === item.unidadPaquete) {
            costo = (precioPaquete / cantidadPaquete) * cantidadUso
        } else {
            // Intentar calcular proporcionalmente (para unidades como "taza" a "g" si no hay conversión)
            costo = (precioPaquete / cantidadPaquete) * cantidadUso
        }
    } else {
        // Conversión mediante gramos
        const usoEnGramos = cantidadUso * enGramosUso
        const paqueteEnGramos = cantidadPaquete * enGramosPaquete
        costo = (precioPaquete / paqueteEnGramos) * usoEnGramos
    }
    return isNaN(costo) ? 0 : costo
}

// Función para enriquecer ingredientes con datos del inventario
function enriquecerIngredienteConInventario(ing, inventario) {
    const itemInventario = inventario.find(i => 
        i.nombre.toLowerCase().trim() === ing.nombre.toLowerCase().trim()
    )
    
    if (!itemInventario) {
        // Si no está en inventario, devolver el ingrediente como está (con campos vacíos para costo)
        return {
            ...ing,
            cantidadPaquete: ing.cantidadPaquete || "",
            unidadPaquete: ing.unidadPaquete || ing.unidadUso || "g",
            precioPaquete: ing.precioPaquete || "",
            costoParcial: ing.costoParcial || "0"
        }
    }

    // Usar calcularCostoParcial con conversión de unidades correcta
    const itemParaCalculo = {
        cantidadUso: ing.cantidadUso,
        unidadUso: ing.unidadUso,
        cantidadPaquete: itemInventario.tamañoPaquete || "",
        unidadPaquete: itemInventario.unidad || "g",
        precioPaquete: itemInventario.costoPorPaquete || "",
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

export default function Recetas({ db, actualizarDb }) {
    const [editandoId, setEditandoId] = useState(null)
    const [form, setForm] = useState(FORM_INICIAL)
    const [ingForm, setIngForm] = useState(ING_FORM_INICIAL)
    const [insumoForm, setInsumoForm] = useState(ING_FORM_INICIAL)

    const recetario = useMemo(() => db.recetario || [], [db.recetario])
    const inventario = useMemo(() => db.inventario || [], [db.inventario])
    const recetasCostos = useMemo(() => db.recetas || [], [db.recetas])

    // Buscar receta coincidente en recetario (para mostrar sugerencia)
    const recetaCoincidente = useMemo(() => {
        if (!form.nombre.trim() || form.nombre.trim().length < 3) return null
        return recetario.find(r =>
            r.nombre.toLowerCase().trim() === form.nombre.toLowerCase().trim()
        )
    }, [form.nombre, recetario])

    // Buscar si ya existe en costos
    const recetaCostosExistente = useMemo(() => {
        if (!recetaCoincidente) return null
        return recetasCostos.find(rec =>
            rec.recetarioId === recetaCoincidente.id ||
            rec.nombre.toLowerCase().trim() === recetaCoincidente.nombre.toLowerCase().trim()
        )
    }, [recetaCoincidente, recetasCostos])

    const editarReceta = useCallback((receta) => {
        // Al editar, enriquecer ingredientes con datos actualizados del inventario
        const ingredientesEnriquecidos = (receta.ingredientes || []).map(ing => 
            enriquecerIngredienteConInventario(ing, inventario)
        )
        const insumosEnriquecidos = (receta.insumos || []).map(ins => 
            enriquecerIngredienteConInventario(ins, inventario)
        )

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
        setEditandoId(receta.id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [inventario])

    // Función para cargar receta desde recetario
    const cargarDesdeRecetario = useCallback(() => {
        if (!recetaCoincidente) return

        if (recetaCostosExistente) {
            editarReceta(recetaCostosExistente)
        } else {
            // Nueva receta desde recetario - enriquecer ingredientes con inventario
            const ingredientesEnriquecidos = (recetaCoincidente.ingredientes || []).map(ing => ({
                ...enriquecerIngredienteConInventario(
                    { ...ING_FORM_INICIAL, nombre: ing.nombre, cantidadUso: ing.cantidadUso || "", unidadUso: ing.unidadUso || "taza", id: crypto.randomUUID() },
                    inventario
                )
            }))

            setForm(prev => ({
                ...prev,
                fotoBase64: recetaCoincidente.fotoBase64 || "",
                fotoUrl: recetaCoincidente.fotoUrl || "",
                nombre: recetaCoincidente.nombre,
                categoria: recetaCoincidente.categoria || prev.categoria,
                unidades: recetaCoincidente.unidades || prev.unidades,
                equipo: recetaCoincidente.equipo || "",
                temperatura: recetaCoincidente.temperatura || "",
                tiempoCoccion: recetaCoincidente.tiempoCoccion || "",
                pasos: recetaCoincidente.pasos || [],
                recetarioId: recetaCoincidente.id,
                ingredientes: ingredientesEnriquecidos,
                insumos: [],
            }))
            setEditandoId(null)
        }
    }, [recetaCoincidente, recetaCostosExistente, inventario, editarReceta])

    const jalarDesdeRecetario = useCallback((r) => {
        const existente = recetasCostos.find(rec =>
            rec.recetarioId === r.id ||
            rec.nombre.toLowerCase().trim() === r.nombre.toLowerCase().trim()
        )

        if (existente) {
            editarReceta(existente)
            return
        }

        // Enriquecer ingredientes con datos del inventario
        const ingredientesEnriquecidos = (r.ingredientes || []).map(ing => ({
            ...enriquecerIngredienteConInventario(
                { ...ING_FORM_INICIAL, nombre: ing.nombre, cantidadUso: ing.cantidadUso || "", unidadUso: ing.unidadUso || "taza", id: crypto.randomUUID() },
                inventario
            )
        }))

        setForm(prev => ({
            ...prev,
            fotoBase64: r.fotoBase64 || "",
            fotoUrl: r.fotoUrl || "",
            equipo: r.equipo || "",
            nombre: r.nombre,
            categoria: r.categoria || prev.categoria,
            unidades: r.unidades || prev.unidades,
            temperatura: r.temperatura || "",
            tiempoCoccion: r.tiempoCoccion || "",
            pasos: r.pasos || [],
            recetarioId: r.id,
            ingredientes: ingredientesEnriquecidos,
            insumos: [],
        }))
        setEditandoId(null)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [recetasCostos, inventario, editarReceta])

    // ── INGREDIENTES ──
    const agregarIngrediente = () => {
        if (!ingForm.nombre || !ingForm.cantidadUso) return
        
        // Buscar en inventario primero para autocompletar datos
        const itemInventario = inventario.find(i => 
            i.nombre.toLowerCase().trim() === ingForm.nombre.toLowerCase().trim()
        )
        
        let ingredienteCompleto = { ...ingForm, id: crypto.randomUUID() }
        
        if (itemInventario) {
            ingredienteCompleto = {
                ...ingredienteCompleto,
                cantidadPaquete: itemInventario.tamañoPaquete || "",
                unidadPaquete: itemInventario.unidad || "g",
                precioPaquete: itemInventario.costoPorPaquete || "",
            }
        }
        const costoIng = calcularCostoParcial(ingredienteCompleto, CONVERSIONES_A_GRAMOS)
        ingredienteCompleto.costoParcial = costoIng.toFixed(1)

        setForm({ ...form, ingredientes: [...form.ingredientes, ingredienteCompleto] })
        setIngForm(ING_FORM_INICIAL)
    }

    const eliminarIngrediente = (id) =>
        setForm({ ...form, ingredientes: form.ingredientes.filter(i => i.id !== id) })

    const editarIngrediente = (id, campo, valor) => {
        setForm({
            ...form, ingredientes: form.ingredientes.map(ing => {
                if (ing.id !== id) return ing
                const updated = { ...ing, [campo]: valor }
                // Recalcular costo si cambian datos relevantes
                if (['cantidadUso', 'unidadUso', 'cantidadPaquete', 'unidadPaquete', 'precioPaquete'].includes(campo)) {
                    updated.costoParcial = calcularCostoParcial(updated, CONVERSIONES_A_GRAMOS).toFixed(1)
                }
                return updated
            })
        })
    }

    // ── INSUMOS ──
    const agregarInsumo = () => {
        if (!insumoForm.nombre || !insumoForm.cantidadUso) return
        
        // Buscar en inventario primero
        const itemInventario = inventario.find(i => 
            i.nombre.toLowerCase().trim() === insumoForm.nombre.toLowerCase().trim()
        )
        
        let insumoCompleto = { ...insumoForm, id: crypto.randomUUID() }
        
        if (itemInventario) {
            insumoCompleto = {
                ...insumoCompleto,
                cantidadPaquete: itemInventario.tamañoPaquete || "",
                unidadPaquete: itemInventario.unidad || "g",
                precioPaquete: itemInventario.costoPorPaquete || "",
            }
        }
        const costoIns = calcularCostoParcial(insumoCompleto, CONVERSIONES_A_GRAMOS)
        insumoCompleto.costoParcial = costoIns.toFixed(1)

        setForm({ ...form, insumos: [...(form.insumos || []), insumoCompleto] })
        setInsumoForm(ING_FORM_INICIAL)
    }

    const eliminarInsumo = (id) =>
        setForm({ ...form, insumos: form.insumos.filter(i => i.id !== id) })

    const editarInsumo = (id, campo, valor) => {
        setForm({
            ...form, insumos: form.insumos.map(ins => {
                if (ins.id !== id) return ins
                const updated = { ...ins, [campo]: valor }
                if (['cantidadUso', 'unidadUso', 'cantidadPaquete', 'unidadPaquete', 'precioPaquete'].includes(campo)) {
                    updated.costoParcial = calcularCostoParcial(updated, CONVERSIONES_A_GRAMOS).toFixed(1)
                }
                return updated
            })
        })
    }

    // ── INVENTARIO ──
    const agregarAInventario = (nuevoItem) => {
        const yaExiste = inventario.some(i =>
            i.nombre.toLowerCase().trim() === nuevoItem.nombre.toLowerCase().trim()
        )
        if (yaExiste) return
        actualizarDb("inventario", [...inventario, nuevoItem])
    }

    // ── CÁLCULOS ──
    const costoIngredientes = form.ingredientes.reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
    const costoInsumos = (form.insumos || []).reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
    const costoTotal = costoIngredientes + costoInsumos
    const costoPorUnidad = form.unidades > 0 ? costoTotal / form.unidades : 0
    const precioMayoreo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMay / 100)) : 0
    const precioMenudeo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMen / 100)) : 0

    const eliminarReceta = (id) => {
        actualizarDb("recetas", recetasCostos.filter(r => r.id !== id))
    }

    // ── GUARDAR ──
    const guardarReceta = () => {
        if (!form.nombre || !form.unidades || form.ingredientes.length === 0) return

        let recetarioId = form.recetarioId

        if (!recetarioId && editandoId) {
            const recetaAnterior = recetasCostos.find(r => r.id === editandoId)
            recetarioId = recetaAnterior?.recetarioId
        }

        if (!recetarioId) {
            const existente = recetario.find(r =>
                r.nombre.toLowerCase() === form.nombre.toLowerCase()
            )
            recetarioId = existente?.id
        }

        const esNuevaEnRecetario = !recetarioId
        if (esNuevaEnRecetario) {
            recetarioId = crypto.randomUUID()
        }

        const datos = {
            ...form,
            recetarioId,
            costoTotal,
            costoPorUnidad,
            precioMayoreo,
            precioMenudeo,
            fecha: new Date().toISOString()
        }

        const recetaBase = {
            id: recetarioId,
            fotoBase64: form.fotoBase64 || "",
            fotoUrl: form.fotoUrl || "",
            equipo: form.equipo || "",
            nombre: form.nombre,
            categoria: form.categoria,
            unidades: form.unidades,
            temperatura: form.temperatura || "",
            tiempoCoccion: form.tiempoCoccion || "",
            pasos: form.pasos || [],
            ingredientes: form.ingredientes.map(i => ({
                id: i.id,
                nombre: i.nombre,
                cantidadUso: i.cantidadUso,
                unidadUso: i.unidadUso,
            })),
        }

        let nuevoRecetario
        if (esNuevaEnRecetario) {
            nuevoRecetario = [...recetario, recetaBase]
        } else {
            const idxEnRecetario = recetario.findIndex(r => r.id === recetarioId)
            if (idxEnRecetario >= 0) {
                nuevoRecetario = recetario.map((r, i) => i === idxEnRecetario ? recetaBase : r)
            } else {
                nuevoRecetario = [...recetario, recetaBase]
            }
        }

        if (editandoId) {
            actualizarDb(
                "recetas",
                recetasCostos.map(r => r.id === editandoId ? { ...datos, id: editandoId } : r),
                { recetario: nuevoRecetario }
            )
            setEditandoId(null)
        } else {
            actualizarDb(
                "recetas",
                [...recetasCostos, { ...datos, id: crypto.randomUUID() }],
                { recetario: nuevoRecetario }
            )
        }
        setForm(FORM_INICIAL)
    }

    return (
        <div>
            <h2 className="page-titulo">🍩 Recetas & Costos</h2>

            {/* Mostrar sugerencia si hay coincidencia y no estamos editando */}
            {!editandoId && recetaCoincidente && (
                <div style={{
                    background: "#e8f8f5",
                    border: "1px solid #2ec4a9",
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <span style={{ fontSize: 13, color: "#1a9e87", fontWeight: 600 }}>
                            📖 Receta encontrada en recetario: <strong>{recetaCoincidente.nombre}</strong>
                        </span>
                        {recetaCostosExistente && (
                            <span style={{ fontSize: 12, color: "#718096", marginLeft: 8 }}>
                                (Ya tiene costos calculados)
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={cargarDesdeRecetario}
                        style={{
                            all: "unset",
                            cursor: "pointer",
                            background: "#1a9e87",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
                        {recetaCostosExistente ? "Ver costos" : "Cargar datos"}
                    </button>
                </div>
            )}

            <FormularioRecetas
                form={form}
                setForm={setForm}
                recetario={recetario}
                onJalarReceta={jalarDesdeRecetario}
                precioMayoreo={precioMayoreo}
                precioMenudeo={precioMenudeo}
                costoPorUnidad={costoPorUnidad}
            />

            <FormularioIngrediente
                ingForm={ingForm}
                setIngForm={setIngForm}
                onAgregar={agregarIngrediente}
                insumoForm={insumoForm}
                setInsumoForm={setInsumoForm}
                onAgregarInsumo={agregarInsumo}
                inventario={inventario}
                onAgregarAInventario={agregarAInventario}
            />

            <TablaIngredientes
                ingredientes={form.ingredientes}
                insumos={form.insumos || []}
                onEliminar={eliminarIngrediente}
                onEditar={editarIngrediente}
                onEliminarInsumo={eliminarInsumo}
                onEditarInsumo={editarInsumo}
            />

            {(form.ingredientes.length > 0 || (form.insumos || []).length > 0) && form.unidades > 0 && (
                <div className="card">
                    <div className="resumen-grid">
                        <div className="resumen-item">
                            <div className="valor">₡{costoIngredientes.toFixed(0)}</div>
                            <div className="etiqueta">🧁 Costo ingredientes</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{costoInsumos.toFixed(0)}</div>
                            <div className="etiqueta">📦 Costo insumos</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{costoTotal.toFixed(0)}</div>
                            <div className="etiqueta">Total</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{costoPorUnidad.toFixed(0)}</div>
                            <div className="etiqueta">Costo por unidad</div>
                        </div>
                        <div className="resumen-item" style={{ background: "var(--verde-claro)" }}>
                            <div className="valor" style={{ color: "var(--verde-oscuro)" }}>₡{precioMayoreo}</div>
                            <div className="etiqueta">Precio mayoreo</div>
                        </div>
                        <div className="resumen-item" style={{ background: "#fff8ee" }}>
                            <div className="valor" style={{ color: "var(--canela)" }}>₡{precioMenudeo}</div>
                            <div className="etiqueta">Precio menudeo</div>
                        </div>
                    </div>
                </div>
            )}

            <button className="btn-primario" type="button" onClick={guardarReceta}>
                {editandoId ? "✏️ Actualizar receta" : "💾 Guardar receta"}
            </button>

            {editandoId && (
                <button className="btn-secundario" type="button" style={{ marginLeft: 8 }}
                    onClick={() => { setEditandoId(null); setForm(FORM_INICIAL) }}>
                    ✕ Cancelar edición
                </button>
            )}

            <ListaRecetas
                recetas={recetasCostos}
                onEliminar={eliminarReceta}
                onEditar={editarReceta}
            />
        </div>
    )
}