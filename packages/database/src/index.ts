/**
 * @vmd/database — public API. Only the PUBLIC client is exported from the root.
 * The server client is reached via the explicit `.server` deep path in server
 * code, keeping the service-role key off any client import graph.
 */
export { createPublicClient, type PublicDbConfig } from './client.ts';
export type { ServerDbConfig } from './client.server.ts';
