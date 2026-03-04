export default function FormularioCliente({ form, setForm, guardar }) {
    return (
        <div>
            <h2>👥 Clientes</h2>

            <div>
                <label>Nombre</label>
                <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Nombre del cliente"
                />
            </div>

            <div>
                <label>Teléfono</label>
                <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="8888-8888"
                />
            </div>

            <div>
                <label>Tipo</label>
                <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                    <option value="individual">Individual</option>
                    <option value="mayorista">Mayorista</option>
                    <option value="frecuente">Frecuente</option>
                </select>
            </div>

            <div>
                <label>Nota</label>
                <input
                    type="text"
                    value={form.nota}
                    onChange={(e) => setForm({ ...form, nota: e.target.value })}
                    placeholder="Preferencias, alergias..."
                />
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={form.alergias}
                        onChange={(e) => setForm({ ...form, alergias: e.target.checked })}
                    />
                    ¿Tiene alergias?
                </label>
            </div>

            {form.alergias && (
                <div>
                    <label>¿Cuáles alergias?</label>
                    <input
                        type="text"
                        value={form.notasAlergias}
                        onChange={(e) => setForm({ ...form, notasAlergias: e.target.value })}
                        placeholder="Ej: nueces, gluten..."
                    />
                </div>
            )}

            <button type="button" onClick={guardar}>+ Agregar cliente</button>
        </div>
    )
}
