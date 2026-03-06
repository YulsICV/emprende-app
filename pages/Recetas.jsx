import { useState } from "react"
import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"
import FormularioRecetas from "../components/recetas/FormularioRecetas"
import FormularioIngrediente from "../components/recetas/FormularioIngrediente"
import TablaIngredientes from "../components/recetas/TablaIngredientes"
import ListaRecetas from "../components/recetas/ListaRecetas"

function Recetas({ db, actualizarDb }) {
    const [editandoId, setEditandoId] = useState(null)
    const [form, setForm] = useState({
        nombre: "",
        categoria: "Clásica",
        unidades: "",
        ingredientes: [],
        margenMay: 35,
        margenMen: 70
    })
    const [ingForm, setIngForm] = useState({
        nombre: "",
        cantidadUso: "",
        unidadUso: "taza",
        cantidadPaquete: "",
        unidadPaquete: "g",
        precioPaquete: ""
    })

    const agregarIngrediente = () => {
        if (!ingForm.nombre || !ingForm.cantidadUso || !ingForm.cantidadPaquete || !ingForm.precioPaquete) return

        const enGramosUso = CONVERSIONES_A_GRAMOS[ingForm.unidadUso]
        const enGramosPaquete = CONVERSIONES_A_GRAMOS[ingForm.unidadPaquete]
        let costoParcial

        if (enGramosUso === null || enGramosPaquete === null) {
            costoParcial = (parseFloat(ingForm.precioPaquete) / parseFloat(ingForm.cantidadPaquete)) * parseFloat(ingForm.cantidadUso)
        } else {
            const usoEnGramos = parseFloat(ingForm.cantidadUso) * enGramosUso
            const paqueteEnGramos = parseFloat(ingForm.cantidadPaquete) * enGramosPaquete
            costoParcial = (parseFloat(ingForm.precioPaquete) / paqueteEnGramos) * usoEnGramos
        }

        const nuevoIngrediente = {
            ...ingForm,
            costoParcial: costoParcial.toFixed(1),
            id: crypto.randomUUID()
        }

        setForm({ ...form, ingredientes: [...form.ingredientes, nuevoIngrediente] })
        setIngForm({ nombre: "", cantidadUso: "", unidadUso: "taza", cantidadPaquete: "", unidadPaquete: "g", precioPaquete: "" })
    }

    const eliminarIngrediente = (id) => {
        setForm({ ...form, ingredientes: form.ingredientes.filter(i => i.id !== id) })
    }

    const editarIngrediente = (id, campo, valor) => {
        const ingredientesActualizados = form.ingredientes.map(ing => {
            if (ing.id !== id) return ing
            const ingActualizado = { ...ing, [campo]: valor }
            const enGramosUso = CONVERSIONES_A_GRAMOS[ingActualizado.unidadUso]
            const enGramosPaquete = CONVERSIONES_A_GRAMOS[ingActualizado.unidadPaquete]
            let costoParcial
            if (enGramosUso === null || enGramosPaquete === null) {
                costoParcial = (parseFloat(ingActualizado.precioPaquete) / parseFloat(ingActualizado.cantidadPaquete)) * parseFloat(ingActualizado.cantidadUso)
            } else {
                const usoEnGramos = parseFloat(ingActualizado.cantidadUso) * enGramosUso
                const paqueteEnGramos = parseFloat(ingActualizado.cantidadPaquete) * enGramosPaquete
                costoParcial = (parseFloat(ingActualizado.precioPaquete) / paqueteEnGramos) * usoEnGramos
            }
            return { ...ingActualizado, costoParcial: isNaN(costoParcial) ? "0" : costoParcial.toFixed(1) }
        })
        setForm({ ...form, ingredientes: ingredientesActualizados })
    }

    const editarReceta = (receta) => {
        setForm({
            nombre: receta.nombre,
            categoria: receta.categoria,
            unidades: receta.unidades,
            ingredientes: receta.ingredientes,
            margenMay: receta.margenMay,
            margenMen: receta.margenMen
        })
        setEditandoId(receta.id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const eliminarReceta = (id) => {
        actualizarDb("recetas", db.recetas.filter(r => r.id !== id))
    }

    const costoTotal = form.ingredientes.reduce((suma, ing) => suma + parseFloat(ing.costoParcial), 0)
    const costoPorUnidad = form.unidades > 0 ? costoTotal / form.unidades : 0
    const precioMayoreo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMay / 100)) : 0
    const precioMenudeo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMen / 100)) : 0

    const guardarReceta = () => {
        if (!form.nombre || !form.unidades || form.ingredientes.length === 0) return

        if (editandoId) {
            const recetaActualizada = {
                ...form,
                id: editandoId,
                costoTotal,
                costoPorUnidad,
                precioMayoreo,
                precioMenudeo,
                fecha: new Date().toISOString()
            }
            actualizarDb("recetas", db.recetas.map(r => r.id === editandoId ? recetaActualizada : r))
            setEditandoId(null)
        } else {
            const nuevaReceta = {
                ...form,
                id: crypto.randomUUID(),
                costoTotal,
                costoPorUnidad,
                precioMayoreo,
                precioMenudeo,
                fecha: new Date().toISOString()
            }
            actualizarDb("recetas", [...db.recetas, nuevaReceta])
        }

        setForm({
            nombre: "",
            categoria: "Clásica",
            unidades: "",
            ingredientes: [],
            margenMay: 35,
            margenMen: 70
        })
    }

    return (
        <div>
            <h2 className="page-titulo">🍩 Recetas & Costos</h2>

            <FormularioRecetas form={form} setForm={setForm} />

            <FormularioIngrediente
                ingForm={ingForm}
                setIngForm={setIngForm}
                onAgregar={agregarIngrediente}
            />

            <TablaIngredientes
                ingredientes={form.ingredientes}
                onEliminar={eliminarIngrediente}
                onEditar={editarIngrediente}
            />

            {form.ingredientes.length > 0 && form.unidades > 0 && (
                <div className="card">
                    <div className="resumen-grid">
                        <div className="resumen-item">
                            <div className="valor">₡{costoTotal.toFixed(0)}</div>
                            <div className="etiqueta">Costo total</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{costoPorUnidad.toFixed(0)}</div>
                            <div className="etiqueta">Costo por unidad</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{precioMayoreo}</div>
                            <div className="etiqueta">Precio mayoreo</div>
                        </div>
                        <div className="resumen-item">
                            <div className="valor">₡{precioMenudeo}</div>
                            <div className="etiqueta">Precio menudeo</div>
                        </div>
                    </div>
                </div>
            )}

            <button className="btn-primario" type="button" onClick={guardarReceta}>
                {editandoId ? "✏️ Actualizar receta" : "💾 Guardar receta"}
            </button>

            {editandoId && (
                <button
                    className="btn-secundario"
                    type="button"
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                        setEditandoId(null)
                        setForm({ nombre: "", categoria: "Clásica", unidades: "", ingredientes: [], margenMay: 35, margenMen: 70 })
                    }}
                >
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

export default Recetas