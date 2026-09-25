import * as motion from "motion/react-client";
import { telHref } from "@/lib/home-content";
import type { NavLink, SettingsDTO } from "@/lib/types";
import { fadeUp, VIEWPORT } from "./motion/variants";

export function SiteFooter({ nav, settings }: { nav: NavLink[]; settings: SettingsDTO }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <motion.div className="footer-card" initial="hidden" whileInView="show" viewport={VIEWPORT} variants={fadeUp}>
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
            <span>{settings.address ?? "[Address]"}</span>
          </address>
        </motion.div>
        <div className="footer-bottom">
          <p className="copyright">© {new Date().getFullYear()} Hajj Medical Center. All rights reserved.</p>
          <p className="credit">Developed by Runtime Collective</p>
        </div>
      </div>
    </footer>
  );
}
