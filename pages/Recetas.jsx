import { useState } from "react"
import { CONVERSIONES_A_GRAMOS } from "../data/conversiones"
import FormularioRecetas from "../components/recetas/FormularioRecetas"
import FormularioIngrediente from "../components/recetas/FormularioIngrediente"
import TablaIngredientes from "../components/recetas/TablaIngredientes"
import ListaRecetas from "../components/recetas/ListaRecetas"

function Recetas({ db, actualizarDb }) {
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

    const costoTotal = form.ingredientes.reduce((suma, ing) => suma + parseFloat(ing.costoParcial), 0)
    const costoPorUnidad = form.unidades > 0 ? costoTotal / form.unidades : 0
    const precioMayoreo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMay / 100)) : 0
    const precioMenudeo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMen / 100)) : 0

    const guardarReceta = () => {
        if (!form.nombre || !form.unidades || form.ingredientes.length === 0) return

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

        setForm({
            nombre: "",
            categoria: "Clásica",
            unidades: "",
            ingredientes: [],
            margenMay: 35,
            margenMen: 70
        })
    }

    const eliminarReceta = (id) => {
        actualizarDb("recetas", db.recetas.filter(r => r.id !== id))
    }

    return (
        <div>
            <h2>Recetas & Costos</h2>

            <FormularioRecetas form={form} setForm={setForm} />

            <FormularioIngrediente
                ingForm={ingForm}
                setIngForm={setIngForm}
                onAgregar={agregarIngrediente}
            />

            <TablaIngredientes
                ingredientes={form.ingredientes}
                onEliminar={eliminarIngrediente}
            />

            {form.ingredientes.length > 0 && form.unidades > 0 && (
                <div>
                    <p>Costo total: ₡{costoTotal.toFixed(0)}</p>
                    <p>Costo por unidad: ₡{costoPorUnidad.toFixed(0)}</p>
                    <p>Precio mayoreo sugerido: ₡{precioMayoreo}</p>
                    <p>Precio menudeo sugerido: ₡{precioMenudeo}</p>
                </div>
            )}

            <button type="button" onClick={guardarReceta}>
                💾 Guardar receta
            </button>

            <ListaRecetas
                recetas={db.recetas}
                onEliminar={eliminarReceta}
            />
        </div>
    )
}

export default Recetas