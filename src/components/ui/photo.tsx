import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Media } from "@/lib/media";

/** Fill-mode image in a clipped frame with a blur-up placeholder. */
export function Photo({
  media,
  sizes = "100vw",
  className,
  imgClassName,
  preload,
  alt,
  quality,
}: {
  media: Media | null | undefined;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  preload?: boolean;
  alt?: string;
  quality?: 75 | 85;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-paper-deep", className)}>
      {media ? (
        <Image
          src={media.src}
          alt={alt ?? media.alt ?? ""}
          fill
          sizes={sizes}
          preload={preload}
          quality={quality}
          placeholder={media.blurDataURL ? "blur" : "empty"}
          blurDataURL={media.blurDataURL}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-deu to-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/deu-logotype.svg" alt="" className="w-1/3 opacity-20 brightness-0 invert" />
        </div>
      )}
    </div>
  );
}
