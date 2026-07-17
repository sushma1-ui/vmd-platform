import type { APIRoute } from 'astro';
export const prerender = false;
/**
 * On-demand ISR trigger, called by the Payload revalidate hook after a content
 * change. Verifies a shared secret, then the Vercel adapter revalidates the path.
 */
export const POST: APIRoute = async ({ request }) => {
  const secret = request.headers.get('x-revalidate-secret');
  if (!secret || secret !== import.meta.env.REVALIDATE_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  // await revalidatePath(body.path)  // wired with the Vercel adapter in the deploy module
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};
