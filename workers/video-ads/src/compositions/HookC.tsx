/**
 * Hook C — Revelação + Teste (Gap de diferenciação)
 * "Um quiz que entrega relatório — diferente de qualquer builder BR"
 *
 * Duração: 22s = 660fr @ 30fps
 * Padrão: CURIOSIDADE + REVELAÇÃO + AUTORIDADE (Anderson V9 + diferenciação competitiva)
 * Gap validado: inLead não entrega relatório por lead; QuizMeBaby entrega
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
} from "../animations";

// ─── Scene 1: HOOK REVELAÇÃO (0–75fr / 0–2.5s) ───────────────────────────────
const SceneHook: React.FC = () => {
  const l1 = useFadeIn({ delay: 0, duration: 15 });
  const l2 = useBlurReveal({ delay: 12, duration: 30 });
  const l3 = useSlideUp({ delay: 40, duration: 18 });

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
          fontWeight: fontWeights.regular,
          fontSize: 32,
          color: colors.textMuted,
          opacity: l1,
          textAlign: "center",
        }}
      >
        Um quiz
      </span>

      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.extrabold,
          fontSize: 72,
          color: colors.primary,
          ...l2,
          lineHeight: 1.15,
          textAlign: "center",
        }}
      >
        que entrega relatório.
      </span>

      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.medium,
          fontSize: 28,
          color: colors.gold,
          opacity: l3.opacity,
          transform: `translateY(${l3.translateY}px)`,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        Diferente de qualquer builder BR.
      </span>
    </AbsoluteFill>
  );
};

// ─── Scene 2: O QUE É O RELATÓRIO (75–225fr / 2.5–7.5s) ─────────────────────
const reportLines = [
  { text: "Cada lead recebe seu resultado personalizado.", color: colors.white, delay: 0 },
  { text: "Automaticamente.", color: colors.gold, delay: 22 },
  { text: "Sem configurar nada.", color: colors.textMuted, delay: 44 },
];

const SceneReport: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 28,
        paddingLeft: 72,
        paddingRight: 72,
      }}
    >
      {reportLines.map(({ text, color, delay }) => (
        <ReportLine key={text} text={text} color={color} delay={delay} />
      ))}
    </AbsoluteFill>
  );
};

const ReportLine: React.FC<{ text: string; color: string; delay: number }> = ({
  text,
  color,
  delay,
}) => {
  const anim = useSlideUp({ delay, duration: 18 });
  const isHighlight = color === colors.gold;
  return (
    <span
      style={{
        fontFamily: isHighlight ? fonts.display : fonts.body,
        fontWeight: isHighlight ? fontWeights.extrabold : fontWeights.medium,
        fontSize: isHighlight ? 56 : 34,
        color,
        opacity: anim.opacity,
        transform: `translateY(${anim.translateY}px)`,
        textAlign: "center",
        lineHeight: 1.35,
      }}
    >
      {text}
    </span>
  );
};

// ─── Scene 3: COMPARAÇÃO CONCORRÊNCIA (225–375fr / 7.5–12.5s) ────────────────
const SceneComparison: React.FC = () => {
  const cardLeft = useScaleIn({ delay: 0 });
  const cardRight = useScaleIn({ delay: 15 });
  const label = useSlideUp({ delay: 0, duration: 18 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 28,
        paddingLeft: 48,
        paddingRight: 48,
      }}
    >
      <span
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.medium,
          fontSize: 28,
          color: colors.textMuted,
          opacity: label.opacity,
          transform: `translateY(${label.translateY}px)`,
          textAlign: "center",
        }}
      >
        O que outros builders fazem vs QMB
      </span>

      {/* Card outros */}
      <div
        style={{
          background: colors.surfaceDark,
          borderRadius: 20,
          padding: "36px 40px",
          width: "100%",
          opacity: cardLeft.opacity,
          transform: `scale(${cardLeft.scale})`,
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: fontWeights.regular,
            fontSize: 20,
            color: colors.textMuted,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          OUTROS BUILDERS
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: fontWeights.medium,
            fontSize: 30,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.4,
          }}
        >
          Lead responde → entra no sheet. Pronto.
        </div>
      </div>

      {/* Card QMB */}
      <div
        style={{
          background: `linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.12))`,
          borderRadius: 20,
          padding: "36px 40px",
          width: "100%",
          opacity: cardRight.opacity,
          transform: `scale(${cardRight.scale})`,
          border: `2px solid ${colors.primary}`,
          boxShadow: `0 0 36px rgba(99,102,241,0.28)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: fontWeights.semibold,
            fontSize: 20,
            color: colors.primary,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          QUIZMEBABY
        </div>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: fontWeights.bold,
            fontSize: 30,
            color: colors.white,
            lineHeight: 1.4,
          }}
        >
          Lead responde → relatório personalizado + funil automático.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: PROVA DO RELATÓRIO (375–525fr / 12.5–17.5s) ────────────────────
const SceneReportMockup: React.FC = () => {
  const container = useFadeIn({ delay: 0, duration: 25 });
  const badge = useScaleIn({ delay: 30 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        paddingLeft: 48,
        paddingRight: 48,
      }}
    >
      {/* Mock relatório */}
      <div
        style={{
          opacity: container,
          background: colors.surfaceDark,
          borderRadius: 24,
          padding: "40px 36px",
          width: "100%",
          border: `1px solid rgba(99,102,241,0.30)`,
          boxShadow: `0 0 40px rgba(99,102,241,0.12)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: fontWeights.medium,
            fontSize: 18,
            color: colors.textMuted,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          RELATÓRIO DO LEAD
        </div>

        {/* Score */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: fontWeights.extrabold,
              fontSize: 72,
              color: colors.green,
              lineHeight: 1,
            }}
          >
            78
          </div>
          <div>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: fontWeights.bold,
                fontSize: 28,
                color: colors.white,
              }}
            >
              Perfil: Avançado
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontWeight: fontWeights.regular,
                fontSize: 22,
                color: colors.textMuted,
                marginTop: 4,
              }}
            >
              Pronto para mentoria
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          {["Tráfego pago", "Meta Ads", "Infoprodutor"].map((tag) => (
            <span
              key={tag}
              style={{
                background: `rgba(99,102,241,0.2)`,
                border: `1px solid rgba(99,102,241,0.4)`,
                borderRadius: 8,
                padding: "6px 14px",
                fontFamily: fonts.body,
                fontWeight: fontWeights.medium,
                fontSize: 20,
                color: colors.primary,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Recommendation */}
        <div
          style={{
            background: `rgba(16,185,129,0.12)`,
            border: `1px solid rgba(16,185,129,0.3)`,
            borderRadius: 12,
            padding: "14px 18px",
            fontFamily: fonts.body,
            fontWeight: fontWeights.medium,
            fontSize: 22,
            color: colors.green,
            lineHeight: 1.4,
          }}
        >
          ✓ Recomendar: Mentoria Avançada de Tráfego
        </div>
      </div>

      {/* Badge */}
      <div
        style={{
          opacity: badge.opacity,
          transform: `scale(${badge.scale})`,
          fontFamily: fonts.body,
          fontWeight: fontWeights.medium,
          fontSize: 26,
          color: colors.textMuted,
          textAlign: "center",
        }}
      >
        Gerado automaticamente — sem configuração manual.
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: AUTORIDADE / BENCHMARK (525–615fr / 17.5–20.5s) ────────────────
const authorityLines = [
  { text: "inLead não faz isso.", color: "rgba(255,255,255,0.50)", delay: 0 },
  { text: "Magoquiz não faz.", color: "rgba(255,255,255,0.50)", delay: 18 },
  { text: "QuizMeBaby faz.", color: colors.white, delay: 36, large: true },
];

const SceneAuthority: React.FC = () => {
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
      {authorityLines.map(({ text, color, delay, large }) => (
        <AuthorityLine
          key={text}
          text={text}
          color={color}
          delay={delay}
          large={!!large}
        />
      ))}
    </AbsoluteFill>
  );
};

const AuthorityLine: React.FC<{
  text: string;
  color: string;
  delay: number;
  large: boolean;
}> = ({ text, color, delay, large }) => {
  const anim = useSlideUp({ delay, duration: 16 });
  return (
    <span
      style={{
        fontFamily: large ? fonts.display : fonts.body,
        fontWeight: large ? fontWeights.extrabold : fontWeights.medium,
        fontSize: large ? 64 : 40,
        color,
        opacity: anim.opacity,
        transform: `translateY(${anim.translateY}px)`,
        textAlign: "center",
        lineHeight: 1.2,
        ...(large && {
          borderBottom: `3px solid ${colors.primary}`,
          paddingBottom: 4,
        }),
      }}
    >
      {text}
    </span>
  );
};

// ─── Scene 6: CTA (615–660fr / 20.5–22s) ────────────────────────────────────
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
      <CTAButton
        primary="TESTAR SEM CARTÃO"
        secondary="Ver como funciona →"
        delay={8}
      />
    </AbsoluteFill>
  );
};

// ─── COMPOSITION ROOT ────────────────────────────────────────────────────────
export const HookC: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: colors.bgDark, width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}>
      <Background variant="glow" />

      {/* Scene 1: Hook revelação — 0–75fr */}
      <Sequence from={0} durationInFrames={75}>
        <SceneHook />
      </Sequence>

      {/* Scene 2: O que é o relatório — 75–225fr */}
      <Sequence from={75} durationInFrames={150}>
        <SceneReport />
      </Sequence>

      {/* Scene 3: Comparação — 225–375fr */}
      <Sequence from={225} durationInFrames={150}>
        <SceneComparison />
      </Sequence>

      {/* Scene 4: Prova do relatório (mockup) — 375–525fr */}
      <Sequence from={375} durationInFrames={150}>
        <SceneReportMockup />
      </Sequence>

      {/* Scene 5: Autoridade / Benchmark — 525–615fr */}
      <Sequence from={525} durationInFrames={90}>
        <SceneAuthority />
      </Sequence>

      {/* Scene 6: CTA — 615–660fr */}
      <Sequence from={615} durationInFrames={45}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
