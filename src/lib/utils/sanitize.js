import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Membersihkan HTML dari Rich Text Editor sebelum disimpan ke database.
 * Hanya tag format teks yang diizinkan; <script>, atribut on*, style,
 * dan link "javascript:" dibuang. Ini mencegah Stored XSS karena isi
 * materi nantinya ditampilkan ke semua student.
 */
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
    // Semua link dibuka di tab baru dengan rel aman.
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
    b: "strong",
    i: "em",
  },
  // Paragraf kosong dari editor (<p></p>) dibuang.
  exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren?.length,
};

export function sanitizeLessonHtml(html = "") {
  return sanitizeHtml(String(html), OPTIONS).trim();
}

/** Teks polos dari HTML (untuk validasi panjang & ringkasan). */
export function htmlToText(html = "") {
  // Beri spasi di batas blok (paragraf, judul, poin, sel tabel) agar kata tidak menempel.
  const spaced = String(html).replace(/<\/?(p|h[1-6]|li|td|th|tr|br|hr|div|blockquote|pre)\b[^>]*>/gi, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
