/**
 * @vmd/auth — public API. Two audiences, one package:
 *   - Admin: Payload access-control predicates (role gates) for collections.
 *   - Client: Supabase session helpers for apps/web/src/pages/client (SSR, noindex).
 * Concrete predicates land with the Admin + Portal modules; roles fixed here.
 */
export const ROLES = ['admin', 'editor', 'agent', 'client'] as const;
export type Role = (typeof ROLES)[number];

export interface Principal {
  id: string;
  role: Role;
  email: string;
}

/** Reusable predicate factory — used by Payload access fns (Module 8). */
export function requireRole(...allowed: Role[]) {
  return (principal: Principal | null): boolean => !!principal && allowed.includes(principal.role);
}
