const CLAVE_TEMA = "idealab:tema";
const CLAVE_FAVORITOS = "idealab:favoritos";
const CLAVE_SESION = "idealab:historial-sesion";

export function leerTema() {
  return localStorage.getItem(CLAVE_TEMA) || "light";
}
export function guardarTema(tema) {
  localStorage.setItem(CLAVE_TEMA, tema);
}
export function leerFavoritos() {
  try {
    const valor = localStorage.getItem(CLAVE_FAVORITOS);
    return valor === null ? [] : JSON.parse(valor);
  } catch {
    localStorage.removeItem(CLAVE_FAVORITOS);
    return [];
  }
}
export function guardarFavoritos(favoritos) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
}
export function agregarAlHistorialSesion(item) {
  try {
    const historial = JSON.parse(sessionStorage.getItem(CLAVE_SESION) || "[]");
    historial.unshift(item);
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(historial.slice(0, 5)));
  } catch {
    sessionStorage.removeItem(CLAVE_SESION);
  }
}
export function obtenerHistorialSesion() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION) || "[]");
  } catch {
    return [];
  }
}
export function limpiarDatosIdeaLab() {
  localStorage.removeItem(CLAVE_TEMA);
  localStorage.removeItem(CLAVE_FAVORITOS);
  sessionStorage.removeItem(CLAVE_SESION);
}
export function escaparTexto(texto) {
  return String(texto).replace(/[<>]/g, "");
}
