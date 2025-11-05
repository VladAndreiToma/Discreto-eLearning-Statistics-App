import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from '/Discreto.png';
import SocialFastAccessFooter from "./DesktopSocialFooterFastAccess";
import MobileSocialFooter from "./MobileSocialFooter";

const components = ["Home", "Simulation", "Learning", "Quizes", "News"];

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <nav className="mobile-nav">
        <img src={logo} alt="Logo" className="mobile-logo" />
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {components.map(c => (
            <Link key={c} to={c === "Home" ? "/" : `/${c.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
              {c}
            </Link>
          ))}
          <MobileSocialFooter/>
        </div>
      )}
    </div>
  );
}
