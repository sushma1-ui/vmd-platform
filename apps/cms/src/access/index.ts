/**
 * RBAC predicates for Payload (Plane A). Built on @vmd/auth roles so a role gate
 * is expressed one way. `published` gives the public read access to live content.
 *
 * Typed as Payload's `Access`, so `req.user` resolves to the generated `User`
 * (payload-types.ts registers the app's types on the `payload` module).
 */
import type { Access } from 'payload';
import { requireRole } from '@vmd/auth';

export const isAdmin: Access = ({ req }) => requireRole('admin')(req.user);
export const isEditorial: Access = ({ req }) => requireRole('admin', 'editor', 'agent')(req.user);
export const isAgent: Access = ({ req }) => requireRole('admin', 'agent')(req.user);

/** Public read, but only rows where status = 'published'. */
export const publishedOrEditorial: Access = ({ req }) => {
  if (requireRole('admin', 'editor', 'agent')(req.user)) return true;
  return { status: { equals: 'published' } };
};

/** Anyone may read; nobody but the server/editorial may write. */
export const anyone: Access = () => true;
