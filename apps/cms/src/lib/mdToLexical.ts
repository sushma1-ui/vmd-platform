/**
 * Minimal Markdown -> Payload Lexical converter.
 *
 * Scope is deliberately the exact subset used by the Service Pages source document:
 * `##`/`###` headings, paragraphs, `-` bullet lists, `N.` ordered lists, and inline
 * `**bold**` / `*italic*`. Bracket placeholders such as [Book a consultation] are kept
 * as literal text — wiring them to links is a separate, opt-in enhancement, so the
 * source wording is preserved verbatim. Output matches the node shapes consumed by the
 * web app's lexicalToHtml serializer and is valid Payload Lexical.
 */

type LexNode = Record<string, unknown>;

const BOLD = 1;
const ITALIC = 2;

function textNode(text: string, format: number): LexNode {
  return { type: 'text', text, format, detail: 0, mode: 'normal', style: '', version: 1 };
}

/** Parse inline **bold** / *italic* into text nodes; everything else is literal. */
function inline(md: string): LexNode[] {
  const nodes: LexNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    if (m.index > last) nodes.push(textNode(md.slice(last, m.index), 0));
    if (m[1] !== undefined) nodes.push(textNode(m[1], BOLD));
    else nodes.push(textNode(m[2] as string, ITALIC));
    last = re.lastIndex;
  }
  if (last < md.length) nodes.push(textNode(md.slice(last), 0));
  return nodes.length ? nodes : [textNode(md, 0)];
}

function block(type: string, children: LexNode[], extra: LexNode = {}): LexNode {
  return { type, format: '', indent: 0, version: 1, direction: 'ltr', children, ...extra };
}

function listItem(value: number, children: LexNode[]): LexNode {
  return block('listitem', children, { value });
}

const HEADING = /^(#{2,3})\s+(.*)$/;
const BULLET = /^-\s+(.*)$/;
const ORDERED = /^\d+\.\s+(.*)$/;

function isPlain(line: string): boolean {
  return !HEADING.test(line) && !BULLET.test(line) && !ORDERED.test(line);
}

export function mdToLexical(md: string): LexNode {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const children: LexNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (!line.trim()) {
      i++;
      continue;
    }

    const h = HEADING.exec(line);
    if (h) {
      const tag = (h[1] ?? '').length === 2 ? 'h2' : 'h3';
      children.push(block('heading', inline((h[2] ?? '').trim()), { tag }));
      i++;
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      const items: LexNode[] = [];
      for (let b: RegExpExecArray | null = bullet; b;) {
        items.push(listItem(items.length + 1, inline((b[1] ?? '').trim())));
        i++;
        const next = lines[i];
        b = next === undefined ? null : BULLET.exec(next);
      }
      children.push(block('list', items, { listType: 'bullet', tag: 'ul', start: 1 }));
      continue;
    }

    const ordered = ORDERED.exec(line);
    if (ordered) {
      const items: LexNode[] = [];
      for (let o: RegExpExecArray | null = ordered; o;) {
        items.push(listItem(items.length + 1, inline((o[1] ?? '').trim())));
        i++;
        const next = lines[i];
        o = next === undefined ? null : ORDERED.exec(next);
      }
      children.push(block('list', items, { listType: 'number', tag: 'ol', start: 1 }));
      continue;
    }

    // Paragraph: gather consecutive plain lines.
    const buf: string[] = [];
    for (let cur = lines[i]; cur !== undefined && cur.trim() && isPlain(cur); cur = lines[i]) {
      buf.push(cur.trim());
      i++;
    }
    children.push(block('paragraph', inline(buf.join(' '))));
  }

  return { root: block('root', children) };
}
