# Supabase Storage

- **Bucket `vmd-media`** (public-read): Payload Media — optimised images for the site.
- **Bucket `vmd-client-docs`** (PRIVATE): client uploads. Access only via signed URLs
  minted server-side after an RLS ownership check. Restrictions (Blueprint §17.4):
  allowed types pdf/jpg/png/docx; max size enforced; encryption at rest; virus/type scan
  on upload (wired in the portal module). ADR-0003 keeps it OneDrive- and AI-check-ready.
