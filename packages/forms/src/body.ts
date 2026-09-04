/**
 * Size-limited JSON body reader for public API routes.
 *
 * The form endpoints only ever receive small JSON objects (the largest is a
 * second-opinion message capped at 4000 chars). Reading an unbounded body lets an
 * attacker push memory/CPU with a giant payload before validation ever runs. This
 * enforces a hard byte cap using BOTH the declared Content-Length and the actual
 * bytes read (a chunked request can lie about, or omit, Content-Length), and only
 * then parses JSON.
 */
export type ReadJsonResult =
  { ok: true; data: unknown } | { ok: false; status: 400 | 413; error: string };

const DEFAULT_MAX_BYTES = 32 * 1024; // 32 KB — ample for every VMD form.

export async function readJson(
  request: Request,
  maxBytes: number = DEFAULT_MAX_BYTES,
): Promise<ReadJsonResult> {
  const declared = request.headers.get('content-length');
  if (declared && Number(declared) > maxBytes) {
    return { ok: false, status: 413, error: 'Payload too large' };
  }

  let bytes: ArrayBuffer;
  try {
    bytes = await request.arrayBuffer();
  } catch {
    return { ok: false, status: 400, error: 'Invalid body' };
  }
  if (bytes.byteLength > maxBytes) {
    return { ok: false, status: 413, error: 'Payload too large' };
  }

  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return { ok: false, status: 400, error: 'Invalid body' };
  }

  try {
    const data = JSON.parse(text) as unknown;
    // Reject non-object roots (arrays/strings/numbers) — every form posts an object.
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, status: 400, error: 'Invalid body' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, status: 400, error: 'Invalid body' };
  }
}
