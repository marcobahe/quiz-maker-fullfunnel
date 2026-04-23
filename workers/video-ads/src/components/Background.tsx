import React from "react";
import { colors, gradients, VIDEO_WIDTH, VIDEO_HEIGHT } from "../brand";

interface BackgroundProps {
  variant?: "dark" | "gradient" | "glow";
}

export const Background: React.FC<BackgroundProps> = ({ variant = "dark" }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        background: variant === "gradient"
          ? gradients.hero
          : colors.bgDark,
        overflow: "hidden",
      }}
    >
      {/* Subtle glow blob */}
      {(variant === "glow" || variant === "dark") && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, rgba(99,102,241,0.22) 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />
      )}
    </div>
  );
};
