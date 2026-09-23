import type { PublicClinicItem, PublicServiceItem } from "@/lib/types";
import { CmsImage } from "./CmsImage";

const CARD_SIZES = "(max-width: 640px) 50vw, (max-width: 820px) 33vw, (max-width: 1180px) 25vw, 220px";
const WIDE_CARD_SIZES = "(max-width: 640px) 100vw, (max-width: 820px) 33vw, (max-width: 1180px) 25vw, 220px";
const FEATURE_SIZES = "(max-width: 820px) 100vw, 650px";

type CardItem = Pick<PublicServiceItem, "id" | "name" | "chip" | "description" | "image" | "bookingId">;

export function ServiceCard({ item, wide = false }: { item: CardItem; wide?: boolean }) {
  return (
    <a className="card reveal" href="#book" data-service={item.bookingId || undefined}>
      <div className="card-media">
        <CmsImage image={item.image} width={560} height={385} sizes={wide ? WIDE_CARD_SIZES : CARD_SIZES} />
        {item.chip ? <span className="chip">{item.chip}</span> : null}
      </div>
      <div className="card-body">
        <h3>{item.name}</h3>
        {item.description ? <p>{item.description}</p> : null}
      </div>
    </a>
  );
}

export function FeatureCard({ item }: { item: PublicServiceItem }) {
  return (
    <article className="feature reveal">
      <div className="feature-media">
        <CmsImage image={item.image} width={1400} height={620} sizes={FEATURE_SIZES} />
      </div>
      <div className="feature-body">
        <h3>{item.name}</h3>
        {item.description ? <p>{item.description}</p> : null}
        {item.tags.length > 0 ? (
          <ul className="tags" aria-label="Treatment areas">
            {item.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}
        <a className="btn btn-light btn-sm" href="#book" data-service={item.bookingId}>
          Learn more
        </a>
      </div>
    </article>
  );
}

export function ClinicCard({ item }: { item: PublicClinicItem }) {
  return <ServiceCard item={item} wide />;
}
