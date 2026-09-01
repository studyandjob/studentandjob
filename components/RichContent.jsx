// Renders admin-authored long-form content (About Us, Privacy Policy,
// Disclaimer, Terms & Conditions) with real headings, bullet lists and
// short paragraphs — instead of one long unbroken block of plain text.
//
// Nothing changes about where the content lives or how it's edited:
// it's still just the `content` textarea in Admin Dashboard -> Pages,
// same `site_pages` table, same save/delete flow — full control stays
// with the admin. The only change is that a few plain-text conventions
// are now understood when the page renders:
//
//   ## Heading             -> <h2>
//   ### Sub heading         -> <h3>
//   - item   (or * item)    -> bullet list
//   **text**                -> bold
//   (blank line)             -> starts a new paragraph
//
// This intentionally isn't a full Markdown implementation (no links,
// tables, nesting, etc.) — just enough structure for legal/info pages
// to be scannable, with zero new admin UI, database columns, or
// dependencies.

function parseInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== '');
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}

/** Splits raw admin text into typed blocks (heading / bullet-list / paragraph). */
function parseBlocks(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraphLines = [];
  let listItems = null;

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push({ type: 'p', text: paragraphLines.join(' ') });
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems) {
      blocks.push({ type: 'ul', items: listItems });
      listItems = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (line === '') {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h3', text: line.slice(4) });
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h2', text: line.slice(3) });
      continue;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      flushParagraph();
      listItems = listItems || [];
      listItems.push(line.slice(2));
      continue;
    }
    flushList();
    paragraphLines.push(line);
  }
  flushParagraph();
  flushList();

  return blocks;
}

export default function RichContent({ text, className = '' }) {
  if (!text || !text.trim()) return null;

  const blocks = parseBlocks(text);

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.type === 'h2') {
          return (
            <h2 key={i} className="mb-3 mt-8 text-xl font-bold text-gray-900 first:mt-0 md:text-2xl">
              {parseInline(block.text, i)}
            </h2>
          );
        }
        if (block.type === 'h3') {
          return (
            <h3 key={i} className="mb-2 mt-6 text-lg font-bold text-gray-900 md:text-xl">
              {parseInline(block.text, i)}
            </h3>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="mb-4 ml-5 list-disc space-y-1.5 text-sm leading-7 text-gray-700 md:text-base">
              {block.items.map((item, j) => (
                <li key={j}>{parseInline(item, `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mb-4 text-sm leading-7 text-gray-700 md:text-base">
            {parseInline(block.text, i)}
          </p>
        );
      })}
    </div>
  );
}
