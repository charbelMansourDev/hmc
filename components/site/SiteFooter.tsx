import { telHref } from "@/lib/home-content";
import type { NavLink, SettingsDTO } from "@/lib/types";

export function SiteFooter({ nav, settings }: { nav: NavLink[]; settings: SettingsDTO }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-card">
          <div className="footer-brand">
            <h2>Hajj Medical Center</h2>
            <p>Comprehensive, human-centered care in Naccache.</p>
          </div>
          <ul className="footer-links">
            {nav
              .filter((link) => link.href !== "#visit")
              .map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
          </ul>
          <address className="footer-contact">
            <a href={telHref(settings.phone)}>{settings.phone}</a>
            {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : <span>[Email]</span>}
            <span>{settings.address ?? "[Address]"}</span>
          </address>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Hajj Medical Center. All rights reserved.</p>
      </div>
    </footer>
  );
}
