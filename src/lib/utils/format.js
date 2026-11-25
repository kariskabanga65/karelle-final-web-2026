/** Helper format tampilan (tanggal, angka, inisial nama). */

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Makassar",
});

export function formatDate(value) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value));
}

/** "1 Des 2026 – 28 Feb 2027" atau "Akses selamanya" untuk kelas lifetime. */
export function formatCoursePeriod(startDate, endDate) {
  if (!startDate && !endDate) return "Akses selamanya";
  if (startDate && endDate) return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  if (startDate) return `Mulai ${formatDate(startDate)}`;
  return `Sampai ${formatDate(endDate)}`;
}

export function formatPercent(value) {
  const number = Number(value ?? 0);
  return `${Number.isInteger(number) ? number : number.toFixed(0)}%`;
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/** Gambar kategori: public/images/categories/<slug>.jpg */
export function getCategoryImage(slug) {
  const known = ["runway-catwalk", "photoshoot-posing", "model-portfolio", "casting-preparation"];
  return known.includes(slug) ? `/images/categories/${slug}.jpg` : "/images/hero-model.jpg";
}

const relativeFormatter = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

/** "3 jam yang lalu", "kemarin", dst. */
export function formatRelative(value) {
  if (!value) return "-";
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormatter.format(Math.round(seconds / size), unit);
  }
  return "baru saja";
}

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Makassar",
});

/** Tanggal + jam (WITA), contoh: "25 Nov 2026, 22.30". */
export function formatDateTime(value) {
  if (!value) return "-";
  return dateTimeFormatter.format(new Date(value));
}
