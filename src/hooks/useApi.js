// Hook genérico para llamadas a la API
// Reemplaza las funciones de db.js (localStorage)

const BASE = "/api"

// Headers base — aquí agregaremos JWT cuando tengamos auth
function headers() {
    return {
        "Content-Type": "application/json",
        "x-negocio-id": "default", // cambiará cuando tengamos usuarios reales
    }
}

// ── INVENTARIO ──
export const apiInventario = {
    getAll: () =>
        fetch(`${BASE}/inventario`, { headers: headers() }).then(r => r.json()),

    crear: (item) =>
        fetch(`${BASE}/inventario`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify(item),
        }).then(r => r.json()),

    actualizar: (item) =>
        fetch(`${BASE}/inventario`, {
            method: "PUT",
            headers: headers(),
            body: JSON.stringify(item),
        }).then(r => r.json()),

    eliminar: (id) =>
        fetch(`${BASE}/inventario?id=${id}`, {
            method: "DELETE",
            headers: headers(),
        }).then(r => r.json()),
}

// ── RECETAS ──
export const apiRecetas = {
    getAll: () =>
        fetch(`${BASE}/recetas`, { headers: headers() }).then(r => r.json()),

    crear: (receta) =>
        fetch(`${BASE}/recetas`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify(receta),
        }).then(r => r.json()),

    actualizar: (receta) =>
        fetch(`${BASE}/recetas`, {
            method: "PUT",
            headers: headers(),
            body: JSON.stringify(receta),
        }).then(r => r.json()),

    eliminar: (id) =>
        fetch(`${BASE}/recetas?id=${id}`, {
            method: "DELETE",
            headers: headers(),
        }).then(r => r.json()),
}

// ── RECETARIO ──
export const apiRecetario = {
    getAll: () =>
        fetch(`${BASE}/recetario`, { headers: headers() }).then(r => r.json()),

    crear: (item) =>
        fetch(`${BASE}/recetario`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify(item),
        }).then(r => r.json()),

    actualizar: (item) =>
        fetch(`${BASE}/recetario`, {
            method: "PUT",
            headers: headers(),
            body: JSON.stringify(item),
        }).then(r => r.json()),

    eliminar: (id) =>
        fetch(`${BASE}/recetario?id=${id}`, {
            method: "DELETE",
            headers: headers(),
        }).then(r => r.json()),
}