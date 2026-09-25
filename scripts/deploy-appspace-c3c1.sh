#!/usr/bin/env bash
# Deploy c3_c1 (+ the shared ds/ design system it imports, + scheduling-page.html
# that it links to) to Appspace as a static site.
#
# Prerequisites (one-time, done via SSO in a browser — not scriptable):
#   1. Create a "static site" project at https://appspace.squarespace.net
#   2. Generate a deploy token on that project's Configuration tab
#   3. Save it to ~/.config/appspace-deploy-tokens/c3_c1 (chmod 600)
#
# Usage:
#   ./scripts/deploy-appspace-c3c1.sh <project-slug>

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:?Usage: deploy-appspace-c3c1.sh <project-slug>}"
TOKEN_FILE="$HOME/.config/appspace-deploy-tokens/c3_c1"

if [[ ! -f "$TOKEN_FILE" ]]; then
  echo "Missing deploy token at $TOKEN_FILE" >&2
  echo "Generate one from the project's Configuration tab at appspace.squarespace.net," >&2
  echo "then: mkdir -p ~/.config/appspace-deploy-tokens && chmod 600 the saved file." >&2
  exit 1
fi
TOKEN="$(<"$TOKEN_FILE")"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp -R "$ROOT/c3_c1" "$STAGE/c3_c1"
cp -R "$ROOT/ds" "$STAGE/ds"
cp "$ROOT/scheduling-page.html" "$STAGE/scheduling-page.html"

# Appspace requires index.html at the pushed root; c3_c1's own index.html stays
# nested so its "../ds/..." and "../scheduling-page.html" references keep resolving.
cat > "$STAGE/index.html" <<'HTML'
<!DOCTYPE html>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=c3_c1/">
<link rel="canonical" href="c3_c1/">
<title>Redirecting…</title>
<p>Redirecting to <a href="c3_c1/">c3_c1/</a>…</p>
HTML

git -C "$STAGE" init -q -b main
git -C "$STAGE" add -A
git -C "$STAGE" commit -q -m "Deploy c3_c1 to Appspace"
git -C "$STAGE" push -f "https://token:${TOKEN}@appspace.squarespace.net/git/${SLUG}.git" main

echo "Pushed. Check the project's Deployments tab at appspace.squarespace.net for the live URL."
