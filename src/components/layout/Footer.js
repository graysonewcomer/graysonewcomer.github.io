import React from 'react';
import styled from 'styled-components';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #1a1a2e;
  color: #fff;
  padding: 2rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SocialIcon = styled.a`
  color: #fff;
  font-size: 1.5rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #61dafb;
  }
`;

const Copyright = styled.p`
  font-size: 0.9rem;
  text-align: center;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <SocialLinks>
          <SocialIcon href="https://github.com/graysonewcomer" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub />
          </SocialIcon>
          <SocialIcon href="https://linkedin.com/in/graysonewcomer" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin />
          </SocialIcon>
          <SocialIcon href="https://twitter.com/graysonewcomer" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter />
          </SocialIcon>
          <SocialIcon href="mailto:contact@graysonewcomer.com" aria-label="Email">
            <FaEnvelope />
          </SocialIcon>
        </SocialLinks>
        <Copyright>
          &copy; {currentYear} Grayson Newcomer. All rights reserved.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
