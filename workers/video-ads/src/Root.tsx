import React from "react";
import { Composition } from "remotion";
import { HookA } from "./compositions/HookA";
import { HookB } from "./compositions/HookB";
import { HookC } from "./compositions/HookC";
import { VIDEO_WIDTH, VIDEO_HEIGHT, FPS } from "./brand";
// Font loading must happen at module level — imported here so all compositions
// share the same loaded instances (Outfit, Spline Sans, Inter via @remotion/google-fonts)
import "./loadFonts";

export const Root: React.FC = () => {
  return (
    <>
      {/* Hook A — Pergunta direta de dor: "Você ainda paga R$97/mês em quiz builder?" */}
      <Composition
        id="HookA"
        component={HookA}
        durationInFrames={600}  // 20s @ 30fps
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />

      {/* Hook B — Desafio + prazo: "Crie seu quiz em 10 min. Desafio." */}
      <Composition
        id="HookB"
        component={HookB}
        durationInFrames={540}  // 18s @ 30fps
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />

      {/* Hook C — Revelação + diferenciação: "Um quiz que entrega relatório" */}
      <Composition
        id="HookC"
        component={HookC}
        durationInFrames={660}  // 22s @ 30fps
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
