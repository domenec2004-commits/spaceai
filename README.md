# SpaceAI 🏠✨

Aplicación de rediseño inteligente de espacios usando IA.

---

## 🚀 Deploy en 5 minutos (GRATIS)

### Paso 1 — Consigue tu API Key de Anthropic
1. Ve a https://console.anthropic.com
2. Regístrate o inicia sesión
3. Ve a "API Keys" → "Create Key"
4. Copia la key (empieza por `sk-ant-...`)

### Paso 2 — Sube el código a GitHub
1. Ve a https://github.com y crea una cuenta si no tienes
2. Clic en "New repository" → nómbralo `spaceai` → "Create repository"
3. Sube todos estos archivos al repositorio

### Paso 3 — Deploy en Vercel (hosting gratuito)
1. Ve a https://vercel.com y entra con tu cuenta de GitHub
2. Clic en "Add New Project"
3. Selecciona el repositorio `spaceai`
4. En "Environment Variables" añade:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** pega tu API key aquí
5. Clic en "Deploy"

¡Listo! En 2 minutos tendrás tu app en una URL pública tipo `spaceai.vercel.app`

---

## 💻 Probar en local (opcional)

```bash
npm install
npm run dev
```

Abre http://localhost:3000

---

## 💰 Costes estimados

- **Hosting Vercel:** GRATIS
- **API Anthropic:** ~0.003€ por análisis
- Con 100 análisis/día → ~9€/mes

---

## 📁 Estructura del proyecto

```
spaceai/
├── pages/
│   ├── index.js        # Frontend completo
│   └── api/
│       └── analyze.js  # Backend (llama a Anthropic)
├── .env.local          # Tu API key (NO subir a GitHub)
├── package.json
└── next.config.js
```

> ⚠️ **IMPORTANTE:** No subas el archivo `.env.local` a GitHub.
> La API key se configura directamente en Vercel (Paso 3).
