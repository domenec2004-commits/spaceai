import Anthropic from "@anthropic-ai/sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { imageBase64, style } = req.body;
  if (!imageBase64 || !style)
    return res.status(400).json({ error: "Faltan datos" });

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
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const text = response.content.map((b) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al analizar la imagen" });
  }
}
