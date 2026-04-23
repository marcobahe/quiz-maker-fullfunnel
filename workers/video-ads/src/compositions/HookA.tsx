/**
 * Hook A — Pergunta Direta de Dor
 * "Você ainda paga R$97/mês em quiz builder?"
 *
 * Duração: 20s = 600fr @ 30fps
 * Padrão: DOR ULTRA-ESPECÍFICA + COMPARAÇÃO + PROVA SOCIAL + CTA
 * Referência benchmark: Dr. Binato V8 (longevidade 9+ meses)
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { colors, fonts, fontWeights, VIDEO_WIDTH, VIDEO_HEIGHT } from "../brand";
import { Background } from "../components/Background";
import { CTAButton } from "../components/CTAButton";
import { Logo } from "../components/Logo";
import {
  useFadeIn,
  useSlideUp,
  useScaleIn,
  useBlurReveal,
  useCounter,
} from "../animations";

// ─── Scene 1: HOOK (0–60fr / 0–2s) ──────────────────────────────────────────
const SceneHook: React.FC = () => {
  const l1 = useFadeIn({ delay: 0, duration: 15 });
  const l2 = useScaleIn({ delay: 10 });
  const l3 = useSlideUp({ delay: 25, duration: 18 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 16,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.medium,
          fontSize: 36,
          color: colors.white,
          opacity: l1,
          textAlign: "center",
        }}
      >
        Você ainda paga
      </span>

      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.extrabold,
          fontSize: 104,
          color: colors.primary,
          lineHeight: 1,
          opacity: l2.opacity,
          transform: `scale(${l2.scale})`,
          textAlign: "center",
        }}
      >
        R$97/mês
      </span>

      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.semibold,
          fontSize: 40,
          color: colors.white,
          opacity: l3.opacity,
          transform: `translateY(${l3.translateY}px)`,
          textAlign: "center",
        }}
      >
        em quiz builder?
      </span>
    </AbsoluteFill>
  );
};

// ─── Scene 2: IDENTIFICAÇÃO (60–180fr / 2–6s) ────────────────────────────────
const SceneIdentification: React.FC = () => {
  const l1 = useSlideUp({ delay: 0, duration: 18 });
  const l2 = useSlideUp({ delay: 18, duration: 18 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        paddingLeft: 72,
        paddingRight: 72,
      }}
    >
      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.medium,
          fontSize: 36,
          color: colors.textMuted,
          opacity: l1.opacity,
          transform: `translateY(${l1.translateY}px)`,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        Enquanto você paga mensalidade,
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
        seus leads nem qualificam direito.
      </span>
    </AbsoluteFill>
  );
};

// ─── Scene 3: PIVOT/REVELAÇÃO (180–330fr / 6–11s) ────────────────────────────
const scenePivotBullets = [
  { icon: "✓", text: "QuizMeBaby é grátis pra começar.", delay: 0 },
  { icon: "✓", text: "4 checkouts BR nativos.", delay: 20 },
  { icon: "✓", text: "Relatório automático por lead.", delay: 40 },
];

const ScenePivot: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        flexDirection: "column",
        gap: 32,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      {scenePivotBullets.map(({ icon, text, delay }) => (
        <BulletLine key={text} icon={icon} text={text} delay={delay} />
      ))}
    </AbsoluteFill>
  );
};

const BulletLine: React.FC<{ icon: string; text: string; delay: number }> = ({
  icon,
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
        gap: 20,
        opacity: anim.opacity,
        transform: `translateY(${anim.translateY}px)`,
      }}
    >
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.bold,
          fontSize: 44,
          color: colors.gold,
          lineHeight: 1,
          minWidth: 44,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.medium,
          fontSize: 34,
          color: colors.white,
          lineHeight: 1.35,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Scene 4: COMPARAÇÃO (330–450fr / 11–15s) ────────────────────────────────
const SceneComparison: React.FC = () => {
  const cardLeft = useScaleIn({ delay: 0 });
  const cardRight = useScaleIn({ delay: 12 });

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
      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.medium,
          fontSize: 28,
          color: colors.textMuted,
          marginBottom: 8,
        }}
      >
        Antes vs Agora
      </span>

      <div style={{ display: "flex", flexDirection: "row", gap: 24, width: "100%" }}>
        {/* Card esquerda: concorrente */}
        <div
          style={{
            flex: 1,
            background: colors.surfaceDark,
            borderRadius: 20,
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: cardLeft.opacity,
            transform: `scale(${cardLeft.scale})`,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: fontWeights.extrabold,
              fontSize: 52,
              color: colors.accent,
              textDecoration: "line-through",
              textDecorationColor: "rgba(244,63,94,0.6)",
            }}
          >
            R$97
          </span>
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: fontWeights.medium,
              fontSize: 22,
              color: colors.textMuted,
            }}
          >
            por mês
          </span>
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: fontWeights.regular,
              fontSize: 20,
              color: "rgba(255,255,255,0.4)",
              textAlign: "center",
            }}
          >
            outros builders
          </span>
        </div>

        {/* Card direita: QMB */}
        <div
          style={{
            flex: 1,
            background: `linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))`,
            borderRadius: 20,
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: cardRight.opacity,
            transform: `scale(${cardRight.scale})`,
            border: `2px solid ${colors.primary}`,
            boxShadow: `0 0 32px rgba(99,102,241,0.30)`,
          }}
        >
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: fontWeights.extrabold,
              fontSize: 52,
              color: colors.green,
            }}
          >
            GRÁTIS
          </span>
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: fontWeights.medium,
              fontSize: 22,
              color: colors.textMuted,
            }}
          >
            pra começar
          </span>
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: fontWeights.medium,
              fontSize: 20,
              color: colors.primary,
              textAlign: "center",
            }}
          >
            QuizMeBaby
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: PROVA SOCIAL (450–540fr / 15–18s) ──────────────────────────────
const SceneSocialProof: React.FC = () => {
  const count = useCounter(10000, { delay: 0, duration: 60 });
  const sub = useSlideUp({ delay: 45, duration: 18 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 20,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.extrabold,
          fontSize: 96,
          color: colors.gold,
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        {count.toLocaleString("pt-BR")}+
      </span>
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.bold,
          fontSize: 44,
          color: colors.white,
          textAlign: "center",
        }}
      >
        leads capturados
      </span>
      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.medium,
          fontSize: 28,
          color: colors.textMuted,
          opacity: sub.opacity,
          transform: `translateY(${sub.translateY}px)`,
          textAlign: "center",
        }}
      >
        por criadores BR com QuizMeBaby
      </span>
    </AbsoluteFill>
  );
};

// ─── Scene 6: CTA (540–600fr / 18–20s) ──────────────────────────────────────
const SceneCTA: React.FC = () => {
  const logo = useFadeIn({ delay: 0, duration: 20 });

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
      <div style={{ opacity: logo }}>
        <Logo size="sm" delay={0} />
      </div>
      <CTAButton
        primary="CRIAR MEU QUIZ GRÁTIS"
        secondary="TESTAR SEM CARTÃO"
        delay={8}
      />
    </AbsoluteFill>
  );
};

// ─── COMPOSITION ROOT ────────────────────────────────────────────────────────
export const HookA: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: colors.bgDark, width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}>
      <Background variant="glow" />

      {/* Scene 1: Hook — 0–60fr */}
      <Sequence from={0} durationInFrames={60}>
        <SceneHook />
      </Sequence>

      {/* Scene 2: Identificação — 60–180fr */}
      <Sequence from={60} durationInFrames={120}>
        <SceneIdentification />
      </Sequence>

      {/* Scene 3: Pivot / Revelação — 180–330fr */}
      <Sequence from={180} durationInFrames={150}>
        <ScenePivot />
      </Sequence>

      {/* Scene 4: Comparação — 330–450fr */}
      <Sequence from={330} durationInFrames={120}>
        <SceneComparison />
      </Sequence>

      {/* Scene 5: Prova social — 450–540fr */}
      <Sequence from={450} durationInFrames={90}>
        <SceneSocialProof />
      </Sequence>

      {/* Scene 6: CTA — 540–600fr */}
      <Sequence from={540} durationInFrames={60}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
