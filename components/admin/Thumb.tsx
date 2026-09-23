import Image from "next/image";
import type { ImageDTO } from "@/lib/types";

export function Thumb({ image, width = 88, height = 60 }: { image: ImageDTO | null; width?: number; height?: number }) {
  if (!image) {
    return <div style={{ width, height }} className="shrink-0 rounded-[8px] bg-bg-soft" aria-hidden="true" />;
  }
  return (
    <Image
      src={image.url}
      alt=""
      width={width}
      height={height}
      className="shrink-0 rounded-[8px] object-cover"
      style={{ width, height }}
      unoptimized={image.storage === "external"}
    />
  );
}
