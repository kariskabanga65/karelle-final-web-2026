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

export function getCategoryImage(slug) {
  const known = ["runway-catwalk", "photoshoot-posing", "model-portfolio", "casting-preparation"];
  return known.includes(slug) ? `/images/categories/${slug}.jpg` : "/images/hero-model.jpg";
}
