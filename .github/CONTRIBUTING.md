# Contribution Guidelines

## Getting Started
1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'feat: add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## Commit Message Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- \`feat:\` for new features (correlates with MINOR in Semantic Versioning)
- \`fix:\` for bug fixes (correlates with PATCH in Semantic Versioning)
- \`docs:\` for documentation changes
- \`chore:\` for maintenance tasks
- \`BREAKING CHANGE:\` for major version changes

## Branching Strategy
- \`main\` - Production-ready code
- \`develop\` - Integration branch for features
- \`feature/*\` - Feature branches

## Commit Signing Policy

All commits to this repository **MUST** be signed with GPG. This is enforced by branch protection rules.

### Setup Instructions

1. Configure Git to use your GPG key:
   git config --global user.signingkey 6B7335DF06B3B389B59507D8F070D6E920B809AF
   git config --global gpg.keyidformat 0xlong
   git config --global commit.gpgsign true
   git config --global gpg.program gpg

2. Configure GPG for server environments:
   echo "use-agent" >> ~/.gnupg/gpg.conf
   echo "pinentry-mode loopback" >> ~/.gnupg/gpg.conf
   echo "allow-loopback-pinentry" >> ~/.gnupg/gpg-agent.conf
   gpg-connect-agent killagent /bye
   sleep 2
   gpg-connect-agent /bye

3. Add your GPG key to GitHub:
   gpg --armor --export 6B7335DF06B3B389B59507D8F070D6E920B809AF

4. Verify your setup:
   git commit -S -m "test: verify signing setup"
   git log --show-signature -1
   You should see "Good signature" in the output.

All commits without valid signatures will be rejected by the branch protection rules.
