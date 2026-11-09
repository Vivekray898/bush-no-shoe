// DIAGNOSTIC ONLY: renders the bridge World in a plain ThreeCanvas with NO
// EffectComposer/postprocessing, to isolate whether the blank stills come
// from the post chain or from the world/camera itself.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Composition, continueRender, delayRender, registerRoot, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { World, loadKit } from "../../videos/bush-shoe/world";
import { Kit } from "../../videos/bush-shoe/build";
import { shotAt } from "../../videos/bush-shoe/story";

const Inner: React.FC<{ kit: Kit }> = ({ kit }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit), [kit]);
  const cam = camera as THREE.PerspectiveCamera;
  world.update(shotAt(f).id, f, cam, scene);
  return <primitive object={world.root} dispose={null} />;
};

const Scene: React.FC = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("diag-world kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  if (!kit) return null;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.2, far: 1500 }}>
        <Inner kit={kit} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <Composition id="BushShoeShort" component={Scene} durationInFrames={2025} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
