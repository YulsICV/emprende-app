import { UNIDADES_USO, UNIDADES_PAQUETE } from "../../data/conversiones"

function FormularioIngrediente({ ingForm, setIngForm, onAgregar }) {
    return (
        <div className="card">
            <h3 className="seccion-titulo">Ingredientes</h3>
            <div className="form-fila">
                <div className="form-grupo">
                    <label>Ingrediente</label>
                    <input
                        type="text"
                        value={ingForm.nombre}
                        onChange={(e) => setIngForm({ ...ingForm, nombre: e.target.value })}
                        placeholder="Ej: Harina"
                    />
                </div>
                <div className="form-grupo">
                    <label>Cantidad que usaste</label>
                    <input
                        type="number"
                        value={ingForm.cantidadUso}
                        onChange={(e) => setIngForm({ ...ingForm, cantidadUso: e.target.value })}
                        placeholder="2"
                    />
                </div>
                <div className="form-grupo">
                    <label>Unidad de uso</label>
                    <select
                        value={ingForm.unidadUso}
                        onChange={(e) => setIngForm({ ...ingForm, unidadUso: e.target.value })}
                    >
                        {UNIDADES_USO.map(u => <option key={u}>{u}</option>)}
                    </select>
                </div>
            </div>
            <div className="form-fila">
                <div className="form-grupo">
                    <label>Total del paquete</label>
                    <input
                        type="number"
                        value={ingForm.cantidadPaquete}
                        onChange={(e) => setIngForm({ ...ingForm, cantidadPaquete: e.target.value })}
                        placeholder="2000"
                    />
                </div>
                <div className="form-grupo">
                    <label>Unidad del paquete</label>
                    <select
                        value={ingForm.unidadPaquete}
                        onChange={(e) => setIngForm({ ...ingForm, unidadPaquete: e.target.value })}
                    >
                        {UNIDADES_PAQUETE.map(u => <option key={u}>{u}</option>)}
                    </select>
                </div>
                <div className="form-grupo">
                    <label>Precio del paquete (₡)</label>
                    <input
                        type="number"
                        value={ingForm.precioPaquete}
                        onChange={(e) => setIngForm({ ...ingForm, precioPaquete: e.target.value })}
                        placeholder="2000"
                    />
                </div>
            </div>
            <button className="btn-secundario" type="button" onClick={onAgregar}>
                + Agregar ingrediente
            </button>
        </div>
    )
}

export default FormularioIngrediente