#!/usr/bin/env bash
# Cloudflare Pages / static deploy: run this as the build command.
# Builds the client to dist/public and exits (do NOT use "npm run dev").
set -e
npm run build
