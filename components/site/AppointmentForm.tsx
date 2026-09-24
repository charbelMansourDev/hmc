"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { flash, useBooking, type BookingField } from "./BookingProvider";
import { fadeUp } from "./motion/variants";
import { smoothScrollTo } from "./scroll";

type ApiError = { error?: { code?: string; message?: string; fields?: Record<string, string> } };

// Step 2 of the booking flow. Collects only name and phone; the service and
// preferred date come from the hero booking card. No free-text field on
// purpose: requests must not carry clinical details.
export function AppointmentForm() {
  const booking = useBooking();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [fieldErrors, setFieldErrors] = useState<Set<"name" | "phone">>(new Set());
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const clearFieldError = (field: "name" | "phone") =>
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const missingBooking: BookingField[] = [
      ...(booking.serviceId ? [] : (["service"] as const)),
      ...(booking.date ? [] : (["date"] as const)),
    ];
    const missingFields = [
      ...(name.trim() ? [] : (["name"] as const)),
      ...(phone.trim() ? [] : (["phone"] as const)),
    ];
    setFieldErrors(new Set(missingFields));

    if (missingBooking.length > 0) {
      booking.setErrors(missingBooking);
      setError("Please choose a service and a preferred date in the booking card first.");
      const card = booking.bookingRef.current;
      if (card) smoothScrollTo(card, "center");
      flash(card);
      return;
    }
    if (missingFields.length > 0) {
      document.getElementById(missingFields[0])?.focus();
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          preferredDate: booking.date,
          serviceId: booking.serviceId,
          website,
        }),
      });

      if (res.status === 201) {
        const first = name.trim().split(/\s+/)[0];
        setSuccess(`Thanks, ${first}! We've received your request and will call you to confirm.`);
        setName("");
        setPhone("");
        setWebsite("");
        booking.reset();
        return;
      }

      const body = (await res.json().catch(() => ({}))) as ApiError;
      const fields = body.error?.fields ?? {};
      setFieldErrors(new Set((["name", "phone"] as const).filter((f) => f in fields)));
      const bookingFields: BookingField[] = [
        ...("serviceId" in fields ? (["service"] as const) : []),
        ...("preferredDate" in fields ? (["date"] as const) : []),
      ];
      if (bookingFields.length > 0) booking.setErrors(bookingFields);
      setError(body.error?.message ?? `Something went wrong. Please call us on ${booking.phone}.`);
    } catch {
      setError(`We couldn't send your request. Please check your connection or call us on ${booking.phone}.`);
    } finally {
      setSending(false);
    }
  };

  const inputClass = (field: "name" | "phone") => "input" + (fieldErrors.has(field) ? " is-error" : "");

  return (
    // Reveals with the "Visit us" block (it inherits hidden/show from the parent).
    <motion.form
      className="panel"
      id="contact-form"
      noValidate
      ref={booking.contactRef}
      onSubmit={onSubmit}
      variants={fadeUp}
    >
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          ref={booking.nameRef}
          className={inputClass("name")}
          id="name"
          name="name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          required
          maxLength={80}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("name");
          }}
        />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input
          className={inputClass("phone")}
          id="phone"
          name="phone"
          type="tel"
          placeholder="Your phone number"
          autoComplete="tel"
          required
          maxLength={24}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            clearFieldError("phone");
          }}
        />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>
      <button className="btn btn-primary btn-block" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Send request"}
      </button>
      <p className={success ? "form-success is-visible" : "form-success"} role="status" aria-live="polite">
        {success}
      </p>
      <p className={error ? "form-error is-visible" : "form-error"} role="alert">
        {error}
      </p>
    </motion.form>
  );
}
