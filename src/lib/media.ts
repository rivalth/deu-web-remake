import manifest from "@/generated/media.json";

export type Media = {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
  alt?: string;
};

type Manifest = {
  images: Record<string, { width: number; height: number; blur: string }>;
  units: Record<string, { url: string; group: string }>;
};

const data = manifest as Manifest;

/** Resolve a content image path ("images/x.jpg" or "/images/x.jpg") to a Media object. */
export function media(path: string | null | undefined, alt = ""): Media | null {
  if (!path) return null;
  const src = path.startsWith("/") ? path : `/${path}`;
  const meta = data.images[src];
  if (!meta) return null;
  return { src, width: meta.width, height: meta.height, blurDataURL: meta.blur, alt };
}

export function unitLogo(slug: string): string | null {
  return data.units[slug]?.url ?? null;
}
