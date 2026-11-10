# IdeaLab — Proyecto de Desarrollo Web, segundo corte

IdeaLab es la evolución del proyecto de nombres y eslóganes del primer corte. Permite generar cuatro nombres y cuatro eslóganes para un negocio, elegir un estilo, copiar propuestas y guardar favoritas.

## Tecnologías aplicadas
- HTML semántico, CSS y JavaScript moderno con módulos ES (`.mjs`).
- Node.js y Express: servidor, rutas JSON `GET /api/salud` y `POST /api/generar`.
- Fetch API con `async/await`, comprobación de `response.ok` y `try/catch`.
- Bootstrap 5.3.8: `container`, `row`, columnas responsive, botones, formularios, alertas y utilidades.
- UX/UI: mensajes de estado, carga, validación, foco visible, etiquetas, ARIA, navegación por teclado y respeto a `prefers-reduced-motion`.
- Persistencia: `localStorage` para tema y favoritos; `sessionStorage` para historial temporal de la pestaña.
- Seguridad: validación en servidor, límite de tamaño JSON, rate limit, Helmet, CORS con lista explícita de orígenes autorizados, `textContent`/`createElement` y variables sensibles en `.env` fuera de Git.

## Requisitos
Node.js 20 o superior y npm.



## Instalación en Windows (PowerShell)
```powershell
cd ruta\IdeaLab_Segundo_Corte
npm install
Copy-Item .env.example .env
npm start
```
Abrir `http://localhost:3000`.

## Pruebas rápidas
- `GET http://localhost:3000/api/salud` debe responder JSON con `ok: true`.
- En la página, generar propuestas con un negocio de mínimo 3 caracteres.
- Probar entrada vacía o inválida; el servidor debe responder `400`.
- Copiar y guardar propuestas; recargar la página y comprobar que tema y favoritos permanecen.
- Cerrar la pestaña y abrir otra para verificar que el historial de sesión no es persistente.
- Probar la interfaz en vista móvil desde las herramientas de desarrollador.

## Generador local y Ollama opcional
Por defecto, la aplicación usa un generador local de respaldo que permite demostrar el flujo completo incluso sin conexión a un modelo de IA. Para usar Ollama durante el desarrollo:
1. Instala y ejecuta Ollama en el computador.
2. Descarga el modelo indicado: `ollama pull gemma3:1b`.
3. En `.env`, cambia `OLLAMA_ENABLED=true`.
4. Reinicia el servidor.

El backend consulta Ollama desde el servidor, nunca directamente desde el navegador. En un hosting público, `127.0.0.1` representa el servidor desplegado y no el computador del usuario. Por eso, en producción se mantiene el generador local de respaldo salvo que se configure un servicio de IA accesible desde el backend. No publiques claves ni direcciones privadas en el frontend.

## Variables de entorno
Ver `.env.example`. En Render se configuran en el panel Environment; no se sube el archivo `.env`.

## Seguridad y CORS
El frontend y la API se sirven desde el mismo Express, así que el funcionamiento normal es del mismo origen y no necesita CORS. Aun así, el servidor incorpora el middleware `cors` para cumplir el criterio de configuración controlada: solo autoriza los orígenes externos escritos explícitamente en `ALLOWED_ORIGINS`.

- Si mantienes frontend y API en el mismo servicio, deja `ALLOWED_ORIGINS` vacío.
- Si en el futuro alojas el frontend en otro dominio, agrega su origen exacto, incluyendo `https://` y sin rutas. Ejemplo: `ALLOWED_ORIGINS=https://mi-frontend.netlify.app`.
- Para permitir más de uno, sepáralos por coma.
- No uses `*` en producción. Los orígenes no incluidos no reciben encabezados CORS.
- La política CSP de Helmet también incluye esos orígenes autorizados en `connect-src`, para que el navegador pueda realizar las solicitudes permitidas.

## Despliegue: frontend en Netlify y backend en Render
- **Backend (Render):** Web Service conectado al repositorio. Build `npm install`, Start `npm start`. Variable `ALLOWED_ORIGINS` = URL exacta del sitio de Netlify.
- **Frontend (Netlify):** publica la carpeta `public/` (configurado en `netlify.toml`, sin comando de build).
- La URL del backend está definida en un solo lugar: `URL_BACKEND_RENDER` en `public/js/api.mjs`. En local se usa el mismo origen.
- Paso a paso completo: `documentacion/guia-github-netlify-render.md`.

## Optimización y Lighthouse
- Se usan recursos CDN con versión Bootstrap fija, `preconnect`, CSS propio reducido, imágenes no requeridas y JavaScript modular.
- Express aplica compresión gzip (`compression`), caché estática y ETag en producción; Netlify sirve el frontend comprimido y con caché.
- Ejecutar Lighthouse en Chrome (F12 → Lighthouse), seleccionar Mobile y Desktop y guardar los informes reales. No se inventan puntuaciones: registrar fecha, resultados y correcciones en `documentacion/plantilla-lighthouse.md`.

## Arquitectura
Ver `documentacion/diagrama-componentes.png`. El frontend (Netlify) hace `fetch POST /api/generar` al backend (Render). Flujo: `app.mjs → api.mjs → fetch POST /api/generar → server.js → generador.mjs → JSON → DOM`.

## Limitaciones del proyecto
Las propuestas son ideas iniciales de creatividad. Antes de usar un nombre comercial se debe comprobar disponibilidad de marca, dominio y redes sociales. La aplicación no garantiza disponibilidad legal de los nombres.
