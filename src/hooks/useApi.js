const BASE = "/api"

function headers() {
    const token = localStorage.getItem("token")
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    }
}

// ── AUTH ──
export const apiAuth = {
    registro: (datos) =>
        fetch(`${BASE}/auth?accion=registro`, {
            method: "POST", headers: headers(), body: JSON.stringify(datos),
        }).then(r => r.json()),

    login: (datos) =>
        fetch(`${BASE}/auth?accion=login`, {
            method: "POST", headers: headers(), body: JSON.stringify(datos),
        }).then(r => r.json()),

    google: (credential) =>
        fetch(`${BASE}/auth?accion=google`, {
            method: "POST", headers: headers(), body: JSON.stringify({ credential }),
        }).then(r => r.json()),

    recuperar: (email) =>
        fetch(`${BASE}/auth?accion=recuperar`, {
            method: "POST", headers: headers(), body: JSON.stringify({ email }),
        }).then(r => r.json()),

    reset: (token, password) =>
        fetch(`${BASE}/auth?accion=reset`, {
            method: "POST", headers: headers(), body: JSON.stringify({ token, password }),
        }).then(r => r.json()),
}

// ── INVENTARIO ──
export const apiInventario = {
    getAll: () =>
        fetch(`${BASE}/inventario`, { headers: headers() }).then(r => r.json()),

    crear: (item) =>
        fetch(`${BASE}/inventario`, {
            method: "POST", headers: headers(), body: JSON.stringify(item),
        }).then(r => r.json()),

    actualizar: (item) =>
        fetch(`${BASE}/inventario`, {
            method: "PUT", headers: headers(), body: JSON.stringify(item),
        }).then(r => r.json()),

    eliminar: (id) =>
        fetch(`${BASE}/inventario?id=${id}`, {
            method: "DELETE", headers: headers(),
        }).then(r => r.json()),
}

// ── RECETAS ──
export const apiRecetas = {
    getAll: () =>
        fetch(`${BASE}/recetas`, { headers: headers() }).then(r => r.json()),

    crear: (receta) =>
        fetch(`${BASE}/recetas`, {
            method: "POST", headers: headers(), body: JSON.stringify(receta),
        }).then(r => r.json()),

    actualizar: (receta) =>
        fetch(`${BASE}/recetas`, {
            method: "PUT", headers: headers(), body: JSON.stringify(receta),
        }).then(r => r.json()),

    eliminar: (id) =>
        fetch(`${BASE}/recetas?id=${id}`, {
            method: "DELETE", headers: headers(),
        }).then(r => r.json()),
}

// ── RECETARIO ──
export const apiRecetario = {
    getAll: () =>
        fetch(`${BASE}/recetario`, { headers: headers() }).then(r => r.json()),

    crear: (item) =>
        fetch(`${BASE}/recetario`, {
            method: "POST", headers: headers(), body: JSON.stringify(item),
        }).then(r => r.json()),

    actualizar: (item) =>
        fetch(`${BASE}/recetario`, {
            method: "PUT", headers: headers(), body: JSON.stringify(item),
        }).then(r => r.json()),

    eliminar: (id) =>
        fetch(`${BASE}/recetario?id=${id}`, {
            method: "DELETE", headers: headers(),
        }).then(r => r.json()),
}