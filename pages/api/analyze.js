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

  const prompt = `Eres un experto interiorista. Analiza esta imagen de un espacio doméstico y proporciona un análisis completo para rediseñarlo con estilo "${style}".

Responde ÚNICAMENTE con un JSON válido, sin texto adicional ni backticks, con esta estructura exacta:
{
  "resumen": "descripción de 2-3 frases del espacio actual",
  "etiquetas_positivas": ["punto fuerte 1", "punto fuerte 2"],
  "etiquetas_mejora": ["mejora 1", "mejora 2"],
  "puntuaciones": [
    {"nombre": "Iluminación", "valor": 70},
    {"nombre": "Distribución", "valor": 60},
    {"nombre": "Estilo", "valor": 50},
    {"nombre": "Confort", "valor": 65}
  ],
  "sugerencias": [
    {"icono": "💡", "titulo": "Título corto", "descripcion": "Descripción práctica en 1-2 frases"},
    {"icono": "🛋️", "titulo": "Título corto", "descripcion": "Descripción práctica"},
    {"icono": "🌿", "titulo": "Título corto", "descripcion": "Descripción práctica"},
    {"icono": "🎨", "titulo": "Título corto", "descripcion": "Descripción práctica"}
  ],
  "paleta": [
    {"color": "#hex", "nombre": "Nombre del tono"},
    {"color": "#hex", "nombre": "Nombre del tono"},
    {"color": "#hex", "nombre": "Nombre del tono"},
    {"color": "#hex", "nombre": "Nombre del tono"},
    {"color": "#hex", "nombre": "Nombre del tono"}
  ]
}`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      prompt
