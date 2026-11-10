const estilos = {
  moderno: {
    palabras: ["Nexo", "Nova", "Punto", "Aura", "Distrito", "Origen"],
    tono: "Ideas simples, actuales y memorables"
  },
  creativo: {
    palabras: ["Chispa", "Menta", "Órbita", "Imagina", "Pixel", "Brote"],
    tono: "Ideas originales, expresivas y diferentes"
  },
  elegante: {
    palabras: ["Ébano", "Áurea", "Maison", "Lúmina", "Noble", "Atelier"],
    tono: "Ideas refinadas, sobrias y sofisticadas"
  },
  juvenil: {
    palabras: ["Wow", "Boom", "Vibra", "Modo", "Flash", "Cool"],
    tono: "Ideas frescas, cercanas y divertidas"
  },
  tradicional: {
    palabras: ["Raíces", "La Esquina", "Buen Día", "Don", "La Casona", "De Casa"],
    tono: "Ideas cálidas, confiables y familiares"
  }
};

const limpiar = (valor) => valor.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();

function generarLocal(negocio, estilo) {
  const base = estilos[estilo] ?? estilos.moderno;
  const sustantivo = limpiar(negocio).replace(/^(un|una|el|la)\s+/i, "");
  const nombres = [
    `${base.palabras[0]} ${capitalizar(sustantivo)}`,
    `${capitalizar(sustantivo)} ${base.palabras[1]}`,
    `${base.palabras[2]} ${capitalizar(sustantivo)}`,
    `${base.palabras[3]} ${capitalizar(sustantivo)}`
  ];
  const esloganes = [
    `Tu mejor experiencia en ${sustantivo}.`,
    `Ideas que se sienten, calidad que se nota.`,
    `Cada detalle cuenta. Vive ${sustantivo} diferente.`,
    `Hecho para ti, pensado para sorprender.`
  ];
  return { nombres, esloganes, proveedor: "generador-local" };
}

function capitalizar(texto) {
  return texto.charAt(0).toLocaleUpperCase("es") + texto.slice(1);
}

function extraerLista(texto, encabezado) {
  const bloque = texto.split(new RegExp(encabezado + "\\s*:", "i"))[1] || "";
  return bloque.split(/(?:ESLOGANES|ESLÓGANES)\s*:/i)[0]
    .split("\n").map((linea) => linea.replace(/^\s*\d+[\.\)\-:]\s*/, "").trim())
    .filter(Boolean).slice(0, 4);
}

async function generarConOllama(negocio, estilo) {
  const url = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
  const model = process.env.OLLAMA_MODEL || "gemma3:1b";
  const prompt = `Actúa como especialista en identidad de marca. Crea exactamente cuatro nombres y cuatro eslóganes en español para un negocio de ${negocio}. Estilo: ${estilo}. No uses marcas registradas conocidas. Devuelve únicamente este formato:\nNOMBRES:\n1. ...\n2. ...\n3. ...\n4. ...\nESLOGANES:\n1. ...\n2. ...\n3. ...\n4. ...`;
  const respuesta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
    signal: AbortSignal.timeout(25000)
  });
  if (!respuesta.ok) throw new Error("Ollama no respondió correctamente.");
  const datos = await respuesta.json();
  const texto = typeof datos.response === "string" ? datos.response : "";
  const nombres = extraerLista(texto, "NOMBRES");
  const esloganes = extraerLista(texto, "ESLOGANES");
  if (nombres.length !== 4 || esloganes.length !== 4) throw new Error("La respuesta del modelo no tiene el formato esperado.");
  return { nombres, esloganes, proveedor: `Ollama (${model})` };
}

export async function generarPropuestas(negocio, estilo) {
  if (process.env.OLLAMA_ENABLED === "true") {
    try {
      return await generarConOllama(negocio, estilo);
    } catch (error) {
      console.warn("[IdeaLab] Se usará el generador local:", error.message);
    }
  }
  return generarLocal(negocio, estilo);
}
