const MODULOS = ["Recetas", "Inventario", "Pedidos", "Ventas", "Clientes", "Reportes"]

function Navbar({ activo, setActivo }) {
    return (
        <nav>
            {MODULOS.map((modulo) => (
                <button
                    key={modulo}
                    onClick={() => setActivo(modulo)}
                    style={{
                        fontWeight: activo === modulo ? "bold" : "normal",
                        borderBottom: activo === modulo ? "2px solid red" : "none"
                    }}
                >
                    {modulo}
                </button>
            ))}
        </nav>
    )
}

export default Navbar