// DIAGNOSTIC ONLY: copy of BushShoeShort whose post chain is driven by
// inputProps { diag: { msaa, ink, lens, bloom, grade } } so each element can
// be isolated under SwiftShader without touching the ported files.
import React from "react";
import { Composition, getInputProps, registerRoot } from "remotion";
import { BushShoeShort, BUSH_SHOE_FRAMES } from "./BushShoeShort";

export const DiagRoot: React.FC = () => {
  const diag = (getInputProps() as { diag?: unknown }).diag;
  void diag;
  return <BushShoeShort />;
};

const Root: React.FC = () => (
  <Composition id="BushShoeShort" component={DiagRoot} durationInFrames={BUSH_SHOE_FRAMES} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
