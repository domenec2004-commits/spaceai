import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { imageBase64, style } = req.body;
  if (!imageBase64 || !style)
    return res.status(400).json({ error: "Faltan datos" });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "API key no configurada" });
  }

  const prompt = `Eres un experto interiorista. Analiza esta imagen de un espacio y redisénalo con estilo "${style}". Responde SOLO con JSON válido sin backticks: {"resumen":"texto","etiquetas_positivas":["a","b"],"etiquetas_mejora":["a","b"],"puntuaciones":[{"nombre":"Iluminación","valor":70},{"nombre":"Distribución","valor":60},{"nombre":"Estilo","valor":50},{"nombre":"Confort","valor":65}],"sugerencias":[{"icono":"💡","titulo":"titulo","descripcion":"desc"},{"icono":"🛋️","titulo":"titulo","descripcion":"desc"},{"icono":"🌿","titulo":"titulo","descripcion":"desc"},{"icono":"🎨","titulo":"titulo","descripcion":"desc"}],"paleta":[{"color":"#hex","nombre":"nombre"},{"color":"#hex","nombre":"nombre"},{"color":"#hex","nombre":"nombre"},{"color":"#hex","nombre":"nombre"},{"color":"#hex","nombre":"nombre"}]}`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
    ]);

    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const json = JSON.parse(clean);
    res.status(200).json(json);
  } catch (err) {
    console.error("Gemini error:", err?.message || err);
    res.status(500).json({ error: err?.message || "Error al analizar" });
  }
}
