import "server-only";
import { notFound } from "next/navigation";
import { HttpError } from "./http";

/** Loads an item for a CMS edit page; a missing or malformed id renders the 404 page. */
export async function loadOr404<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) notFound();
    throw err;
  }
}
