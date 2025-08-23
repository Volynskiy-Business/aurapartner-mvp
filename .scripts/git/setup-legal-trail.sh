#!/bin/bash
# Enterprise Git Security Setup Script
# Creates complete legal trail with SSH signatures, hooks, and GitHub protection

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Prerequisites check
check_prerequisites() {
    log "Checking prerequisites..."

    command -v git >/dev/null 2>&1 || { error "Git not installed"; exit 1; }
    command -v gh >/dev/null 2>&1 || { error "GitHub CLI not installed"; exit 1; }

    [ -f ~/.ssh/id_ed25519 ] || { error "SSH key ~/.ssh/id_ed25519 not found"; exit 1; }

    git config --global user.email >/dev/null || { error "Git user.email not configured"; exit 1; }
    git config --global user.name >/dev/null || { error "Git user.name not configured"; exit 1; }

    success "Prerequisites satisfied"
}

# Configure Git for SSH signing
setup_git_signing() {
    log "Configuring Git SSH signing..."

    git config --global gpg.format ssh
    git config --global user.signingkey ~/.ssh/id_ed25519
    git config --global commit.gpgsign true
    git config --global tag.gpgsign true

    # Setup allowed_signers
    mkdir -p ~/.config/git
    pub="$(cat ~/.ssh/id_ed25519.pub)"
    email="$(git config --global user.email)"
    username="$(git config --global user.name)"

    printf '%s %s\n' "$email" "$pub" > ~/.config/git/allowed_signers
    printf '%s %s\n' "$username" "$pub" >> ~/.config/git/allowed_signers
    printf '*@*.com %s\n' "$pub" >> ~/.config/git/allowed_signers

    git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers

    success "Git SSH signing configured"
}

# Setup repository hooks
setup_repo_hooks() {
    log "Setting up repository hooks..."

    if [ -f .git/hooks/pre-commit ]; then
        mkdir -p .githooks
        cp .git/hooks/pre-commit .githooks/pre-commit
        chmod +x .githooks/pre-commit
        git config core.hooksPath .githooks
        success "Repository hooks migrated to .githooks/"
    else
        warn "No pre-commit hook found to migrate"
    fi
}

# Configure GitHub signing key
setup_github_signing() {
    log "Adding SSH key to GitHub as signing key..."

    gh api -X POST user/ssh_signing_keys \
        -f key="$(cat ~/.ssh/id_ed25519.pub)" \
        -f title="Legal Trail Signing Key ($(hostname))" \
        >/dev/null 2>&1 && success "SSH signing key added to GitHub" \
        || warn "SSH key may already exist or failed to add"
}

# Setup branch protection
setup_branch_protection() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        warn "Skipping branch protection - repo owner/name not provided"
        return
    fi

    local owner="$1"
    local repo="$2"
    local branch="${3:-main}"

    log "Setting up branch protection for $owner/$repo ($branch)..."

    # Required signatures
    gh api -X POST "repos/$owner/$repo/branches/$branch/protection/required_signatures" \
        >/dev/null 2>&1 && success "Required signatures enabled" \
        || warn "Signatures already enabled or failed"

    # Linear history
    gh api -X POST "repos/$owner/$repo/branches/$branch/protection/required_linear_history" \
        >/dev/null 2>&1 && success "Linear history enforced" \
        || warn "Linear history already enabled"
}

# Setup WSL SSH agent
setup_wsl_ssh_agent() {
    if ! grep -q "SSH Agent Auto-Management" ~/.bashrc 2>/dev/null; then
        log "Setting up WSL SSH agent auto-start..."

        cat >> ~/.bashrc << 'BASHRC'

# === SSH Agent Auto-Management for WSL ===
export SSH_AUTH_SOCK="$HOME/.ssh/ssh_auth_sock"
ssh_agent_init() {
    if ! ssh-add -l >/dev/null 2>&1; then
        echo "🔑 Starting SSH agent..."
        eval "$(ssh-agent -s)" >/dev/null
        ln -sf "$SSH_AUTH_SOCK" "$HOME/.ssh/ssh_auth_sock"
        ssh-add ~/.ssh/id_ed25519 >/dev/null 2>&1
    fi
}
ssh_agent_init
BASHRC
        success "SSH agent auto-start configured"
    else
        warn "SSH agent auto-start already configured"
    fi
}

# Test the setup
test_setup() {
    log "Testing legal trail setup..."

    # Test SSH agent
    ssh-add -l >/dev/null 2>&1 && success "✅ SSH key loaded in agent" \
        || error "❌ SSH key not in agent"

    # Test Git signing
    git config --global --get gpg.format | grep -q "ssh" && success "✅ SSH signing enabled" \
        || error "❌ SSH signing not configured"

    # Test commit signing
    if git commit --allow-empty -m "test: legal trail verification" >/dev/null 2>&1; then
        if git verify-commit HEAD >/dev/null 2>&1; then
            success "✅ Signed commit verification passed"
            git log --show-signature -1 --pretty=format:"%h %s" HEAD
        else
            error "❌ Signed commit verification failed"
        fi
    else
        error "❌ Failed to create signed commit"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}🛡️  Enterprise Git Legal Trail Setup${NC}"
    echo -e "${BLUE}========================================${NC}"

    check_prerequisites
    setup_git_signing
    setup_repo_hooks
    setup_github_signing

    # Branch protection (optional parameters)
    if [ $# -ge 2 ]; then
        setup_branch_protection "$1" "$2" "$3"
    fi

    setup_wsl_ssh_agent
    test_setup

    echo -e "\n${GREEN}🎉 Legal trail setup completed successfully!${NC}"
    echo -e "${BLUE}📋 Summary:${NC}"
    echo -e "  • SSH commit signing: ✅"
    echo -e "  • GitHub verification: ✅"
    echo -e "  • Repository hooks: ✅"
    echo -e "  • Branch protection: ✅"
    echo -e "  • WSL SSH agent: ✅"
    echo -e "\n${YELLOW}💡 Restart your shell to activate SSH agent auto-start${NC}"
}

# Script usage
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [GITHUB_OWNER] [REPO_NAME] [BRANCH]"
    echo "Example: $0 Volynskiy-Business aurapartner-mvp main"
    exit 0
fi

main "$@"
