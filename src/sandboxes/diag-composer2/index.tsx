// DIAGNOSTIC ONLY: minimal R3F scene + EffectComposer, plus a second manual
// advance() 1 s after mount (held by a delayRender handle). Tests whether the
// blank comes from Remotion advancing only once, before the composer exists.
import React, { useEffect, useState } from "react";
import { Composition, continueRender, delayRender, registerRoot } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { EffectComposer } from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";

const ReAdvance: React.FC = () => {
  const { advance } = useThree();
  const [handle] = useState(() => delayRender("diag re-advance"));
  useEffect(() => {
    const t = setTimeout(() => { advance(performance.now() + 100); continueRender(handle); }, 1000);
    return () => clearTimeout(t);
  }, [advance, handle]);
  return null;
};

const Scene: React.FC = () => (
  <ThreeCanvas width={1080} height={1920} gl={{ antialias: false }} camera={{ fov: 40, near: 0.2, far: 100, position: [0, 0, 5] }}>
    <color attach="background" args={["#ff0000"]} />
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#00ff00" />
    </mesh>
    <EffectComposer multisampling={0}>{null}</EffectComposer>
    <ReAdvance />
  </ThreeCanvas>
);

const Root: React.FC = () => (
  <Composition id="BushShoeShort" component={Scene} durationInFrames={2025} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
