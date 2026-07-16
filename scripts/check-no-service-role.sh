#!/usr/bin/env bash
# CI gate: the Supabase service-role key must never appear in a built CLIENT bundle.
# Scans app build outputs; fails (exit 1) on any match. (ARCHITECTURE.md §4.3)
set -euo pipefail
PATTERN='SUPABASE_SERVICE_ROLE_KEY|service_role'
TARGETS=(apps/web/dist apps/web/.vercel apps/cms/.next/static)
found=0
for dir in "${TARGETS[@]}"; do
  if [ -d "$dir" ]; then
    if grep -rIlE "$PATTERN" "$dir" 2>/dev/null; then
      echo "✖ service-role reference found in client bundle: $dir" >&2
      found=1
    fi
  fi
done
if [ "$found" -ne 0 ]; then exit 1; fi
echo "✔ No service-role key in client bundles."
