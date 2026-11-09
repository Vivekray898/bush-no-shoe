// DIAGNOSTIC ONLY (not part of the port): wraps BushShoeShort with a 90 s
// delayRender handle so the screenshot happens long after the WebGL canvas
// has had time to paint its first SwiftShader frames.
import React, { useEffect, useState } from "react";
import { Composition, continueRender, delayRender, registerRoot } from "remotion";
import { BushShoeShort, BUSH_SHOE_FRAMES } from "../../videos/bush-shoe/BushShoeShort";

const Wait: React.FC = () => {
  const [handle] = useState(() => delayRender("diag-wait-90s"));
  useEffect(() => {
    const t = setTimeout(() => continueRender(handle), 90000);
    return () => clearTimeout(t);
  }, [handle]);
  return <BushShoeShort />;
};

const Root: React.FC = () => (
  <Composition id="BushShoeShort" component={Wait} durationInFrames={BUSH_SHOE_FRAMES} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
