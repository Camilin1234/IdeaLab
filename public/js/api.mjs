// URL base de la API definida en UN solo lugar.
// - En Netlify (frontend publicado) se usa el backend publicado en Render.
// - En local (npm start) o si Render sirve todo, se usa el mismo origen ("").
// CAMBIA esta dirección por la URL real que te asigne Render.
const URL_BACKEND_RENDER = "https://idealab-c1w5.onrender.com";
const API_BASE = window.location.hostname.endsWith(".netlify.app") ? URL_BACKEND_RENDER : "";

export async function solicitarPropuestas(datos) {
  const respuesta = await fetch(`${API_BASE}/api/generar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  let contenido;
  try {
    contenido = await respuesta.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta que no se pudo leer.");
  }
  if (!respuesta.ok) {
    throw new Error(contenido.error || `Error del servidor (${respuesta.status}).`);
  }
  return contenido;
}
