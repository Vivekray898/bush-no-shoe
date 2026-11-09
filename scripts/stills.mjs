// usage: node scripts/stills.mjs <outPrefix> <frame,frame,...> [scale]  (bundles once, GPU via ANGLE, jpeg)
// Adapted for Linux from ~/workspace/custom-skills/claude-animated-shorts/templates/scripts/bridge-stills.mjs
// (template hardcodes a Windows Chrome path; this copy uses the Remotion-managed headless shell).
// BUSH_SHOE_ENTRY=src/sandboxes/<name>/index.tsx renders a sandbox copy instead of the main project entry.
import fs from "node:fs";
// each bundle copies public/ into the temp dir: keep bundles on the big home drive, never /tmp (512 MB tmpfs)
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [prefix, frames, scale = "0.5"] = process.argv.slice(2);
const browserExecutable = process.env.BUSH_SHOE_BROWSER || "/home/hatch/workspace/bush-shoe-short/remotion/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell";
const chromeMode = process.env.BUSH_SHOE_CHROME_MODE || "headless-shell";
const chromiumOptions = { gl: process.env.BUSH_SHOE_GL || "swangle" }; // no GPU on this VM: SwiftShader-on-ANGLE (Remotion docs: use swangle on GPU-less machines)
fs.mkdirSync(path.dirname(path.resolve(prefix)), { recursive: true });
const postOff = process.env.BUSH_SHOE_POST_OFF === "1";
const inputProps = postOff ? { post: { ink: false, lens: false, pre: false, bloom: false, grade: false, grain: false } } : {};
if (process.env.BUSH_SHOE_DIAG_MSAA !== undefined) inputProps.diag = { msaa: Number(process.env.BUSH_SHOE_DIAG_MSAA) };
if (process.env.BUSH_SHOE_DIAG_NO_TONE === "1") inputProps.diag = { ...(inputProps.diag ?? {}), noTone: true };
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.BUSH_SHOE_ENTRY || process.env.BRIDGE_ENTRY || "src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "BushShoeShort", browserExecutable, chromiumOptions, inputProps, chromeMode });
const onBrowserLog = (l) => { if (l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 300)); };
for (const f of frames.split(",").map(Number)) {
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale),
    browserExecutable, chromiumOptions, chromeMode, timeoutInMilliseconds: 600000, delayRenderTimeoutInMilliseconds: 300000, onBrowserLog, inputProps });
  console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}
