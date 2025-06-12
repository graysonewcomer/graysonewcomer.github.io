import React from 'react';
import styled from 'styled-components';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodeContainer = styled.div`
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const CodeHeader = styled.div`
  background-color: #282c34;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CodeTitle = styled.div`
  color: #abb2bf;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
`;

const CodeDots = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

const StyledSyntaxHighlighter = styled(SyntaxHighlighter)`
  margin: 0 !important;
  padding: 1.5rem !important;
  font-family: 'Fira Code', monospace !important;
  font-size: 0.9rem !important;
  line-height: 1.5 !important;
  max-height: 400px;
  overflow-y: auto;
`;

const CodeDisplay = ({ code }) => {
  return (
    <CodeContainer>
      <CodeHeader>
        <CodeTitle>code-snippet.txt</CodeTitle>
        <CodeDots>
          <Dot color="#ff5f56" />
          <Dot color="#ffbd2e" />
          <Dot color="#27c93f" />
        </CodeDots>
      </CodeHeader>
      <StyledSyntaxHighlighter
        language="javascript" // Default language for highlighting
        style={atomOneDark}
        showLineNumbers
      >
        {code}
      </StyledSyntaxHighlighter>
    </CodeContainer>
  );
};

export default CodeDisplay;
