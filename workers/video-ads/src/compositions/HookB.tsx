/**
 * Hook B — Desafio + Prazo
 * "Crie seu quiz em 10 min. Desafio."
 *
 * Duração: 18s = 540fr @ 30fps
 * Padrão: DESAFIO + RECIPROCIDADE (nandohayne V1/V2, longevidade 8+ meses)
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { colors, fonts, fontWeights, VIDEO_WIDTH, VIDEO_HEIGHT } from "../brand";
import { Background } from "../components/Background";
import { CTAButton } from "../components/CTAButton";
import { Logo } from "../components/Logo";
import {
  useSlideUp,
  useScaleIn,
  useFadeIn,
  useTypewriter,
} from "../animations";

// ─── Scene 1: HOOK IMPACTO (0–45fr / 0–1.5s) ─────────────────────────────────
const SceneHook: React.FC = () => {
  const l1 = useSlideUp({ delay: 0, duration: 12 });
  const l2 = useScaleIn({ delay: 8 });
  // "Desafio." via typewriter — cada letra a cada 3 frames, delay 20
  const typeText = useTypewriter("Desafio.", { delay: 20, charsPerFrame: 2 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 12,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.bold,
          fontSize: 56,
          color: colors.white,
          opacity: l1.opacity,
          transform: `translateY(${l1.translateY}px)`,
          textAlign: "center",
        }}
      >
        Crie seu quiz
      </span>

      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.extrabold,
          fontSize: 96,
          color: colors.gold,
          opacity: l2.opacity,
          transform: `scale(${l2.scale})`,
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        em 10 min.
      </span>

      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.extrabold,
          fontSize: 72,
          color: colors.accent,
          lineHeight: 1,
          textAlign: "center",
          minHeight: 80,
        }}
      >
        {typeText}
      </span>
    </AbsoluteFill>
  );
};

// ─── Scene 2: DESAFIO EXPLICITADO (45–150fr / 1.5–5s) ────────────────────────
const steps = [
  { num: "01", text: "Cria o quiz", delay: 0 },
  { num: "02", text: "Ativa o link", delay: 20 },
  { num: "03", text: "Vê o lead chegar", delay: 40 },
];

const SceneSteps: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        flexDirection: "column",
        gap: 40,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      {steps.map(({ num, text, delay }) => (
        <StepLine key={num} num={num} text={text} delay={delay} />
      ))}
    </AbsoluteFill>
  );
};

const StepLine: React.FC<{ num: string; text: string; delay: number }> = ({
  num,
  text,
  delay,
}) => {
  const anim = useSlideUp({ delay, duration: 16 });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 24,
        opacity: anim.opacity,
        transform: `translateY(${anim.translateY}px)`,
      }}
    >
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.extrabold,
          fontSize: 64,
          color: colors.gold,
          lineHeight: 1,
          minWidth: 80,
        }}
      >
        {num}
      </span>
      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.semibold,
          fontSize: 40,
          color: colors.white,
          lineHeight: 1.2,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Scene 3: APOSTA (150–300fr / 5–10s) ─────────────────────────────────────
const SceneBet: React.FC = () => {
  const l1 = useSlideUp({ delay: 0, duration: 18 });
  const l2 = useSlideUp({ delay: 20, duration: 18 });
  const l3 = useScaleIn({ delay: 45 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 20,
        paddingLeft: 72,
        paddingRight: 72,
      }}
    >
      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.medium,
          fontSize: 34,
          color: colors.textMuted,
          opacity: l1.opacity,
          transform: `translateY(${l1.translateY}px)`,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        Se não conseguir em 10 min,
      </span>
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.bold,
          fontSize: 44,
          color: colors.white,
          opacity: l2.opacity,
          transform: `translateY(${l2.translateY}px)`,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        a gente configura pra você.
      </span>
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.extrabold,
          fontSize: 72,
          color: colors.primary,
          opacity: l3.opacity,
          transform: `scale(${l3.scale})`,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        De graça.
      </span>
    </AbsoluteFill>
  );
};

// ─── Scene 4: TOPA? (300–420fr / 10–14s) ─────────────────────────────────────
const SceneTopa: React.FC = () => {
  const anim = useScaleIn({ delay: 0 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.extrabold,
          fontSize: 120,
          color: colors.white,
          opacity: anim.opacity,
          transform: `scale(${anim.scale})`,
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        Topa? 🤝
      </span>
    </AbsoluteFill>
  );
};

// ─── Scene 5: PREVIEW PRODUTO (420–510fr / 14–17s) ───────────────────────────
const SceneProductPreview: React.FC = () => {
  const container = useFadeIn({ delay: 0, duration: 25 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 32,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <div
        style={{
          opacity: container,
          background: colors.surfaceDark,
          borderRadius: 24,
          padding: "48px 40px",
          width: "100%",
          border: `1px solid rgba(99,102,241,0.35)`,
          boxShadow: `0 0 40px rgba(99,102,241,0.15)`,
        }}
      >
        {/* Mock quiz question */}
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: fontWeights.medium,
            fontSize: 20,
            color: colors.textMuted,
            marginBottom: 16,
          }}
        >
          Pergunta 1 de 4
        </div>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: fontWeights.bold,
            fontSize: 36,
            color: colors.white,
            lineHeight: 1.35,
            marginBottom: 32,
          }}
        >
          Qual é seu maior desafio hoje?
        </div>
        {["Capturar leads qualificados", "Converter no WhatsApp", "Escalar com tráfego pago"].map(
          (opt, i) => (
            <div
              key={opt}
              style={{
                background: i === 0 ? `rgba(99,102,241,0.25)` : `rgba(255,255,255,0.05)`,
                border: i === 0 ? `1px solid ${colors.primary}` : `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 12,
                fontFamily: fonts.body,
                fontWeight: fontWeights.medium,
                fontSize: 26,
                color: i === 0 ? colors.white : colors.textMuted,
              }}
            >
              {opt}
            </div>
          )
        )}
      </div>

      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.regular,
          fontSize: 24,
          color: colors.textMuted,
          textAlign: "center",
          opacity: container,
        }}
      >
        Quiz pronto em minutos. Sem código.
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 6: CTA (510–540fr / 17–18s) ──────────────────────────────────────
const SceneCTA: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <Logo size="sm" delay={0} />
      <CTAButton primary="CRIAR MEU QUIZ GRÁTIS" delay={8} />
    </AbsoluteFill>
  );
};

// ─── COMPOSITION ROOT ────────────────────────────────────────────────────────
export const HookB: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: colors.bgDark, width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}>
      <Background variant="glow" />

      {/* Scene 1: Hook impacto — 0–45fr */}
      <Sequence from={0} durationInFrames={45}>
        <SceneHook />
      </Sequence>

      {/* Scene 2: Steps — 45–150fr */}
      <Sequence from={45} durationInFrames={105}>
        <SceneSteps />
      </Sequence>

      {/* Scene 3: Aposta — 150–300fr */}
      <Sequence from={150} durationInFrames={150}>
        <SceneBet />
      </Sequence>

      {/* Scene 4: Topa? — 300–420fr */}
      <Sequence from={300} durationInFrames={120}>
        <SceneTopa />
      </Sequence>

      {/* Scene 5: Preview produto — 420–510fr */}
      <Sequence from={420} durationInFrames={90}>
        <SceneProductPreview />
      </Sequence>

      {/* Scene 6: CTA — 510–540fr */}
      <Sequence from={510} durationInFrames={30}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
