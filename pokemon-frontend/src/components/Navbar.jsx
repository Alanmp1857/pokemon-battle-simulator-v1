import React, { useContext, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { userContext } from "../App";
import axios from "axios";
import api from "../helper/api";
import { Button } from "@mui/material";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const { userinfo, setUserinfo } = useContext(userContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = () => setNav(!nav);

  const handleLogout = async () => {
    await axios.get(`${api}/user/logout`, { withCredentials: true });
    localStorage.clear();
    navigate("/");
    setUserinfo(undefined);
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "TeamBuilder", path: "/teambuilder" },
    { name: "MyTeams", path: "/myteams" },
    { name: "Battle", path: "/battle" },
    { name: "LeaderBoard", path: "/leaderboard" },
  ];

  return (
    <nav className="fixed w-full z-50 sm:backdrop-blur-md bg-black/20 border-b border-[#1d1d1d] shadow-lg">
      <div className="flex justify-between items-center w-full px-6 py-3 text-white">

        {/* LOGO */}
        <Link to="/">
          <h1 className="text-3xl font-bold text-[#00df9a] tracking-wider hover:opacity-80 transition">
            SHOWDOWN
          </h1>
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.name} to={item.path}>
              <li
                className={`relative px-2 py-1 cursor-pointer text-sm tracking-wide transition-colors 
                hover:text-[#00df9a]
                ${
                  location.pathname === item.path
                    ? "text-[#00df9a] font-semibold"
                    : "text-gray-200"
                }`}
              >
                {item.name}

                {/* Active underline */}
                {location.pathname === item.path && (
                  <div className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#00df9a] rounded-full shadow-glow" />
                )}
              </li>
            </Link>
          ))}

          {/* USERNAME */}
          {userinfo && (
            <li className="px-3 py-1 text-[#00df9a] font-semibold uppercase tracking-wide">
              {userinfo.username}
            </li>
          )}

          {/* AUTH BUTTONS */}
          {!userinfo ? (
            <Button
              onClick={() => navigate("/signin")}
              size="small"
              variant="contained"
              sx={{
                backgroundColor: "#7b2cbf",
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": { backgroundColor: "#5a189a" },
              }}
            >
              Sign In
            </Button>
          ) : (
            <Button
              onClick={handleLogout}
              size="small"
              variant="contained"
              sx={{
                backgroundColor: "#d00000",
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": { backgroundColor: "#9d0000" },
              }}
            >
              Logout
            </Button>
          )}
        </ul>

        {/* MOBILE MENU ICON */}
        <div className="block md:hidden cursor-pointer" onClick={handleNav}>
          {nav ? <AiOutlineClose size={22} /> : <AiOutlineMenu size={22} />}
        </div>

        {/* MOBILE MENU */}
        <ul
          className={`fixed md:hidden top-0 left-0 h-full w-[65%] bg-[#0b0b0c] border-r border-[#222] p-6 transition-transform duration-300 
          ${nav ? "translate-x-0" : "-translate-x-full"}`}
        >
          <h1 className="text-3xl font-bold text-[#00df9a] mb-6">SHOWDOWN</h1>

          {userinfo && (
            <li className="mb-3 text-[#00df9a] font-semibold uppercase tracking-wide">
              {userinfo.username}
            </li>
          )}

          {navItems.map((item) => (
            <Link key={item.name} to={item.path}>
              <li
                onClick={handleNav}
                className="p-4 border-b border-gray-700 text-gray-200 hover:text-[#00df9a] transition"
              >
                {item.name}
              </li>
            </Link>
          ))}

          {!userinfo ? (
            <Button
              onClick={() => {
                handleNav();
                navigate("/signin");
              }}
              variant="contained"
              sx={{
                mt: 3,
                backgroundColor: "#7b2cbf",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#5a189a" },
              }}
            >
              Sign In
            </Button>
          ) : (
            <Button
              onClick={() => {
                handleLogout();
                handleNav();
              }}
              variant="contained"
              sx={{
                mt: 3,
                backgroundColor: "#d00000",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#9d0000" },
              }}
            >
              Logout
            </Button>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
