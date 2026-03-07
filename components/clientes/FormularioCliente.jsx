export default function FormularioCliente({ form, setForm, guardar, editandoId, cancelar }) {
    return (
        <div className="card">
            <h3 className="seccion-titulo" style={{ marginTop: 0 }}>
                {editandoId ? "✏️ Editar cliente" : "➕ Nuevo cliente"}
            </h3>

            <div className="form-fila">
                <div className="form-grupo">
                    <label>Nombre *</label>
                    <input type="text" value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Nombre del cliente" />
                </div>
                <div className="form-grupo">
                    <label>Tipo</label>
                    <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                        <option value="individual">Individual</option>
                        <option value="mayorista">Mayorista</option>
                        <option value="frecuente">Frecuente</option>
                        <option value="empresa">Empresa</option>
                    </select>
                </div>
            </div>

            <div className="form-fila">
                <div className="form-grupo">
                    <label>Teléfono</label>
                    <input type="text" value={form.telefono}
                        onChange={e => setForm({ ...form, telefono: e.target.value })}
                        placeholder="8888-8888" />
                </div>
                <div className="form-grupo">
                    <label>Correo</label>
                    <input type="email" value={form.correo}
                        onChange={e => setForm({ ...form, correo: e.target.value })}
                        placeholder="mail@ejemplo.com" />
                </div>
                <div className="form-grupo">
                    <label>Dirección</label>
                    <input type="text" value={form.direccion}
                        onChange={e => setForm({ ...form, direccion: e.target.value })}
                        placeholder="400 Norte de..." />
                </div>
            </div>

            <div className="form-grupo">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" style={{ width: "auto" }}
                        checked={form.alergias}
                        onChange={e => setForm({ ...form, alergias: e.target.checked })} />
                    ⚠️ ¿Tiene alergias?
                </label>
            </div>

            {form.alergias && (
                <div className="form-grupo">
                    <label>¿Cuáles alergias?</label>
                    <input type="text" value={form.notasAlergias}
                        onChange={e => setForm({ ...form, notasAlergias: e.target.value })}
                        placeholder="Ej: nueces, gluten, lácteos..." />
                </div>
            )}

            <div className="form-grupo">
                <label>Nota interna</label>
                <input type="text" value={form.nota}
                    onChange={e => setForm({ ...form, nota: e.target.value })}
                    placeholder="Preferencias, observaciones..." />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primario" type="button" onClick={guardar}>
                    {editandoId ? "✏️ Actualizar cliente" : "+ Agregar cliente"}
                </button>
                {editandoId && (
                    <button className="btn-secundario" type="button" onClick={cancelar}>
                        ✕ Cancelar
                    </button>
                )}
            </div>
        </div>
    )
}