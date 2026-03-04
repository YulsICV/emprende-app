import { UNIDADES_USO, UNIDADES_PAQUETE } from "../../data/conversiones"

function FormularioIngrediente({ ingForm, setIngForm, onAgregar }) {
    return (
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
            <button type="button" onClick={onAgregar}>+ Agregar</button>
        </div>
    )
}

export default FormularioIngrediente