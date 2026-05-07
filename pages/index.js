import { useState, useRef } from "react";
import Head from "next/head";

const STYLES = [
  { key: "Minimalista moderno", emoji: "🤍", label: "Minimalista" },
  { key: "Nórdico escandinavo", emoji: "🌿", label: "Nórdico" },
  { key: "Industrial urbano", emoji: "🔩", label: "Industrial" },
  { key: "Mediterráneo cálido", emoji: "☀️", label: "Mediterráneo" },
  { key: "Bohemio ecléctico", emoji: "🪴", label: "Bohemio" },
  { key: "Lujo contemporáneo", emoji: "✨", label: "Lujoso" },
];

const LOADING_MSGS = [
  "Detectando elementos del espacio...",
  "Evaluando luz natural y distribución...",
  "Generando sugerencias personalizadas...",
  "Creando paleta de colores ideal...",
];

export default function Home() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [style, setStyle] = useState("Minimalista moderno");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const intervalRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64(ev.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingMsg(0);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % LOADING_MSGS.length;
      setLoadingMsg(i);
    }, 1800);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, style }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError("Error al analizar. Intenta con otra imagen.");
    } finally {
      clearInterval(intervalRef.current);
      setLoading(false);
    }
  }

  function reset() {
    setImage(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    fileRef.current.value = "";
  }

  return (
    <>
      <Head>
        <title>SpaceAI — Rediseño inteligente</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main>
        <div className="container">
          {/* Header */}
          <div className="header">
            <div className="logo">🏠</div>
            <div>
              <h1>SpaceAI</h1>
              <p className="subtitle">Rediseño inteligente de espacios</p>
            </div>
          </div>

          {/* Upload */}
          {!result && !loading && (
            <>
              <div
                className="drop-zone"
                onClick={() => fileRef.current.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
                {image ? (
                  <img src={image} alt="Vista previa" className="preview" />
                ) : (
                  <div className="drop-placeholder">
                    <span className="drop-icon">📷</span>
                    <p className="drop-title">Sube una foto de tu espacio</p>
                    <p className="drop-sub">
                      Habitación, salón, cocina, oficina...
                    </p>
                  </div>
                )}
              </div>

              {image && (
                <>
                  <p className="section-label">Estilo deseado</p>
                  <div className="style-grid">
                    {STYLES.map((s) => (
                      <button
                        key={s.key}
                        className={`style-btn ${style === s.key ? "active" : ""}`}
                        onClick={() => setStyle(s.key)}
                      >
                        {s.emoji} {s.label}
                      </button>
                    ))}
                  </div>
                  <button className="analyze-btn" onClick={analyze}>
                    ✨ Analizar con IA
                  </button>
                  {error && <p className="error">{error}</p>}
                </>
              )}
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading">
              <div className="spinner">🧠</div>
              <p className="loading-title">Analizando tu espacio...</p>
              <p className="loading-msg">{LOADING_MSGS[loadingMsg]}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="results">
              {image && (
                <img src={image} alt="Espacio analizado" className="result-img" />
              )}

              {/* Resumen */}
              <div className="card">
                <h2>✨ Análisis del espacio</h2>
                <p className="analysis-text">{result.resumen}</p>
                <div className="tags">
                  {(result.etiquetas_positivas || []).map((t, i) => (
                    <span key={i} className="tag good">
                      ✓ {t}
                    </span>
                  ))}
                  {(result.etiquetas_mejora || []).map((t, i) => (
                    <span key={i} className="tag warn">
                      ↑ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Puntuaciones */}
              <div className="card">
                <h2>📊 Puntuación actual</h2>
                {(result.puntuaciones || []).map((s, i) => (
                  <div key={i} className="score-item">
                    <div className="score-header">
                      <span className="score-name">{s.nombre}</span>
                      <span className="score-val">{s.valor}/100</span>
                    </div>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{ width: `${s.valor}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sugerencias */}
              <div className="card">
                <h2>💡 Sugerencias de mejora</h2>
                {(result.sugerencias || []).map((s, i) => (
                  <div key={i} className="suggestion">
                    <div className="sug-icon">{s.icono}</div>
                    <div>
                      <p className="sug-title">{s.titulo}</p>
                      <p className="sug-desc">{s.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paleta */}
              <div className="card">
                <h2>🎨 Paleta recomendada</h2>
                <div className="palette">
                  {(result.paleta || []).map((p, i) => (
                    <div key={i} className="swatch">
                      <div
                        className="swatch-color"
                        style={{ background: p.color }}
                      />
                      <p className="swatch-name">{p.nombre}</p>
                      <p className="swatch-hex">{p.color}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="reset-btn" onClick={reset}>
                ↩ Analizar otro espacio
              </button>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: "DM Sans", sans-serif;
          background: #f5f4f0;
          color: #1a1a1a;
          min-height: 100vh;
        }
        main {
          padding: 2rem 1rem;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 2rem;
        }
        .logo {
          font-size: 2rem;
          width: 52px;
          height: 52px;
          background: #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e3dd;
        }
        h1 {
          font-size: 22px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .subtitle {
          font-size: 13px;
          color: #888;
          margin-top: 2px;
        }
        .drop-zone {
          background: #fff;
          border: 2px dashed #d5d3cc;
          border-radius: 16px;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.2s;
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drop-zone:hover {
          border-color: #534ab7;
        }
        .drop-placeholder {
          text-align: center;
          padding: 2rem;
        }
        .drop-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 10px;
        }
        .drop-title {
          font-weight: 500;
          font-size: 15px;
          margin-bottom: 4px;
        }
        .drop-sub {
          font-size: 13px;
          color: #888;
        }
        .preview {
          width: 100%;
          max-height: 320px;
          object-fit: cover;
          display: block;
        }
        .section-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #888;
          margin: 1.25rem 0 0.5rem;
        }
        .style-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 1rem;
        }
        .style-btn {
          padding: 10px 6px;
          border: 1.5px solid #e5e3dd;
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
          color: #555;
          font-family: "DM Sans", sans-serif;
          transition: all 0.15s;
        }
        .style-btn:hover {
          border-color: #aaa;
          color: #1a1a1a;
        }
        .style-btn.active {
          border-color: #534ab7;
          background: #eeedfe;
          color: #3c3489;
          font-weight: 500;
        }
        .analyze-btn {
          width: 100%;
          padding: 15px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          font-family: "DM Sans", sans-serif;
          transition: opacity 0.15s;
        }
        .analyze-btn:hover {
          opacity: 0.85;
        }
        .error {
          color: #c0392b;
          font-size: 13px;
          margin-top: 8px;
          text-align: center;
        }
        .loading {
          text-align: center;
          padding: 4rem 0;
        }
        .spinner {
          font-size: 3rem;
          animation: pulse 1.5s infinite;
          display: block;
          margin-bottom: 1rem;
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        .loading-title {
          font-weight: 500;
          font-size: 16px;
          margin-bottom: 6px;
        }
        .loading-msg {
          font-size: 13px;
          color: #888;
        }
        .results {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .result-img {
          width: 100%;
          border-radius: 16px;
          max-height: 260px;
          object-fit: cover;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          padding: 1.25rem;
          border: 1px solid #e5e3dd;
        }
        .card h2 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .analysis-text {
          font-size: 14px;
          line-height: 1.6;
          color: #444;
          margin-bottom: 12px;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
        }
        .tag.good {
          background: #eaf3de;
          color: #27500a;
        }
        .tag.warn {
          background: #faeeda;
          color: #633806;
        }
        .score-item {
          margin-bottom: 12px;
        }
        .score-item:last-child {
          margin-bottom: 0;
        }
        .score-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 5px;
        }
        .score-name {
          color: #555;
        }
        .score-val {
          font-weight: 500;
        }
        .score-bar {
          height: 6px;
          background: #f0ede8;
          border-radius: 100px;
        }
        .score-fill {
          height: 100%;
          background: #534ab7;
          border-radius: 100px;
          transition: width 0.8s ease;
        }
        .suggestion {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f0ede8;
        }
        .suggestion:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .sug-icon {
          font-size: 1.4rem;
          width: 40px;
          height: 40px;
          background: #f5f4f0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sug-title {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 3px;
        }
        .sug-desc {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
        }
        .palette {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .swatch {
          text-align: center;
        }
        .swatch-color {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          border: 1px solid #e5e3dd;
          margin-bottom: 5px;
        }
        .swatch-name {
          font-size: 11px;
          color: #555;
          font-weight: 500;
        }
        .swatch-hex {
          font-size: 10px;
          color: #aaa;
        }
        .reset-btn {
          background: none;
          border: 1px solid #d5d3cc;
          border-radius: 10px;
          padding: 10px 20px;
          font-size: 13px;
          color: #666;
          cursor: pointer;
          font-family: "DM Sans", sans-serif;
          transition: all 0.15s;
          align-self: flex-start;
        }
        .reset-btn:hover {
          border-color: #999;
          color: #1a1a1a;
        }
      `}</style>
    </>
  );
}
