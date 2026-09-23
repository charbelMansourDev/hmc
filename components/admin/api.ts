// Client-side helpers for calling the admin API from forms.

export type FieldErrors = Record<string, string>;
export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string; fields: FieldErrors };

async function toResult<T>(res: Response): Promise<ApiResult<T>> {
  if (res.ok) {
    const data = res.status === 204 ? (null as T) : ((await res.json().catch(() => null)) as T);
    return { ok: true, data };
  }
  const body = (await res.json().catch(() => null)) as {
    error?: { message?: string; fields?: FieldErrors };
  } | null;
  if (res.status === 401) {
    return { ok: false, message: "Your session has expired. Please sign in again.", fields: {} };
  }
  if (res.status === 413 && !body) {
    // The hosting platform rejected the upload before it reached the app.
    return { ok: false, message: "That image is too large. Please use a file under 4 MB.", fields: {} };
  }
  return {
    ok: false,
    message: body?.error?.message ?? `Request failed (${res.status}).`,
    fields: body?.error?.fields ?? {},
  };
}

export async function sendMultipart<T>(
  url: string,
  method: "POST" | "PATCH",
  data: unknown,
  image: File | null,
): Promise<ApiResult<T>> {
  const form = new FormData();
  form.set("data", JSON.stringify(data));
  if (image) form.set("image", image);
  try {
    return await toResult<T>(await fetch(url, { method, body: form }));
  } catch {
    return { ok: false, message: "Network error. Please check your connection and try again.", fields: {} };
  }
}

export async function sendJson<T>(url: string, method: "POST" | "PATCH" | "DELETE", data?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: data === undefined ? undefined : { "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    return await toResult<T>(res);
  } catch {
    return { ok: false, message: "Network error. Please check your connection and try again.", fields: {} };
  }
}
