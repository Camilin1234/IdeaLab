
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generarPropuestas } from "./src/servicios/generador.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Solo se permiten los orígenes externos declarados explícitamente.
// El frontend servido por este mismo Express no necesita CORS.
const origenesPermitidos = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean)
  .map((origen) => {
    try {
      return new URL(origen).origin;
    } catch {
      console.warn(`[CORS] Se ignoró un origen inválido: ${origen}`);
      return null;
    }
  })
  .filter(Boolean);

app.disable("x-powered-by");
// Render recibe las peticiones a través de un proxy: así el límite de
// solicitudes identifica la IP real de cada usuario.
app.set("trust proxy", 1);
// Optimización: comprime (gzip) las respuestas JSON y los archivos estáticos.
app.use(compression());

app.use(cors({
  origin(origen, callback) {
    if (origen && origenesPermitidos.includes(origen)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...origenesPermitidos],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(express.json({ limit: "10kb" }));

const limitarGeneraciones = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Has realizado muchas solicitudes. Espera unos minutos e inténtalo de nuevo."
  }
});

app.use(express.static(path.join(__dirname, "public"), {
  maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
  etag: true
}));

app.get("/api/salud", (_req, res) => {
  res.status(200).json({
    ok: true,
    proyecto: "IdeaLab",
    version: "2.0.0",
    mensaje: "El servidor está funcionando."
  });
});

app.post("/api/generar", limitarGeneraciones, async (req, res, next) => {
  try {
    const negocio = typeof req.body?.negocio === "string"
      ? req.body.negocio.trim()
      : "";

    const estilo = typeof req.body?.estilo === "string"
      ? req.body.estilo.trim()
      : "moderno";

    if (negocio.length < 3 || negocio.length > 80) {
      return res.status(400).json({
        error: "El tipo de negocio debe tener entre 3 y 80 caracteres."
      });
    }

    const estilosValidos = [
      "moderno",
      "creativo",
      "elegante",
      "juvenil",
      "tradicional"
    ];

    if (!estilosValidos.includes(estilo)) {
      return res.status(400).json({
        error: "Selecciona un estilo válido."
      });
    }

    const resultado = await generarPropuestas(negocio, estilo);

    return res.status(200).json({
      ok: true,
      negocio,
      estilo,
      proveedor: resultado.proveedor,
      nombres: resultado.nombres,
      esloganes: resultado.esloganes,
      generadoEn: new Date().toISOString()
    });

  } catch (error) {
    return next(error);
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "La ruta solicitada no existe."
  });
});

app.use((error, _req, res, _next) => {
  console.error("[Error API]", error.message);

  const status = error.status ||
    (error.type === "entity.parse.failed" ? 400 : 500);

  res.status(status).json({
    error: status === 400
      ? "La solicitud contiene datos JSON inválidos."
      : "Ocurrió un error interno. Inténtalo nuevamente."
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`IdeaLab listo en http://localhost:${PORT}`);
});
