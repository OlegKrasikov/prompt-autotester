# Security Policy

## Supported Versions
Active development happens on `main`. Please base reports on the latest commit.

## Reporting a Vulnerability
Please do not open public issues for security concerns.

Instead, use GitHub Security Advisories to submit a private report to maintainers:
- Go to the repository’s "Security" tab → "Advisories" → "Report a vulnerability".
- Provide a clear description, reproduction steps, and impact.
- Include environment details and suggested fixes if known.

We will acknowledge receipt within 5 business days and work with you on remediation and coordinated disclosure.

## Handling Secrets
- Never commit real secrets. `.env` files are ignored by Git.
- Use `.env.example` to document required variables without values.
- API keys are encrypted at rest using AES‑256‑CBC; see `src/server/utils/crypto.ts`.

### Generating ENCRYPTION_KEY
We derive a 32‑byte key from the `ENCRYPTION_KEY` secret using scrypt. Any high‑entropy value works; prefer ≥32 random bytes.

Examples
- macOS/Linux (hex): `openssl rand -hex 32`
- macOS/Linux (base64): `openssl rand -base64 32`
- Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Python: `python - <<'PY'\nimport secrets; print(secrets.token_hex(32))\nPY`
- Windows PowerShell: `powershell -Command "[Convert]::ToBase64String((New-Object byte[] 32 | %{(Get-Random -Max 256)}))"`

Add to `.env` as:

```
ENCRYPTION_KEY="<paste_generated_value>"
```
