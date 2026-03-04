export default function FormularioRecetas({ form, setForm }) {
    return (
        <div>
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
        </div>
    )
}