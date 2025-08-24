#!/bin/bash
# AuraPartner MVP Security Maintenance Script

echo "🔧 AuraPartner MVP Security Maintenance"
echo "====================================="

# Update pre-commit hooks
if command -v pre-commit >/dev/null 2>&1; then
    echo "Updating pre-commit hooks..."
    pre-commit autoupdate
    pre-commit run --all-files || echo "Pre-commit found issues to fix"
fi

# Check commit signatures
echo "Recent commit signatures:"
git log --show-signature -5 --oneline 2>/dev/null || echo "No signed commits found"

# Check SSH agent
echo "SSH agent status:"
ssh-add -l 2>/dev/null || echo "SSH agent not running or no keys loaded"

# Check GitHub auth
echo "GitHub CLI status:"
gh auth status 2>/dev/null || echo "GitHub CLI not authenticated"

echo "✅ Maintenance check completed"
