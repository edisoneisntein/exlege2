import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(
  ScrollTrigger,
  ScrollSmoother,
  ScrollToPlugin,
  SplitText,
  ScrambleTextPlugin,
  DrawSVGPlugin,
  useGSAP
);

/* Navegación suave compatible con ScrollSmoother (skill gsap-plugins) */
function scrollToSection(hash) {
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(hash, true, "top 90px");
  else gsap.to(window, { duration: 1, scrollTo: { y: hash, offsetY: 90 } });
}

/* Botón magnético — gsap.quickTo (skill gsap-utils) */
function useMagnetic(ref) {
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo(gsap.utils.clamp(-14, 14, (e.clientX - r.left - r.width / 2) * 0.35));
      yTo(gsap.utils.clamp(-10, 10, (e.clientY - r.top - r.height / 2) * 0.35));
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  });
}

function MagneticButton({ href, className, children, onClick }) {
  const ref = useRef(null);
  useMagnetic(ref);
  const handleClick = (e) => {
    if (href?.startsWith("#")) {
      e.preventDefault();
      scrollToSection(href);
    }
    if (onClick) onClick(e);
  };
  return (
    <a ref={ref} href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

/* ---------------- Nav ---------------- */
function Nav({ onAccessRequested }) {
  const [scrolled, setScrolled] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Barra de progreso de lectura — ScrollTrigger.create standalone (skill scrolltrigger) */
  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => gsap.set(barRef.current, { scaleX: self.progress }),
    });
  });

  const onClick = (hash) => (e) => {
    e.preventDefault();
    scrollToSection(hash);
  };

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav-logo">
        EX<span>LEGE</span>
      </div>
      <div className="nav-links">
        <a href="#capacidades" onClick={onClick("#capacidades")}>Capacidades</a>
        <a href="#proceso" onClick={onClick("#proceso")}>Proceso</a>
        <a href="#rigor" onClick={onClick("#rigor")}>Rigor</a>
        <MagneticButton href="#acceso" className="btn btn-gold" onClick={onAccessRequested}>
          Solicitar acceso
        </MagneticButton>
      </div>
      <div className="scroll-progress" ref={barRef} />
    </nav>
  );
}

/* ---------------- Hero ---------------- */
function Hero({ onAccessRequested }) {
  const heroRef = useRef(null);

  useGSAP(
    () => {
      /* ScrambleText en el eyebrow (skill gsap-plugins) */
      const eyebrow = heroRef.current.querySelector(".hero-eyebrow");
      const eyebrowText = eyebrow.textContent;

      /* SplitText con mask de líneas (skill gsap-plugins: reveal enmascarado) */
      const split = SplitText.create(".hero h1", { type: "lines,words", mask: "lines" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(eyebrow, {
        duration: 1.1,
        scrambleText: { text: eyebrowText, chars: "§01¶", speed: 0.4 },
      })
        .from(
          split.lines,
          { yPercent: 120, autoAlpha: 0, stagger: 0.09, duration: 1 },
          "-=0.5"
        )
        /* DrawSVG: el subrayado dorado se dibuja (skill gsap-plugins) */
        .fromTo(
          ".hero-underline path",
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 0.9, ease: "power2.inOut" },
          "-=0.4"
        )
        .from(".hero-sub", { y: 30, autoAlpha: 0, duration: 0.8 }, "-=0.6")
        .from(".hero-ctas .btn", { y: 24, autoAlpha: 0, stagger: 0.12, duration: 0.6 }, "-=0.5")
        .from(".scroll-hint", { autoAlpha: 0, duration: 0.8 }, "-=0.2");

      gsap.to(".hero-bg-glow", {
        scale: 1.25,
        opacity: 0.7,
        duration: 5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      return () => split.revert();
    },
    { scope: heroRef }
  );

  return (
    <header className="hero" ref={heroRef}>
      <div className="hero-bg-glow" data-speed="0.6" />
      <div className="hero-grid" data-speed="0.85" />
      <p className="hero-eyebrow">Inteligencia jurídica estratégica</p>
      <h1>
        Tu caso, analizado con{" "}
        <span className="gold hero-underline-wrap">
          rigor forense
          <svg className="hero-underline" viewBox="0 0 300 14" preserveAspectRatio="none">
            <path d="M3 10 Q 150 -2 297 9" />
          </svg>
        </span>{" "}
        <span className="scales">⚖️</span>
      </h1>
      <p className="hero-sub">
        EXLEGE examina la totalidad de tu expediente, traza la estrategia
        procesal con mayor probabilidad de éxito y audita cada afirmación con un
        motor anti-alucinación. IA jurídica que rinde cuentas, literalmente.
      </p>
      <div className="hero-ctas">
        <MagneticButton href="#acceso" className="btn btn-gold" onClick={onAccessRequested}>
          Analizar mi caso
        </MagneticButton>
        <MagneticButton href="#capacidades" className="btn btn-ghost">
          Ver capacidades
        </MagneticButton>
      </div>
      <div className="scroll-hint">Desliza</div>
    </header>
  );
}

/* ---------------- Marquee ---------------- */
const MARQUEE_ITEMS = [
  "Análisis estratégico",
  "Auditoría forense IA",
  "Anti-alucinación",
  "Jurisprudencia verificada",
  "Métricas de rigor",
  "Estrategia procesal",
];

function Marquee() {
  const innerRef = useRef(null);
  useGSAP(() => {
    const tween = gsap.to(innerRef.current, {
      xPercent: -50,
      ease: "none",
      duration: 28,
      repeat: -1,
    });
    return () => tween.kill();
  });
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee">
      <div className="marquee-inner" ref={innerRef}>
        {items.map((t, i) => (
          <span key={i}>
            <b>§</b> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Capacidades (ScrollTrigger.batch) ---------------- */
const FEATURES = [
  {
    icon: "🗂️",
    title: "Lectura integral del expediente",
    text: "Procesa demandas, contestaciones, pruebas y providencias. Nada se escapa: cada folio queda indexado y citado.",
  },
  {
    icon: "🧭",
    title: "Matriz de estrategia procesal",
    text: "Compara escenarios (allanamiento, litigio, conciliación, recurso) con probabilidad estimada y costo procesal de cada ruta.",
  },
  {
    icon: "🛡️",
    title: "Motor anti-alucinación",
    text: "Cada cita legal y jurisprudencial pasa por una compuerta de verificación. Lo que no se puede sustentar, se marca como NO VERIFICADO.",
  },
  {
    icon: "⚖️",
    title: "Juez de rigor factual",
    text: "Un evaluador independiente puntúa rigor, factualidad y admisibilidad de cada análisis antes de entregarlo.",
  },
  {
    icon: "📈",
    title: "Auditoría forense del caso",
    text: "Línea de tiempo probatoria, contradicciones entre declaraciones y vacíos de la contraparte, expuestos con precisión quirúrgica.",
  },
  {
    icon: "🔒",
    title: "Confidencialidad por diseño",
    text: "Acceso por códigos, datos bajo tu control. Tu estrategia no entrena modelos ajenos: privilegio abogado-cliente respetado.",
  },
];

function Capacidades() {
  const ref = useRef(null);
  useGSAP(
    () => {
      gsap.from(".section-head-cap > *", {
        y: 40,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
      });
      gsap.set(".feature-card", { y: 60, autoAlpha: 0, scale: 0.96 });
      /* ScrollTrigger.batch — revela las tarjetas en lotes (skill scrolltrigger) */
      ScrollTrigger.batch(".feature-card", {
        start: "top 85%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            stagger: 0.12,
            duration: 0.7,
            ease: "power3.out",
            overwrite: true,
          }),
      });
    },
    { scope: ref }
  );
  return (
    <section className="section" id="capacidades" ref={ref}>
      <div className="section-head-cap">
        <p className="section-eyebrow">Capacidades</p>
        <h2>Un bufete de analistas que nunca duerme</h2>
        <p className="lead">
          EXLEGE combina lectura exhaustiva, razonamiento estratégico y verificación
          adversarial en un solo flujo de trabajo.
        </p>
      </div>
      <div className="features-grid">
        {FEATURES.map((f) => (
          <article className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Proceso: sección horizontal pineada ---------------- */
const STEPS = [
  {
    n: "01",
    title: "Carga el expediente",
    text: "Sube las piezas del proceso en PDF o texto. EXLEGE las ordena, indexa y detecta la jerarquía probatoria.",
  },
  {
    n: "02",
    title: "Análisis y verificación",
    text: "El motor razona sobre el caso completo y un juez independiente audita cada conclusión. Sin sustento, no sale.",
  },
  {
    n: "03",
    title: "Matriz estratégica",
    text: "Recibes las rutas procesales posibles, con riesgos, probabilidades y la recomendación fundamentada.",
  },
  {
    n: "04",
    title: "Decide con evidencia",
    text: "Un informe ejecutivo listo para sustentar ante cliente, comité o juzgado. Cada afirmación, con su cita.",
  },
];

function Proceso() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const counterRef = useRef(null);

  useGSAP(
    () => {
      /* matchMedia: horizontal pin solo en desktop y sin reducción de movimiento (skill core) */
      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 801px)",
          reduceOK: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { isDesktop, reduceOK } = context.conditions;
          if (!isDesktop || !reduceOK) return;

          const track = trackRef.current;
          const panels = gsap.utils.toArray(".proceso-panel");

          /* Horizontal scroll pineado — ease: "none" es OBLIGATORIO (skill scrolltrigger) */
          const scrollTween = gsap.to(track, {
            /* px contra el viewport: xPercent es relativo al ANCHO DEL TRACK (skill scrolltrigger) */
            x: () => -(track.offsetWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              pin: true,
              scrub: 1,
              snap: 1 / (panels.length - 1),
              end: () => "+=" + track.offsetWidth,
              onUpdate: (self) => {
                const idx = Math.round(self.progress * (panels.length - 1));
                if (counterRef.current)
                  counterRef.current.textContent = `0${idx + 1} / 0${panels.length}`;
              },
            },
          });

          /* Parallax interno ligado a la animación contenedora (containerAnimation) */
          panels.forEach((panel) => {
            gsap.from(panel.querySelector(".panel-num"), {
              yPercent: 60,
              autoAlpha: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                containerAnimation: scrollTween,
                trigger: panel,
                start: "left 70%",
                toggleActions: "play none none reverse",
              },
            });
          });
        }
      );
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section className="proceso" id="proceso" ref={sectionRef}>
      <div className="proceso-head">
        <p className="section-eyebrow">Proceso</p>
        <h2>Del caos documental a la estrategia</h2>
        <p className="proceso-counter" ref={counterRef}>01 / 04</p>
      </div>
      <div className="proceso-track" ref={trackRef}>
        {STEPS.map((s) => (
          <article className="proceso-panel" key={s.n}>
            <div className="panel-num">{s.n}</div>
            <div className="panel-body">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Métricas ---------------- */
const METRICS = [
  { value: 100, suffix: "%", label: "De citas sometidas a verificación" },
  { value: 4, suffix: "", label: "Dimensiones evaluadas por el juez de rigor" },
  { value: 0, suffix: "", label: "Tolerancia a la alucinación" },
  { value: 24, suffix: "/7", label: "Disponibilidad del análisis" },
];

function Rigor() {
  const ref = useRef(null);
  useGSAP(
    () => {
      gsap.from(".metric", {
        y: 50,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ".metrics", start: "top 80%", once: true },
      });
      gsap.utils.toArray(".metric-value").forEach((el) => {
        const target = Number(el.dataset.value);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          snap: { v: 1 },
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.v) + el.dataset.suffix;
          },
        });
      });
    },
    { scope: ref }
  );
  return (
    <section className="section" id="rigor" ref={ref}>
      <p className="section-eyebrow">Rigor verificable</p>
      <h2>No pedimos confianza. Presentamos evidencia.</h2>
      <p className="lead">
        En el derecho, una cita inventada puede costar el caso. Por eso EXLEGE no
        solo analiza: se audita a sí mismo y muestra sus cartas.
      </p>
      <div className="metrics">
        {METRICS.map((m) => (
          <div className="metric" key={m.label}>
            <span className="metric-value" data-value={m.value} data-suffix={m.suffix}>
              0{m.suffix}
            </span>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Cita (scrub por palabras) ---------------- */
function Cita() {
  const ref = useRef(null);
  useGSAP(
    () => {
      const split = SplitText.create(".quote-block blockquote", { type: "words" });
      gsap.from(split.words, {
        autoAlpha: 0.12,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
          end: "center 45%",
          scrub: true,
        },
      });
      return () => split.revert();
    },
    { scope: ref }
  );
  return (
    <section className="section" ref={ref}>
      <div className="quote-block">
        <blockquote>
          “El abogado que gana no es el que más sabe, sino el que{" "}
          <span className="gold">mejor prepara el caso</span>. EXLEGE existe para
          que la preparación ya no dependa de las horas que te quedan。”
        </blockquote>
        <cite>— Principio fundador, EXLEGE</cite>
      </div>
    </section>
  );
}

/* ---------------- CTA final ---------------- */
function CtaFinal({ onAccessRequested }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const split = SplitText.create(".cta-final h2", { type: "chars" });
      gsap.from(split.chars, {
        y: 50,
        autoAlpha: 0,
        stagger: 0.02,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
      });
      gsap.from(".cta-final p, .cta-final .btn", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.7,
        scrollTrigger: { trigger: ref.current, start: "top 65%", once: true },
      });
      return () => split.revert();
    },
    { scope: ref }
  );
  return (
    <section className="cta-final" id="acceso" ref={ref}>
      <p className="section-eyebrow" style={{ textAlign: "center" }}>
        Acceso anticipado
      </p>
      <h2>La estrategia correcta cambia el veredicto</h2>
      <p>
        Solicita tu código de acceso y somete tu primer caso al análisis de
        EXLEGE. Cupos limitados por cohorte.
      </p>
      <MagneticButton href="#acceso" className="btn btn-gold" onClick={onAccessRequested}>
        Solicitar acceso
      </MagneticButton>
    </section>
  );
}

/* ---------------- Auth Code Modal ---------------- */
function AuthCodeModal({ isOpen, onClose, onCodeSubmit }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Aquí iría la validación real del código con tu backend
      // Por ahora, simulamos una validación exitosa después de un retraso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulamos código válido (en producción, esto vendría del backend)
      if (code === "EXLEGE2024") {
        onCodeSubmit();
        onClose();
      } else {
        throw new Error("Código de acceso inválido");
      }
    } catch (err) {
      setError(err.message || "Error al validar el código");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#13081e]/90 backdrop-blur-2xl border border-[#C5A059]/40 rounded-3xl shadow-2xl shadow-black/90 p-8 md:p-10 w-full max-w-md">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-cinzel text-[#f5d76e]">Acceso con Código</h2>
            <button
              onClick={onClose}
              className="text-[#f5d76e]/60 hover:text-[#f5d76e] transition-colors"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-cinzel text-[#f5d76e]">Código de acceso</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingresa tu código"
                className="w-full bg-transparent border-b border-[#C5A059]/40 pb-1 text-sm text-slate-100 focus:outline-none focus:border-[#f5d76e]"
                required
                autoComplete="off"
              />
            </div>
            
            {error && (
              <p className="text-sm text-rose-400 font-cinzel">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#59143a] via-[#8a2232] to-[#59143a] hover:from-[#731a4b] hover:to-[#731a4b] text-white rounded-xl text-xs font-cinzel font-black tracking-widest uppercase shadow-[0_0_20px_rgba(138,34,50,0.6)] border border-[#ff8597] flex items-center gap-2 px-6 py-2.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Validando...' : 'Acceder'}
            </button>
          </form>
          
          <div className="text-xs text-[#f5d76e]/60 text-center">
            ¿No tienes código? <span className="text-[#f5d76e] hover:text-[#f5d76e]/80 cursor-pointer">Solicítalo aquí</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- App con ScrollSmoother ---------------- */
export default function LandingPage({ onAuthSuccess }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const handleAccessRequested = () => {
    setShowAuthModal(true);
  };
  
  const handleCodeSubmit = () => {
    // Aquí llamaríamos a tu backend para validar el código y obtener un token
    // Por ahora, simulamos éxito y llamamos al callback
    onAuthSuccess();
  };

  useGSAP(() => {
    /* gsap.matchMedia: ScrollSmoother solo si el usuario no pidió reducir movimiento (skill core) */
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
        normalizeScroll: true,
      });
    });
    return () => mm.revert();
  });

  return (
    <>
      <Nav onAccessRequested={handleAccessRequested} />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <Hero onAccessRequested={handleAccessRequested} />
          <Marquee />
          <Capacidades />
          <Proceso />
          <Rigor />
          <Cita />
          <CtaFinal onAccessRequested={handleAccessRequested} />
          <footer>
            <div className="nav-logo" style={{ fontSize: "1rem" }}>
              EX<span>LEGE</span>
            </div>
            <div>© {new Date().getFullYear()} EXLEGE · Inteligencia jurídica estratégica</div>
            <div>Bogotá · Colombia</div>
          </footer>
        </div>
      </div>
      <AuthCodeModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onCodeSubmit={handleCodeSubmit}
      />
    </>
  );
}