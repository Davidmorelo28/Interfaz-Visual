import { useState, useEffect, useCallback, useRef } from "react";
import newLogoPath from "@assets/Hidro_Sinu_Icono__1778040606670.png";

type Screen = "splash" | "inicio" | "espera" | "resultado";

const WEBHOOK_URL = "https://n8n-production-89388.up.railway.app/webhook/hidro-sinu";

export default function HidroBot() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [tipoGlobal, setTipoGlobal] = useState("");
  const [resultHtml, setResultHtml] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOverlayVisible(true);
      setScreen("inicio");
      const hide = setTimeout(() => setOverlayVisible(false), 500);
      return () => clearTimeout(hide);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  const mostrarResultado = useCallback((html: string) => {
    setResultHtml(html);
    setScreen("resultado");
  }, []);

  const enviarSolicitud = useCallback(
    (tipo: string) => {
      setTipoGlobal(tipo);
      setScreen("espera");
      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo_consulta: tipo }),
      })
        .then((res) => res.text())
        .then((html) => {
          if (html && html.length > 0) mostrarResultado(html);
        })
        .catch(() => {});
    },
    [mostrarResultado]
  );

  const volverInicio = useCallback(() => {
    setScreen("inicio");
    setResultHtml(null);
    setTipoGlobal("");
  }, []);

  const tipoLabel: Record<string, string> = {
    hoy: "Pronóstico de Hoy",
    "mañana": "Pronóstico de Mañana",
    semana: "Pronóstico de Semana",
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {overlayVisible && <div className="transition-overlay" />}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-3xl">
        {screen === "splash" && (
          <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
            <div className="animate-fade-in flex flex-col items-center px-8 sm:px-16 text-center">
              <img src={newLogoPath} alt="Logo Hidro Sinú" className="animate-bounce-logo mb-6 w-24 h-24 sm:w-36 sm:h-36 lg:w-44 lg:h-44 object-contain rounded-2xl" />
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 tracking-wide text-black">Hidro Sinú</div>
              <div className="w-64 sm:w-72 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="splash-progress-bar" />
              </div>
            </div>
          </div>
        )}
        {screen === "inicio" && (
          <div className="animate-slide-up bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <img src={newLogoPath} alt="Hidro Sinú Logo" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain rounded-2xl mb-3" style={{ boxShadow: "0 10px 30px rgba(21,101,192,0.25)" }} />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800">Hidro Sinú</div>
            </div>
            <div className="text-sm sm:text-base rounded-2xl p-4 sm:p-5 mb-6 leading-relaxed" style={{ background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)", borderLeft: "4px solid #1565c0", color: "#0d47a1" }}>
              <strong>Hola Usuario,</strong>{" "}Este es un sistema automático que monitorea el clima y el nivel del río Sinú para brindar información oportuna, de calidad y en tiempo real para todas las personas.
            </div>
            <div className="text-center text-base sm:text-lg font-semibold text-blue-800 mb-5">¿Qué deseas consultar?</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { tipo: "hoy", emoji: "☀️", titulo: "Pronóstico de Hoy", descripcion: "Consulta el estado actual del clima y del río." },
                { tipo: "mañana", emoji: "🌤️", titulo: "Pronóstico de Mañana", descripcion: "Comportamiento del clima para mañana y tendencia estimada del río Sinú." },
                { tipo: "semana", emoji: "📅", titulo: "Pronóstico de Semana", descripcion: "Datos semanales del clima y tendencia estimada del río Sinú." },
              ].map((card) => (
                <ForecastCard key={card.tipo} tipo={card.tipo} emoji={card.emoji} titulo={card.titulo} descripcion={card.descripcion} onClick={() => enviarSolicitud(card.tipo)} />
              ))}
            </div>
          </div>
        )}
        {screen === "espera" && (
          <div className="animate-slide-up bg-white rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-4 sm:mb-6">Procesando solicitud</h2>
            {tipoGlobal && (
              <div className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-5" style={{ background: "linear-gradient(135deg, #e3f2fd, #bbdefb)", color: "#0d47a1" }}>
                {tipoLabel[tipoGlobal] || tipoGlobal}
              </div>
            )}
            <p className="text-gray-500 text-sm sm:text-base mb-2 leading-relaxed max-w-xs sm:max-w-sm mx-auto">La solicitud puede tardar unos minutos, por favor no salga de la app.</p>
            <p className="text-blue-700 text-base sm:text-lg font-semibold mb-4">Procesando</p>
            <RobotAnimacion />
            <button onClick={volverInicio} className="w-full mt-6 py-3 sm:py-4 rounded-2xl text-sm sm:text-base font-semibold cursor-pointer transition-all duration-200 bg-transparent" style={{ border: "2px solid #e57373", color: "#e57373" }}>✕ &nbsp; Cancelar Solicitud</button>
          </div>
        )}
        {screen === "resultado" && resultHtml && (
          <ResultadoFrame html={resultHtml} tipo={tipoGlobal} tipoLabel={tipoLabel} onVolver={volverInicio} />
        )}
      </div>
    </div>
  );
}

function ResultadoFrame({ html, tipo, tipoLabel, onVolver }: { html: string; tipo: string; tipoLabel: Record<string, string>; onVolver: () => void; }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(400);
  const ajustarAltura = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame?.contentDocument?.body) return;
    const h = frame.contentDocument.body.scrollHeight;
    if (h > 0) setIframeHeight(h + 24);
  }, []);
  return (
    <div className="animate-slide-up bg-white rounded-3xl shadow-2xl p-5 sm:p-8 lg:p-10">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 text-center mb-3">Resultado</h2>
      {tipo && (
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1 rounded-full text-xs sm:text-sm font-semibold" style={{ background: "linear-gradient(135deg, #e3f2fd, #bbdefb)", color: "#0d47a1" }}>{tipoLabel[tipo] || tipo}</span>
        </div>
      )}
      <iframe ref={iframeRef} srcDoc={html} sandbox="allow-scripts allow-same-origin" onLoad={ajustarAltura} style={{ width: "100%", height: iframeHeight, border: "none", borderRadius: 12, display: "block", marginBottom: 16 }} title="Resultado pronóstico" />
      <button onClick={onVolver} className="w-full py-3 sm:py-4 rounded-2xl text-sm sm:text-base font-semibold text-white border-none cursor-pointer transition-all duration-300" style={{ background: "linear-gradient(135deg, #1565c0, #1976d2)" }}>← Volver al inicio</button>
    </div>
  );
}

function RobotAnimacion() {
  const segmentos = 12;
  return (
    <div className="flex justify-center py-4 sm:py-6">
      <svg viewBox="0 0 50 50" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
        {Array.from({ length: segmentos }).map((_, i) => {
          const angle = (i * 360) / segmentos;
          const rad = (angle * Math.PI) / 180;
          const r = 18;
          const cx = 25 + r * Math.sin(rad);
          const cy = 25 - r * Math.cos(rad);
          return (
            <rect key={i} x={cx - 2} y={cy - 5} width="4" height="9" rx="2" fill="#1565c0" transform={`rotate(${angle}, ${cx}, ${cy})`} opacity={((i + 1) / segmentos).toFixed(2)} style={{ animation: "spinnerFade 1s linear infinite", animationDelay: `${-(i / segmentos).toFixed(3)}s` }} />
          );
        })}
      </svg>
    </div>
  );
}

function ForecastCard({ tipo, emoji, titulo, descripcion, onClick }: { tipo: string; emoji: string; titulo: string; descripcion: string; onClick: () => void; }) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="bg-white rounded-2xl p-4 sm:p-5 text-center transition-all duration-300" style={{ border: hovered ? "2px solid #1565c0" : "2px solid #f0f0f0", boxShadow: hovered ? "0 10px 30px rgba(0,0,0,0.12)" : "0 5px 15px rgba(0,0,0,0.08)", transform: hovered ? "translateY(-4px)" : "translateY(0)" }}>
      <span className="text-4xl sm:text-5xl mb-2 sm:mb-3 block">{emoji}</span>
      <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">{titulo}</h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 leading-relaxed">{descripcion}</p>
      <button onMouseEnter={() => setBtnHovered(true)} onMouseLeave={() => setBtnHovered(false)} onClick={onClick} className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200" style={{ background: btnHovered ? "linear-gradient(135deg, #0d47a1, #1565c0)" : "linear-gradient(135deg, #1565c0, #1976d2)", transform: btnHovered ? "scale(1.06)" : "scale(1)", boxShadow: btnHovered ? "0 6px 18px rgba(21,101,192,0.4)" : "0 4px 12px rgba(21,101,192,0.25)" }}>Consultar</button>
    </div>
  );
}
