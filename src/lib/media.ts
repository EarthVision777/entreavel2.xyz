export function youtubeId(url: string): string | null {
  const match = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=)([^#&?]*).*/,
  );
  return match && match[2]?.length === 11 ? match[2] : null;
}

export function vimeoEmbed(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (!match) return null;
  const [, id, hash] = match;
  return hash
    ? `https://player.vimeo.com/video/${id}?h=${hash}`
    : `https://player.vimeo.com/video/${id}`;
}

export function openExternal(url: string) {
  if (!url) return;
  const href = url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
  window.open(href, "_blank", "noopener,noreferrer");
}

export function isIos() {
  return (
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !("MSStream" in window)
  );
}

export function readableOn(hex: string) {
  const color = hex.replace("#", "");
  if (color.length < 6) return false;
  const red = Number.parseInt(color.slice(0, 2), 16);
  const green = Number.parseInt(color.slice(2, 4), 16);
  const blue = Number.parseInt(color.slice(4, 6), 16);
  return (299 * red + 587 * green + 114 * blue) / 1000 < 128;
}

export function releaseMessage(module: {
  hasAccess: boolean;
  daysRemaining: number | null;
  releaseDate: string | null;
}) {
  if (module.hasAccess) return null;
  if (module.daysRemaining !== null && module.daysRemaining > 0) {
    return module.daysRemaining === 1
      ? "Este producto estará disponible en 1 día"
      : `Este producto estará disponible en ${module.daysRemaining} días`;
  }
  if (module.releaseDate) {
    const date = new Date(module.releaseDate);
    if (date.getTime() > Date.now()) {
      return `Este producto estará disponible el ${date.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}`;
    }
  }
  return null;
}

export function formatLongDate(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("es", { day: "numeric", month: "long" });
  const time = date.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${day} a las ${time}`;
}

export function formatShortDate(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("es", { day: "numeric", month: "short" });
  const time = date.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${day} ${time}`;
}
