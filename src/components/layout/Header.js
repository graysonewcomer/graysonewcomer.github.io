import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaTimes } from 'react-icons/fa';

const HeaderContainer = styled.header`
  background-color: #1a1a2e;
  color: #fff;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: #61dafb;
  text-decoration: none;
  
  span {
    color: #fff;
  }
`;

const MenuIcon = styled.div`
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  
  @media (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 70px;
    left: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
    width: 100%;
    background-color: #1a1a2e;
    transition: all 0.3s ease-in-out;
    padding: 1rem 0;
    z-index: 99;
  }
`;

const NavItem = styled.li`
  margin: 0 1rem;
  
  @media (max-width: 768px) {
    margin: 1rem 0;
    text-align: center;
  }
`;

const NavLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #61dafb;
  }
  
  &.active {
    color: #61dafb;
    font-weight: 600;
  }
`;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">
          Grayson<span>Newcomer</span>
        </Logo>
        
        <MenuIcon onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </MenuIcon>
        
        <NavLinks isOpen={isMenuOpen}>
          <NavItem>
            <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>About</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/skills" onClick={() => setIsMenuOpen(false)}>Skills</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/experience" onClick={() => setIsMenuOpen(false)}>Experience</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/syntaxwordle" onClick={() => setIsMenuOpen(false)}>SyntaxWordle</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
          </NavItem>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
