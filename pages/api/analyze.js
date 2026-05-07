import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { imageBase64, style } = req.body;
  if (!imageBase64 || !style)
    return res.status(400).json({ error: "Faltan datos" });

  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: "API key no configurada" });

  const prompt = `Eres un experto interiorista. Analiza esta imagen y redisénala con estilo "${style}". 
Responde SOLO con un objeto JSON, sin texto antes ni después, sin markdown, sin backticks.
El JSON debe tener exactamente esta estructura:
{"resumen":"texto aqui","etiquetas_positivas":["cosa buena 1","cosa buena 2"],"etiquetas_mejora":["mejora 1","mejora 2"],"puntuaciones":[{"nombre":"Iluminación","valor":70},{"nombre":"Distribución","valor":60},{"nombre":"Estilo","valor":50},{"nombre":"Confort","valor":65}],"sugerencias":[{"icono":"💡","titulo":"titulo","descripcion":"descripcion"},{"icono":"🛋️","titulo":"titulo","descripcion":"descripcion"},{"icono":"🌿","titulo":"titulo","descripcion":"descripcion"},{"icono":"🎨","titulo":"titulo","descripcion":"descripcion"}],"paleta":[{"color":"#F5F0E8","nombre":"Blanco roto"},{"color":"#8B7355","nombre":"Teca"},{"color":"#4A4A4A","nombre":"Carbón"},{"color":"#C4A882","nombre":"Arena"},{"color":"#2C5F2E","nombre":"Bosque"}]}`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
    ]);

    const text = result.response.text();
    console.log("Gemini raw response:", text.substring(0, 200));
    
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No se encontró JSON en la respuesta");
    
    const json = JSON.parse(match[0]);
    res.status(200).json(json);
  } catch (err) {
    console.error("Error:", err?.message || err);
    res.status(500).json({ error: err?.message || "Error al analizar" });
  }
}
