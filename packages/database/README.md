# @vmd/database

Supabase clients with a hard `.server` split. Root export = public (anon) client
only. Service-role client is server-only. RLS policies live in `/supabase/policies`
(one file per table). Supabase region: Sydney (AU data residency, Blueprint §17).
