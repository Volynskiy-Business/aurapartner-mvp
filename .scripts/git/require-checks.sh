#!/usr/bin/env bash
set -euo pipefail
OWNER="$(gh repo view --json owner --jq .owner.login)"
REPO="$(gh repo view --json name  --jq .name)"
BR="$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)"

git fetch origin "$BR" >/dev/null
SHA="$(git rev-parse "origin/$BR")"

get_checks () {
  local sha="$1"
  gh api "repos/$OWNER/$REPO/commits/$sha/check-runs" \
    -H "Accept: application/vnd.github+json" \
    --jq '[.check_runs[]
            | select(.app.slug=="github-actions")
            | select((.name | test("Dependabot"; "i")) | not)
            | {context: .name, app_id: .app.id}]'
}

CHECKS_JSON="$(get_checks "$SHA")"
if [[ "$CHECKS_JSON" == "[]" ]]; then
  # fallback: последний PR-run workflow "CI"
  RUN_ID="$(gh run list --repo "$OWNER/$REPO" --event pull_request --limit 20 \
             --json databaseId,name --jq '[.[] | select(.name=="CI")][0].databaseId' 2>/dev/null || true)"
  if [[ -n "${RUN_ID:-}" && "$RUN_ID" != "null" ]]; then
    PR_SHA="$(gh run view "$RUN_ID" --repo "$OWNER/$REPO" --json headSha --jq .headSha)"
    CHECKS_JSON="$(get_checks "$PR_SHA")"
  fi
fi

if [[ "$CHECKS_JSON" == "[]" ]]; then
  echo "❌ No GitHub Actions check-runs yet. Let CI finish on main or PR, then re-run."
  exit 1
fi

echo "Detected checks:"; echo "$CHECKS_JSON" | jq -r '.[].context' | sed 's/^/  - /'

cat > /tmp/protect.json <<JSON
{
  "required_status_checks": {
    "strict": true,
    "checks": $CHECKS_JSON,
    "contexts": []
  },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 1 },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

gh api -X PUT "repos/$OWNER/$REPO/branches/$BR/protection" \
  -H "Accept: application/vnd.github+json" \
  --input /tmp/protect.json

gh api "repos/$OWNER/$REPO/branches/$BR/protection" --jq '.required_status_checks'
