import { useState } from "react"
import { CONVERSIONES_A_GRAMOS, UNIDADES_USO, UNIDADES_PAQUETE } from "../data/conversiones"

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
            id: Date.now()
        }

        setForm({ ...form, ingredientes: [...form.ingredientes, nuevoIngrediente] })
        setIngForm({ nombre: "", cantidadUso: "", unidadUso: "taza", cantidadPaquete: "", unidadPaquete: "g", precioPaquete: "" })
    }

    const costoTotal = form.ingredientes.reduce((suma, ing) => suma + parseFloat(ing.costoParcial), 0)
    const costoPorUnidad = form.unidades > 0 ? costoTotal / form.unidades : 0
    const precioMayoreo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMay / 100)) : 0
    const precioMenudeo = costoPorUnidad > 0 ? Math.ceil(costoPorUnidad / (1 - form.margenMen / 100)) : 0

    return (
        <div>
            <h2>Recetas & Costos</h2>
            <form>
                <div>
                    <label>Nombre de la receta</label>
                    <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej: Minidonas San Valentín"
                    />
                </div>
                <div>
                    <label>Categoría</label>
                    <select
                        value={form.categoria}
                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    >
                        <option>Sencilla</option>
                        <option>Clásica</option>
                        <option>Especial</option>
                        <option>Premium</option>
                    </select>
                </div>
                <div>
                    <label>Unidades producidas</label>
                    <input
                        type="number"
                        value={form.unidades}
                        onChange={(e) => setForm({ ...form, unidades: e.target.value })}
                        placeholder="Ej: 45"
                    />
                </div>
            </form>

            <div>
                <h3>Ingredientes</h3>
                <input
                    type="text"
                    value={ingForm.nombre}
                    onChange={(e) => setIngForm({ ...ingForm, nombre: e.target.value })}
                    placeholder="Ej: Harina"
                />
                <input
                    type="number"
                    value={ingForm.cantidadUso}
                    onChange={(e) => setIngForm({ ...ingForm, cantidadUso: e.target.value })}
                    placeholder="Cantidad que usaste"
                />
                <select
                    value={ingForm.unidadUso}
                    onChange={(e) => setIngForm({ ...ingForm, unidadUso: e.target.value })}
                >
                    {UNIDADES_USO.map(u => <option key={u}>{u}</option>)}
                </select>

                <input
                    type="number"
                    value={ingForm.cantidadPaquete}
                    onChange={(e) => setIngForm({ ...ingForm, cantidadPaquete: e.target.value })}
                    placeholder="Total del paquete que compraste"
                />
                <select
                    value={ingForm.unidadPaquete}
                    onChange={(e) => setIngForm({ ...ingForm, unidadPaquete: e.target.value })}
                >
                    {UNIDADES_PAQUETE.map(u => <option key={u}>{u}</option>)}
                </select>

                <input
                    type="number"
                    value={ingForm.precioPaquete}
                    onChange={(e) => setIngForm({ ...ingForm, precioPaquete: e.target.value })}
                    placeholder="Precio del paquete ₡"
                />
                <button type="button" onClick={agregarIngrediente}>+ Agregar</button>
            </div>

            {form.ingredientes.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Ingrediente</th>
                            <th>Cantidad</th>
                            <th>Costo</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.ingredientes.map((ing) => (
                            <tr key={ing.id}>
                                <td>{ing.nombre}</td>
                                <td>{ing.cantidadUso}{ing.unidadUso}</td>
                                <td>₡{ing.costoParcial}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => setForm({
                                            ...form,
                                            ingredientes: form.ingredientes.filter(i => i.id !== ing.id)
                                        })}
                                    >✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {form.ingredientes.length > 0 && form.unidades > 0 && (
                <div>
                    <p>Costo total: ₡{costoTotal.toFixed(0)}</p>
                    <p>Costo por unidad: ₡{costoPorUnidad.toFixed(0)}</p>
                    <p>Precio mayoreo sugerido: ₡{precioMayoreo}</p>
                    <p>Precio menudeo sugerido: ₡{precioMenudeo}</p>
                </div>
            )}
        </div>
    )
}

export default Recetas