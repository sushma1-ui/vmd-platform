/** Minimal, dependency-free Lexical (Payload rich text) -> HTML serializer. */
type Node = Record<string, any>;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function text(n: Node): string {
  let t = esc(String(n.text ?? ''));
  if (n.format & 1) t = `<strong>${t}</strong>`;
  if (n.format & 2) t = `<em>${t}</em>`;
  if (n.format & 8) t = `<u>${t}</u>`;
  return t;
}
function children(n: Node): string {
  return (n.children ?? []).map(node).join('');
}
function node(n: Node): string {
  switch (n.type) {
    case 'text':
      return text(n);
    case 'paragraph':
      return `<p>${children(n)}</p>`;
    case 'heading':
      return `<${n.tag}>${children(n)}</${n.tag}>`;
    case 'list':
      return `<${n.listType === 'number' ? 'ol' : 'ul'}>${children(n)}</${n.listType === 'number' ? 'ol' : 'ul'}>`;
    case 'listitem':
      return `<li>${children(n)}</li>`;
    case 'link':
      return `<a href="${esc(n.fields?.url ?? '#')}">${children(n)}</a>`;
    case 'quote':
      return `<blockquote>${children(n)}</blockquote>`;
    default:
      return children(n);
  }
}
export function lexicalToHtml(root: Node | undefined | null): string {
  if (!root?.root) return '';
  return children(root.root);
}
