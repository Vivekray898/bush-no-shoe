#!/bin/sh
# Wrapper: adds --enable-unsafe-swiftshader (Chrome 158 requires it to opt in
# to software WebGL) around the Remotion-managed headless shell.
exec /home/hatch/workspace/bush-shoe-short/remotion/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell --enable-unsafe-swiftshader "$@"
