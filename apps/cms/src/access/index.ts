/**
 * RBAC predicates for Payload (Plane A). Built on @vmd/auth roles so a role gate
 * is expressed one way. `published` gives the public read access to live content.
 */
import { requireRole, type Principal } from '@vmd/auth';

type Ctx = { req: { user: Principal | null } };

export const isAdmin = ({ req }: Ctx) => requireRole('admin')(req.user);
export const isEditorial = ({ req }: Ctx) => requireRole('admin', 'editor', 'agent')(req.user);
export const isAgent = ({ req }: Ctx) => requireRole('admin', 'agent')(req.user);

/** Public read, but only rows where status = 'published'. */
export const publishedOrEditorial = ({ req }: Ctx) => {
  if (requireRole('admin', 'editor', 'agent')(req.user)) return true;
  return { status: { equals: 'published' } };
};

/** Anyone may read; nobody but the server/editorial may write. */
export const anyone = () => true;
