import Image from "next/image";
import type { ImageDTO } from "@/lib/types";

type Props = {
  image: ImageDTO;
  width: number;
  height: number;
  sizes: string;
};

// Keeps the original width/height attributes so the existing CSS sizes the
// image. Seeded Unsplash URLs are already cropped by imgix, so they are served
// as-is; uploaded images go through the Next image optimizer.
export function CmsImage({ image, width, height, sizes }: Props) {
  return (
    <Image
      src={image.url}
      alt={image.alt}
      width={width}
      height={height}
      sizes={sizes}
      unoptimized={image.storage === "external"}
    />
  );
}
