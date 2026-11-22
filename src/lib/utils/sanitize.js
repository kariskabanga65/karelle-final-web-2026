import "server-only";
import sanitizeHtml from "sanitize-html";

const OPTIONS = {
  allowedTags: [
    "p", "br", "hr", "h2", "h3", "strong", "b", "em", "i", "u", "s",
    "ul", "ol", "li", "blockquote", "code", "pre", "a",
    "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
    b: "strong",
    i: "em",
  },
  exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren?.length,
};

export function sanitizeLessonHtml(html = "") {
  return sanitizeHtml(String(html), OPTIONS).trim();
}

export function htmlToText(html = "") {
  const spaced = String(html).replace(/<\/?(p|h[1-6]|li|td|th|tr|br|hr|div|blockquote|pre)\b[^>]*>/gi, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
