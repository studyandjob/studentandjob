// Turns the admin's "Site-wide ad script" text into real <script>/<meta>
// elements that are rendered on the SERVER inside <head>. That way the
// AdSense snippet is present in the page's HTML source, which is what
// Google's site-verification crawler reads (code injected later in the
// browser by useEffect is invisible to it).
import React from 'react';

const ATTR_RE = /([^\s=/"'<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function parseAttrs(str) {
  const out = {};
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(str || ''))) {
    const name = m[1];
    const val = m[2] ?? m[3] ?? m[4];
    out[name] = val === undefined ? true : val;
  }
  return out;
}

function toProps(attrs) {
  const props = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'crossorigin') props.crossOrigin = v === true ? 'anonymous' : v;
    else if (k === 'async' || k === 'defer') props[k] = true;
    else if (k === 'class') props.className = v;
    else props[k] = v;
  }
  return props;
}

export function AdHeadElements({ html }) {
  if (!html || !html.trim()) return null;
  const nodes = [];
  let i = 0;

  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html))) {
    const props = toProps(parseAttrs(m[1]));
    const inline = m[2] && m[2].trim();
    if (inline && !props.src) {
      nodes.push(<script key={`s${i++}`} {...props} dangerouslySetInnerHTML={{ __html: inline }} />);
    } else if (props.src) {
      nodes.push(<script key={`s${i++}`} {...props} />);
    }
  }

  const metaRe = /<meta\b([^>]*)>/gi;
  while ((m = metaRe.exec(html))) {
    const props = toProps(parseAttrs(m[1].replace(/\/\s*$/, '')));
    if (props.name || props.property) nodes.push(<meta key={`m${i++}`} {...props} />);
  }

  return <>{nodes}</>;
}
