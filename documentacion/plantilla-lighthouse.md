# Registro de auditoría Lighthouse

- URL auditada:
- Fecha y hora:
- Entorno: local / producción
- Dispositivo: Mobile / Desktop
- Navegador y versión:

| Categoría | Puntuación obtenida | Hallazgos principales | Corrección aplicada o pendiente |
|---|---:|---|---|
| Performance | | | |
| Accessibility | | | |
| Best Practices | | | |
| SEO | | | |

## Procedimiento
1. Abrir la URL publicada en Chrome.
2. Pulsar F12 → Lighthouse.
3. Seleccionar Mobile y generar el informe.
4. Guardar el informe o capturas.
5. Repetir en Desktop.
6. Explicar los hallazgos reales y las mejoras realizadas.

## Optimizaciones implementadas en el proyecto
- Carga de recursos externos con `preconnect`.
- Bootstrap con versión fija.
- CSS propio compacto y JavaScript modular.
- `express.static` con ETag y caché en producción.
- Sin imágenes pesadas ni dependencias de frontend adicionales.
- Diseño responsive con Bootstrap y estilos para pantallas pequeñas.
