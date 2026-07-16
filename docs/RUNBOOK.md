# RUNBOOK — incident response

The security posture *is* the brand (Blueprint §17.4). This is the on-call reference.

## Severity
- **SEV-1** — client data exposure, site defacement/injection, auth bypass.
- **SEV-2** — booking or form intake broken; CMS down; email not sending.
- **SEV-3** — degraded performance; non-critical page errors.

## First 15 minutes (SEV-1)
1. Confirm & contain: if injection/defacement, take the affected surface to a
   maintenance page; rotate `PAYLOAD_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`.
2. Preserve evidence: capture logs before redeploying.
3. Notify the principal (Sunil). If personal information may be involved, begin the
   Privacy Act / Notifiable Data Breaches assessment — do not wait.

## Common procedures
- **Restore from backup:** daily off-site backup; restores are tested (not assumed).
- **Rotate secrets:** update in Vercel + Supabase, redeploy, invalidate sessions.
- **Roll back:** Vercel instant rollback to the last green deploy.
- **Service-role leak alarm:** `pnpm run check:secrets` failed → block release, find
  the offending import, move it behind the `.server` boundary.

## Contacts & registers
- OMARA (regulator): https://www.mara.gov.au/
- Supabase / Vercel / Postmark status dashboards (link in team wiki).
