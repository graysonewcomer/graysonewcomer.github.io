import React from 'react';
import styled from 'styled-components';
import SyntaxWordleGame from '../SyntaxWordle/Game';

const SyntaxWordleContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: #61dafb;
  }
`;

const Introduction = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
`;

const IntroText = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
`;

const GameSection = styled.section`
  margin-bottom: 4rem;
`;

const SyntaxWordle = () => {
  return (
    <SyntaxWordleContainer>
      <PageTitle>SyntaxWordle</PageTitle>
      
      <Introduction>
        <IntroText>
          Welcome to SyntaxWordle! This is a fun twist on the popular word game, 
          designed specifically for programmers and coding enthusiasts.
        </IntroText>
        <IntroText>
          Can you identify the programming language from a code snippet? 
          You'll be shown a piece of code with syntax highlighting, and your task is to guess 
          which language it's written in. Test your programming language recognition skills!
        </IntroText>
      </Introduction>
      
      <GameSection>
        <SyntaxWordleGame />
      </GameSection>
    </SyntaxWordleContainer>
  );
};

export default SyntaxWordle;
