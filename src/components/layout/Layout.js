import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './Header';
import Footer from './Footer';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
    background-color: #f8f9fa;
    color: #333;
    line-height: 1.6;
  }
  
  html, body, #root {
    height: 100%;
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentWrapper = styled.main`
  flex: 1;
  padding: 2rem 0;
`;

const Layout = ({ children }) => {
  return (
    <>
      <GlobalStyle />
      <MainContainer>
        <Header />
        <ContentWrapper>
          {children}
        </ContentWrapper>
        <Footer />
      </MainContainer>
    </>
  );
};

export default Layout;
