function ListaRecetas({ recetas, onEliminar }) {
    if (recetas.length === 0) return null

    return (
        <div>
            <h3>Recetas guardadas</h3>
            {recetas.map((receta) => (
                <div key={receta.id}>
                    <h4>{receta.nombre}</h4>
                    <p>Categoría: {receta.categoria}</p>
                    <p>Unidades: {receta.unidades}</p>
                    <p>Costo por unidad: ₡{parseFloat(receta.costoPorUnidad).toFixed(0)}</p>
                    <p>Precio mayoreo: ₡{receta.precioMayoreo}</p>
                    <p>Precio menudeo: ₡{receta.precioMenudeo}</p>
                    <button type="button" onClick={() => onEliminar(receta.id)}>
                        🗑 Eliminar
                    </button>
                </div>
            ))}
        </div>
    )
}

export default ListaRecetas