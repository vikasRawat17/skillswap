import React from "react";
import profile from "../../assets/profile.png";
import settings from "../../assets/cogwheel.png";
import logo from "../../assets/sslogo.png";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions, authSelector } from "../../store/login-store/Login.store";
import "./nav.css";

function NavBar() {
  const { isAuthenticated } = useSelector(authSelector);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate("/signin");
  };

  // Define all possible items
  const allNavItems = [
    { to: "/", icon: "🏡", label: "Home", authRequired: false },
    { to: "/signin", icon: "🔐", label: "Sign In", authRequired: false },
    { to: "/post", icon: "📝", label: "Post", authRequired: true },
    { to: "/match", icon: "🤝", label: "Match", authRequired: true },
    { to: "/profile", icon: "👤", label: "Profile", authRequired: true },
  ];

  // Filter based on auth status
  const visibleNavItems = allNavItems.filter(
    (item) => !item.authRequired || isAuthenticated
  );

  return (
    <>
      <nav className="vertical-navbar">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>

        <div className="navbar-links">
          {visibleNavItems.map((item, index) => (
            <NavLink key={index} to={item.to} className="nav-link">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="navbar-user">
          <div className="user-icon">
            {isAuthenticated ? (
              <img
                src="https://cdn-icons-png.flaticon.com/128/1828/1828479.png"
                alt="Logout"
                onClick={handleLogout}
                className="icon-image logout-icon"
              />
            ) : (
              <NavLink to="/profile">
                <img alt="Profile" src={profile} className="icon-image" />
              </NavLink>
            )}
          </div>
          <div className="settings-icon">
            <img alt="Settings" src={settings} className="icon-image" />
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
}

export default NavBar;
