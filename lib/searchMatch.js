// Shared search-matching helper.
//
// Previously, search treated the whole query as one continuous substring
// (`haystack.includes("teacher punjab")`), so "Teacher Punjab" only matched
// when those two words happened to sit next to each other in the exact
// field order the code joined them in. A job titled "Junior Teacher" in
// department "School Education Department", sector "Punjab" would NOT
// match "Teacher Punjab" even though it's clearly the right result —
// "teacher" and "punjab" aren't adjacent in the joined string.
//
// matchesQuery() instead splits the query into words and requires every
// word to appear SOMEWHERE across the given fields — order and field don't
// matter, so "Teacher Punjab", "Punjab Teacher" and "Teacher in Punjab" all
// match the same records.

/** True if every word in `query` is found somewhere across `fields` (case-insensitive, order-independent). */
export function matchesQuery(fields, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return false;
  const haystack = fields.filter(Boolean).join(' ').toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  return words.every((w) => haystack.includes(w));
}
