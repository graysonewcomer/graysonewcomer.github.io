import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaLightbulb, FaCode, FaCheck, FaTrophy } from 'react-icons/fa';

const InstructionsContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #1a1a2e;
  }
`;

const InstructionsTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #1a1a2e;
`;

const InstructionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InstructionItem = styled.div`
  display: flex;
  gap: 1rem;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #f0f8ff;
  color: #61dafb;
  border-radius: 50%;
  flex-shrink: 0;
`;

const InstructionContent = styled.div`
  flex: 1;
`;

const InstructionTitle = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1a1a2e;
`;

const InstructionText = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
`;

const ExampleContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const ExampleTitle = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #1a1a2e;
  text-align: center;
`;

const ExampleContent = styled.div`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
  
  code {
    background-color: #e0e0e0;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
  }
`;

const Instructions = ({ onClose }) => {
  return (
    <InstructionsContainer>
      <CloseButton onClick={onClose}>
        <FaTimes />
      </CloseButton>
      
      <InstructionsTitle>How to Play SyntaxWordle</InstructionsTitle>
      
      <InstructionsList>
        <InstructionItem>
          <IconContainer>
            <FaCode />
          </IconContainer>
          <InstructionContent>
            <InstructionTitle>Identify the Language</InstructionTitle>
            <InstructionText>
              Each day, you'll be presented with a new code snippet. Your task is to identify 
              which programming language it's written in based on the syntax.
            </InstructionText>
          </InstructionContent>
        </InstructionItem>
        
        <InstructionItem>
          <IconContainer>
            <FaLightbulb />
          </IconContainer>
          <InstructionContent>
            <InstructionTitle>Look for Clues</InstructionTitle>
            <InstructionText>
              Pay attention to syntax elements like variable declarations, function definitions, 
              comment styles, and language-specific keywords that can help you identify the language.
            </InstructionText>
          </InstructionContent>
        </InstructionItem>
        
        <InstructionItem>
          <IconContainer>
            <FaCheck />
          </IconContainer>
          <InstructionContent>
            <InstructionTitle>Make Your Guess</InstructionTitle>
            <InstructionText>
              Select the programming language you think the code is written in from the options provided. 
              You have three attempts to guess correctly.
            </InstructionText>
          </InstructionContent>
        </InstructionItem>
        
        <InstructionItem>
          <IconContainer>
            <FaTrophy />
          </IconContainer>
          <InstructionContent>
            <InstructionTitle>Track Your Progress</InstructionTitle>
            <InstructionText>
              Your stats are saved locally, so you can track your performance over time. 
              Try to maintain a streak by playing daily!
            </InstructionText>
          </InstructionContent>
        </InstructionItem>
      </InstructionsList>
      
      <ExampleContainer>
        <ExampleTitle>Example</ExampleTitle>
        <ExampleContent>
          If you see code with <code>func main()</code> and types declared after variable names like <code>name string</code>, 
          that's likely Go. If you see <code>let</code> and <code>const</code> with arrow functions like <code>() =&gt; {}</code>, 
          that's probably JavaScript or TypeScript.
        </ExampleContent>
      </ExampleContainer>
    </InstructionsContainer>
  );
};

export default Instructions;
