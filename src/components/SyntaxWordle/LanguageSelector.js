import React from 'react';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  margin-top: 2rem;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const AttemptsCounter = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #666;
  
  span {
    font-weight: 600;
    color: #1a1a2e;
  }
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const LanguageButton = styled.button`
  background-color: #f0f8ff;
  color: #1a1a2e;
  border: 2px solid #e1f5fe;
  border-radius: 4px;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e1f5fe;
    border-color: #61dafb;
  }
  
  &:focus {
    outline: none;
    border-color: #61dafb;
    box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2);
  }
`;

const languages = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'PHP',
  'Ruby',
  'Go',
  'Swift',
  'Kotlin',
  'Rust',
  'C++',
  'C',
  'Scala',
  'Perl',
  'Haskell'
];

const LanguageSelector = ({ onSelectLanguage, attempts, maxAttempts }) => {
  return (
    <SelectorContainer>
      <Title>Guess the Programming Language</Title>
      <AttemptsCounter>
        Attempt <span>{attempts + 1}</span> of <span>{maxAttempts}</span>
      </AttemptsCounter>
      
      <LanguageGrid>
        {languages.map((language, index) => (
          <LanguageButton 
            key={index} 
            onClick={() => onSelectLanguage(language)}
          >
            {language}
          </LanguageButton>
        ))}
      </LanguageGrid>
    </SelectorContainer>
  );
};

export default LanguageSelector;
