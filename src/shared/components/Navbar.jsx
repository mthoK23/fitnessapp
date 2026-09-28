import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from '../../features/user/AuthContext';
import styles from "../styles/navbar.module.css";

function Navbar() {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);


  const handleMenuToggle =() => setMenuOpen((open)=> !open);
  const handleLinkClick =() => setMenuOpen(false);

  return (
    <header className={styles.header} aria-label="Header">
      <nav className={styles.navbar} aria-label="Main navigation">
        <main className={styles.navContainer}>

          {/* Logo / Brand */}
          <Link to="/" className={styles.logo} aria-label="FitTrack Home">
            <span className={styles.logoText}>FitTrack</span>
          </Link>

          {/* Hamburger Menu for Mobile */}
          <button
            className={styles.burger}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={handleMenuToggle}
          >
              <span className={styles.burgerBar}></span>
              <span className={styles.burgerBar}></span>
              <span className={styles.burgerBar}></span>
          </button>

          {/* Navigation Links */}
          <ul className={`${styles.navLinks} ${menuOpen ? styles.open: ""}`}
            role="menubar"
          >
            <li role="none">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? styles.active : styles.link
                }
                role="menuitem"
              onClick={handleLinkClick}>
                Dashboard
              </NavLink>
            </li>
            <li role="none">
              <NavLink
                to="/meals"
                className={({ isActive }) =>
                  isActive ? styles.active : styles.link
                }
                role="menuitem"
                onClick={handleLinkClick}
              >
                Meals
              </NavLink>
            </li>
            <li role="none">
              <NavLink
                to="/workouts"
                className={({ isActive }) =>
                  isActive ? styles.active : styles.link
                }
                role="menuitem"
              onClick={handleLinkClick}
              >
                Workouts
              </NavLink>
            </li>
            <li role="none">
              <NavLink
                to="/progress"
                className={({ isActive }) =>
                  isActive ? styles.active : styles.link
                }
                role="menuitem"
                onClick={handleLinkClick}
              >
                Progress
              </NavLink>
            </li>
            <li role="none" className={styles.mobileUserSection}>
              {isAuthenticated ? (
                <>
                  <span className={styles.username}>
                    {currentUser?.username || "User"}
                  </span>
                  <button
                    onClick={()=>{
                      logout();
                      handleLinkClick();

                    }}
                    className={styles.logoutBtn}
                    aria-label="Logout"
                    >
                    Logout
                  </button>
                </>
              ) : (
                <span className={styles.loginPrompt}>Please log in</span>
              )}
            </li>
          </ul>

          {/* User Section */}
          <section className={styles.userSection}>
            {isAuthenticated ? (
              <>
              <Link
                  to="/user"
                  className={styles.username}
                  title="User Profile"
                  style={{ cursor: "pointer"}}
                >
                  {currentUser?.username || "User"}
                </Link>
                <button
                  onClick={logout}
                  className={styles.logoutBtn}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className={styles.loginPrompt}>Please log in</span>
            )}
          </section>
          
        </main>
      </nav>
    </header>
  );
 
}

export default Navbar;