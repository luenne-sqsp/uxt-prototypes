#!/usr/bin/env bash
# Deploy c3_c1 and/or c3_c2 to Vercel from the repo root.
#
# Prerequisites:
#   vercel login   (once — authenticates to the acuity-uxt team)
#
# Usage:
#   ./scripts/deploy-prototypes.sh          # deploy both
#   ./scripts/deploy-prototypes.sh c3_c1    # deploy one
#   ./scripts/deploy-prototypes.sh c3_c2

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SCOPE="acuity-uxt"

if command -v vercel >/dev/null 2>&1; then
  VERCEL=(vercel)
elif [[ -x "$ROOT/.tools/node/bin/npx" ]]; then
  VERCEL=("$ROOT/.tools/node/bin/npx" --yes vercel)
else
  VERCEL=(npx --yes vercel)
fi

deploy_one() {
  local key="$1"
  local project
  case "$key" in
    c3_c1)  project="uxt-c3-c" ;;
    c3_c2) project="uxt-c3-c0" ;;
    *) echo "Unknown prototype: $key (expected c3_c1 or c3_c2)" >&2; exit 1 ;;
  esac

  echo "==> Deploying $key ($project)"
  "${VERCEL[@]}" deploy --prod \
    --yes \
    --scope "$SCOPE" \
    --project "$project" \
    --local-config "$key/vercel.json"
}

targets=("${@:-c3_c1 c3_c2}")
for key in "${targets[@]}"; do
  deploy_one "$key"
done

echo ""
echo "Production URLs:"
echo "  c3_c1: https://uxt-c3-c.vercel.app"
echo "  c3_c2: https://uxt-c3-c0.vercel.app"
