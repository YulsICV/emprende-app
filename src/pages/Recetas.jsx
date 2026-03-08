import { useState } from "react"
import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"
import FormularioRecetas from "../components/recetas/FormularioRecetas"
import FormularioIngrediente from "../components/recetas/FormularioIngrediente"
import TablaIngredientes from "../components/recetas/TablaIngredientes"
import ListaRecetas from "../components/recetas/ListaRecetas"

const FORM_INICIAL = {
    nombre: "", categoria: "Clásica", unidades: "",
    ingredientes: [], insumos: [],
    margenMay: 35, margenMen: 70, envioGratis: false,
    // Nuevos campos
    fotoBase64: "", fotoUrl: "",
    equipo: "", temperatura: "", tiempoCoccion: "",
    pasos: [],
}

const ING_FORM_INICIAL = {
    nombre: "", cantidadUso: "", unidadUso: "taza",
    cantidadPaquete: "", unidadPaquete: "g", precioPaquete: ""
}

function calcularCostoParcial(item, CONVERSIONES) {
    const enGramosUso = CONVERSIONES[item.unidadUso]
    const enGramosPaquete = CONVERSIONES[item.unidadPaquete]
    let costo
    if (enGramosUso === null || enGramosPaquete === null) {
        costo = (parseFloat(item.precioPaquete) / parseFloat(item.cantidadPaquete)) * parseFloat(item.cantidadUso)
    } else {
        const usoEnGramos = parseFloat(item.cantidadUso) * enGramosUso
        const paqueteEnGramos = parseFloat(item.cantidadPaquete) * enGramosPaquete
        costo = (parseFloat(item.precioPaquete) / paqueteEnGramos) * usoEnGramos
    }
    return isNaN(costo) ? 0 : costo
}

export default function Recetas({ db, actualizarDb }) {
    const [editandoId, setEditandoId] = useState(null)
    const [form, setForm] = useState(FORM_INICIAL)
    const [ingForm, setIngForm] = useState(ING_FORM_INICIAL)
    const [insumoForm, setInsumoForm] = useState(ING_FORM_INICIAL)

    // ── INGREDIENTES ──
    const agregarIngrediente = () => {
        if (!ingForm.nombre || !ingForm.cantidadUso || !ingForm.cantidadPaquete || !ingForm.precioPaquete) return
        const costo = calcularCostoParcial(ingForm, CONVERSIONES_A_GRAMOS)
        setForm({ ...form, ingredientes: [...form.ingredientes, { ...ingForm, costoParcial: costo.toFixed(1), id: crypto.randomUUID() }] })
        setIngForm(ING_FORM_INICIAL)
    }

    const eliminarIngrediente = (id) =>
        setForm({ ...form, ingredientes: form.ingredientes.filter(i => i.id !== id) })

    const editarIngrediente = (id, campo, valor) => {
        setForm({
            ...form, ingredientes: form.ingredientes.map(ing => {
                if (ing.id !== id) return ing
                const updated = { ...ing, [campo]: valor }
                return { ...updated, costoParcial: calcularCostoParcial(updated, CONVERSIONES_A_GRAMOS).toFixed(1) }
            })
        })
    }

    // ── INSUMOS ──
    const agregarInsumo = () => {
        if (!insumoForm.nombre || !insumoForm.cantidadUso || !insumoForm.cantidadPaquete || !insumoForm.precioPaquete) return
        const costo = calcularCostoParcial(insumoForm, CONVERSIONES_A_GRAMOS)
        setForm({ ...form, insumos: [...(form.insumos || []), { ...insumoForm, costoParcial: costo.toFixed(1), id: crypto.randomUUID() }] })
        setInsumoForm(ING_FORM_INICIAL)
    }

    const eliminarInsumo = (id) =>
        setForm({ ...form, insumos: form.insumos.filter(i => i.id !== id) })

    const editarInsumo = (id, campo, valor) => {
        setForm({
            ...form, insumos: form.insumos.map(ins => {
                if (ins.id !== id) return ins
                const updated = { ...ins, [campo]: valor }
                return { ...updated, costoParcial: calcularCostoParcial(updated, CONVERSIONES_A_GRAMOS).toFixed(1) }
            })
        })
    }

    // ── INVENTARIO ──
    const agregarAInventario = (nuevoItem) => {
        const yaExiste = (db.inventario || []).some(i =>
            i.nombre.toLowerCase().trim() === nuevoItem.nombre.toLowerCase().trim()
        )
        if (yaExiste) return
        actualizarDb("inventario", [...(db.inventario || []), nuevoItem])
    }

    // ── CÁLCULOS ──
    const costoIngredientes = form.ingredientes.reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
    const costoInsumos = (form.insumos || []).reduce((s, i) => s + parseFloat(i.costoParcial || 0), 0)
    const costoTotal = costoIngredientes + costoInsumos
    const costoPorUnidad = form.unidades > 0 ? costoTotal / form.unidades : 0
    const precioMayoreo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMay / 100)) : 0
    const precioMenudeo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMen / 100)) : 0

    // ── EDITAR RECETA ──
    const editarReceta = (receta) => {
        setForm({
            nombre: receta.nombre,
            categoria: receta.categoria,
            unidades: receta.unidades,
            ingredientes: receta.ingredientes,
            insumos: receta.insumos || [],
            margenMay: receta.margenMay,
            margenMen: receta.margenMen,
            envioGratis: receta.envioGratis || false,
            // Nuevos campos — compatibles con recetas guardadas antes
            fotoBase64: receta.fotoBase64 || "",
            fotoUrl: receta.fotoUrl || "",
            equipo: receta.equipo || "",
            temperatura: receta.temperatura || "",
            tiempoCoccion: receta.tiempoCoccion || "",
            pasos: receta.pasos || [],
        })
        setEditandoId(receta.id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const eliminarReceta = (id) =>
        actualizarDb("recetas", db.recetas.filter(r => r.id !== id))

    // ── GUARDAR ──
    const guardarReceta = () => {
        if (!form.nombre || !form.unidades || form.ingredientes.length === 0) return
        const datos = {
            ...form,
            costoTotal, costoPorUnidad, precioMayoreo, precioMenudeo,
            fecha: new Date().toISOString()
        }
        if (editandoId) {
            actualizarDb("recetas", db.recetas.map(r => r.id === editandoId ? { ...datos, id: editandoId } : r))
            setEditandoId(null)
        } else {
            actualizarDb("recetas", [...db.recetas, { ...datos, id: crypto.randomUUID() }])
        }
        setForm(FORM_INICIAL)
    }

    return (
        <div>
            <h2 className="page-titulo">🍩 Recetas & Costos</h2>

            <FormularioRecetas form={form} setForm={setForm} />

            <FormularioIngrediente
                ingForm={ingForm}
                setIngForm={setIngForm}
                onAgregar={agregarIngrediente}
                insumoForm={insumoForm}
                setInsumoForm={setInsumoForm}
                onAgregarInsumo={agregarInsumo}
                inventario={db.inventario || []}
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

            {/* Resumen de costos en vivo */}
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
                recetas={db.recetas}
                onEliminar={eliminarReceta}
                onEditar={editarReceta}
            />
        </div>
    )
}

