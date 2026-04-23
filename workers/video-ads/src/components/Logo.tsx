import React from "react";
import { colors, fonts, fontWeights } from "../brand";
import { useFadeIn } from "../animations";

interface LogoProps {
  delay?: number;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { fontSize: 32, taglineSize: 16 },
  md: { fontSize: 48, taglineSize: 20 },
  lg: { fontSize: 64, taglineSize: 24 },
};

export const Logo: React.FC<LogoProps> = ({ delay = 0, size = "md" }) => {
  const opacity = useFadeIn({ delay, duration: 20 });
  const { fontSize, taglineSize } = sizes[size];

  return (
    <div style={{ opacity, textAlign: "center" }}>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: fontWeights.extrabold,
          fontSize,
          letterSpacing: "-0.5px",
          lineHeight: 1,
        }}
      >
        <span style={{ color: colors.white }}>Quiz</span>
        <span style={{ color: colors.primary }}>Me</span>
        <span style={{ color: colors.white }}>Baby</span>
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: fontWeights.regular,
          fontSize: taglineSize,
          color: colors.textMuted,
          marginTop: 8,
          letterSpacing: "0.02em",
        }}
      >
        Parece brincadeira. Converte pra valer.
      </div>
    </div>
  );
};
