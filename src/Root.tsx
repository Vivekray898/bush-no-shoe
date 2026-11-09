import React from "react";
import { Composition } from "remotion";
import { BushShoeShort, BUSH_SHOE_FRAMES } from "./videos/bush-shoe/BushShoeShort";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BushShoeShort"
        component={BushShoeShort}
        durationInFrames={BUSH_SHOE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
