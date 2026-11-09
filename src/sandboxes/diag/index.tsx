import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";

const Red: React.FC = () => (
  <AbsoluteFill style={{ background: "#ff0000", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontSize: 120, color: "white", fontFamily: "sans-serif" }}>DIAG</div>
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <Composition id="BushShoeShort" component={Red} durationInFrames={2025} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
