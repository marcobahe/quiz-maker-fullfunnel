import React from "react";
import { colors, fonts, fontWeights } from "../brand";
import { useScaleIn, usePulse } from "../animations";

interface CTAButtonProps {
  primary: string;
  secondary?: string;
  delay?: number;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  primary,
  secondary,
  delay = 0,
}) => {
  const { scale, opacity } = useScaleIn({ delay });
  const pulse = usePulse({ delay: delay + 15, period: 40 });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `scale(${scale * pulse})`,
      }}
    >
      <div
        style={{
          background: colors.accent,
          borderRadius: 16,
          paddingTop: 28,
          paddingBottom: 28,
          paddingLeft: 48,
          paddingRight: 48,
          boxShadow: `0 0 40px rgba(244,63,94,0.45)`,
        }}
      >
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: fontWeights.extrabold,
            fontSize: 36,
            color: colors.white,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {primary}
        </span>
      </div>

      {secondary && (
        <span
          style={{
            fontFamily: fonts.body,
            fontWeight: fontWeights.regular,
            fontSize: 24,
            color: colors.textMuted,
            letterSpacing: "0.02em",
          }}
        >
          {secondary}
        </span>
      )}
    </div>
  );
};
