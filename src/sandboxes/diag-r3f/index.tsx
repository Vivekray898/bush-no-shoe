// DIAGNOSTIC ONLY: minimal R3F scene (red background, green box) to test
// whether WebGL canvases paint at all in this environment.
import React from "react";
import { Composition, registerRoot } from "remotion";
import { ThreeCanvas } from "@remotion/three";

const Scene: React.FC = () => (
  <ThreeCanvas width={1080} height={1920} gl={{ antialias: false }} camera={{ fov: 40, near: 0.2, far: 100, position: [0, 0, 5] }}>
    <color attach="background" args={["#ff0000"]} />
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#00ff00" />
    </mesh>
  </ThreeCanvas>
);

const Root: React.FC = () => (
  <Composition id="BushShoeShort" component={Scene} durationInFrames={2025} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
