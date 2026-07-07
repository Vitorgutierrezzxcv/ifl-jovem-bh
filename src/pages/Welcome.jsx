import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import IFLLogo from "../components/layout/IFLLogo";

const slides = [
  {
    title: "Sua jornada de\nformação começa aqui.",
    sub: "Central IFL Jovem BH é a plataforma oficial de gestão e desenvolvimento de lideranças.",
    accent: "#B8872A",
  },
  {
    title: "Acompanhe sua\nevoluçao em tempo real.",
    sub: "Pontuação, presença, tarefas, ranking e ciclo — tudo em um único lugar.",
    accent: "#D4A043",
  },
  {
    title: "Formação.\nLiderança.\nLiberdade.",
    sub: "O IFL Jovem BH conecta jovens comprometidos com o futuro do Brasil.",
    accent: "#B8872A",
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (current < slides.length - 1) {
        next();
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [current]);

  function next() {
    if (animating) return;
    if (current === slides.length - 1) {
      navigate("/login");
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => c + 1);
      setAnimating(false);
    }, 200);
  }

  function prev() {
    if (animating || current === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => c - 1);
      setAnimating(false);
    }, 200);
  }

  const slide = slides[current];

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden hex-bg-dark"
      style={{
        background: "linear-gradient(160deg, #0D2137 0%, #0A2640 60%, #040F1A 100%)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Glowing orb */}
      <div
        className="absolute top-[-80px] right-[-60px] w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(184,135,42,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[120px] left-[-80px] w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(10,38,64,0.8) 0%, transparent 70%)",
        }}
      />

      {/* Skip */}
      <div className="flex justify-end px-6 pt-6">
        <button
          onClick={() => navigate("/login")}
          className="font-inter text-xs font-medium px-4 py-1.5 rounded-full"
          style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          Pular
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-8">
        {/* Logo */}
        <div className="mb-12">
          <IFLLogo size={52} />
        </div>

        <div
          className="transition-all duration-300"
          style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(12px)" : "translateY(0)" }}
        >
          <h1
            className="font-montserrat font-black text-4xl leading-tight mb-4 whitespace-pre-line"
            style={{ color: "#FFFFFF" }}
          >
            {slide.title}
          </h1>
          <p className="font-inter text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {slide.sub}
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-8 pb-10 flex flex-col gap-6">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 6,
                height: 6,
                background: i === current ? "#B8872A" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: current === 0 ? "transparent" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              opacity: current === 0 ? 0 : 1,
            }}
            disabled={current === 0}
          >
            <ChevronLeft size={20} color="white" />
          </button>

          <button
            onClick={next}
            className="flex items-center gap-2 px-8 h-12 rounded-2xl font-montserrat font-bold text-sm transition-all duration-200 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #B8872A, #D4A043)",
              color: "#071D33",
            }}
          >
            {current === slides.length - 1 ? "Entrar" : "Próximo"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}