// DIAGNOSTIC ONLY: minimal R3F scene + EffectComposer (no effects) to test
// whether the postprocessing composer itself paints under SwiftShader.
import React from "react";
import { Composition, registerRoot } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { EffectComposer } from "@react-three/postprocessing";

const Scene: React.FC = () => (
  <ThreeCanvas width={1080} height={1920} gl={{ antialias: false }} camera={{ fov: 40, near: 0.2, far: 100, position: [0, 0, 5] }}>
    <color attach="background" args={["#ff0000"]} />
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#00ff00" />
    </mesh>
    <EffectComposer multisampling={0} frameBufferType={THREE.UnsignedByteType}>{null}</EffectComposer>
  </ThreeCanvas>
);

const Root: React.FC = () => (
  <Composition id="BushShoeShort" component={Scene} durationInFrames={2025} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
