Registro de auditoría Lighthouse

- URL auditada: https://iidealab.netlify.app/
- Fecha: 10 de noviembre de 2026
- Entorno: Producción
- Navegador: Brave (basado en Chromium)

Resultados Desktop

Categoría| Puntuación| Hallazgos principales| Corrección aplicada o pendiente
Performance| 100| Rendimiento excelente.| Sin correcciones pendientes identificadas.
Accessibility| 96| Se identifican oportunidades menores de mejora.| Revisar recomendaciones del informe.
Best Practices| 100| Cumple las buenas prácticas evaluadas.| No requiere correcciones según la puntuación.
SEO| 100| Cumple los criterios evaluados.| No requiere correcciones según la puntuación.

Resultados Mobile

Categoría| Puntuación| Hallazgos principales| Corrección aplicada o pendiente
Performance| 93| Rendimiento muy bueno en dispositivos móviles.| Revisar oportunidades de optimización del informe.
Accessibility| 96| Se identifican oportunidades menores de mejora.| Revisar recomendaciones del informe.
Best Practices| 100| Cumple las buenas prácticas evaluadas.| No requiere correcciones según la puntuación.
SEO| 100| Cumple los criterios evaluados.| No requiere correcciones según la puntuación.

Procedimiento

1. Abrir la URL publicada en Chrome.
2. Pulsar F12 → Lighthouse.
3. Seleccionar Mobile y generar el informe.
4. Guardar el informe y las capturas.
5. Repetir el procedimiento en Desktop.
6. Registrar los resultados obtenidos y revisar los hallazgos.

Optimizaciones implementadas en el proyecto

- Carga de recursos externos con "preconnect".
- Bootstrap con versión fija.
- CSS propio compacto y JavaScript modular.
- "express.static" con ETag y caché en producción.
- Sin imágenes pesadas ni dependencias de frontend adicionales.
- Diseño responsive con Bootstrap y estilos para pantallas pequeñas.
- Compresión gzip mediante Express Compression.

Conclusión

La auditoría realizada con Lighthouse demuestra que IdeaLab presenta un excelente nivel de rendimiento, accesibilidad, buenas prácticas y optimización SEO.

En Desktop se obtuvieron puntuaciones de 100 en rendimiento, 96 en accesibilidad, 100 en buenas prácticas y 100 en SEO.

En Mobile se obtuvieron 93 en rendimiento, 96 en accesibilidad, 100 en buenas prácticas y 100 en SEO.

Estos resultados demuestran que la aplicación ofrece una experiencia satisfactoria tanto en computadores como en dispositivos móviles, cumpliendo los objetivos de optimización establecidos para el proyecto.