import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-link">Home</NavLink>
      <NavLink to="/chat" className="nav-link">Chat</NavLink>
      <NavLink to="/image" className="nav-link">Image Uploads</NavLink>
    </nav>
  );
};

export default NavBar;
