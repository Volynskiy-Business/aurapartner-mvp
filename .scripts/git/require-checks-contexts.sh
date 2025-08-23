# .scripts/git/require-checks-contexts.sh
#!/usr/bin/env bash
set -euo pipefail

WF="${1:-CI}"  # имя workflow; по умолчанию 'CI'

OWNER="$(gh repo view --json owner --jq .owner.login)"
REPO="$(gh repo view --json name  --jq .name)"
BR="$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)"

echo "Repo: $OWNER/$REPO  Branch: $BR  Workflow: $WF"
echo "⏳ Waiting for successful '$WF' run on $BR …"

# 1) Ждём УСПЕШНЫЙ run ИМЕННО нужного workflow (исключаем Dependabot)
while :; do
  RUN_ID="$(gh run list --repo "$OWNER/$REPO" \
             --branch "$BR" --workflow "$WF" --status success --limit 1 \
             --json databaseId --jq '.[0].databaseId' 2>/dev/null || true)"
  [[ -n "${RUN_ID:-}" && "$RUN_ID" != "null" ]] && break
  sleep 10
done

# 2) Имя workflow (на случай, если в UI оно отличается регистром) и имена jobs
WF_NAME="$(gh run view "$RUN_ID" --repo "$OWNER/$REPO" --json name --jq .name)"
mapfile -t JOBS < <(gh run view "$RUN_ID" --repo "$OWNER/$REPO" --json jobs --jq '.jobs[].name')

if [[ ${#JOBS[@]} -eq 0 ]]; then
  echo "❌ В run $RUN_ID нет jobs — проверь workflow '$WF'." >&2
  exit 1
fi

# 3) contexts: "<WorkflowName> / <JobName>"
contexts_json="$(printf '%s\n' "${JOBS[@]}" \
  | jq -R --arg wf "$WF_NAME" '[inputs | select(length>0) | "\($wf) / " + .]')"

echo "Contexts to require:"; echo "$contexts_json" | jq -r '.[]' | sed 's/^/  - /'

# 4) Полный PUT /protection (ТОЛЬКО contexts, БЕЗ checks)
cat > /tmp/protection.json <<EOF
{
  "required_status_checks": { "strict": true, "contexts": $contexts_json },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF

gh api -X PUT "repos/$OWNER/$REPO/branches/$BR/protection" \
  -H "Accept: application/vnd.github+json" \
  --input /tmp/protection.json

# 5) Проверка
gh api "repos/$OWNER/$REPO/branches/$BR/protection" --jq '.required_status_checks'
