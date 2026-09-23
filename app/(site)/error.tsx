"use client";

// Shown if the page cannot load its content (e.g. the database is unreachable).
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="top">
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <h1>We&apos;ll be right back</h1>
            <p className="hero-lede">
              Our website is having a moment. To book or ask a question, call Hajj Medical Center on{" "}
              <a href="tel:+9614520065">+961 4 520 065</a>.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={reset}>
                Try again
              </button>
              <a className="btn btn-light" href="tel:+9614520065">
                Call +961 4 520 065
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
