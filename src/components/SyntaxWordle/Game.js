import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import CodeDisplay from './CodeDisplay';
import LanguageSelector from './LanguageSelector';
import GameStats from './GameStats';
import Instructions from './Instructions';
import { getCodeSnippetForDay } from '../../utils/gameLogic';

const GameContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const DailyChallenge = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const DateSpan = styled.span`
  color: #61dafb;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#61dafb' : '#f0f8ff'};
  color: ${props => props.primary ? '#1a1a2e' : '#61dafb'};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.primary ? '#4fa8c9' : '#e1f5fe'};
  }
`;

const GameContent = styled.div`
  margin-bottom: 2rem;
`;

const ResultMessage = styled.div`
  text-align: center;
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: 600;
  background-color: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
`;

const LanguageReveal = styled.div`
  text-align: center;
  margin-top: 1rem;
  font-size: 1.1rem;
  
  span {
    font-weight: 600;
    color: #61dafb;
  }
`;

const ShareButton = styled(Button)`
  display: block;
  margin: 2rem auto 0;
`;

const Game = () => {
  const [gameState, setGameState] = useState({
    currentSnippet: null,
    guessedLanguage: null,
    attempts: 0,
    maxAttempts: 3,
    gameOver: false,
    gameWon: false,
    showStats: false,
    showInstructions: false,
    stats: {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: {
        1: 0,
        2: 0,
        3: 0
      }
    }
  });
  
  useEffect(() => {
    // Load saved stats from localStorage
    const savedStats = localStorage.getItem('syntaxWordleStats');
    if (savedStats) {
      setGameState(prev => ({
        ...prev,
        stats: JSON.parse(savedStats)
      }));
    }
    
    // Get today's code snippet
    const todaySnippet = getCodeSnippetForDay();
    setGameState(prev => ({
      ...prev,
      currentSnippet: todaySnippet
    }));
    
    // Check if already played today
    const lastPlayed = localStorage.getItem('syntaxWordleLastPlayed');
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (lastPlayed === today) {
      const result = localStorage.getItem('syntaxWordleResult');
      if (result) {
        const { guessedLanguage, attempts, gameWon } = JSON.parse(result);
        setGameState(prev => ({
          ...prev,
          guessedLanguage,
          attempts,
          gameOver: true,
          gameWon
        }));
      }
    }
  }, []);
  
  const handleGuess = (language) => {
    const newAttempts = gameState.attempts + 1;
    const isCorrect = language === gameState.currentSnippet.language;
    const gameOver = isCorrect || newAttempts >= gameState.maxAttempts;
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      guessedLanguage: language,
      attempts: newAttempts,
      gameOver,
      gameWon: isCorrect
    }));
    
    // If game is over, update stats
    if (gameOver) {
      const newStats = { ...gameState.stats };
      newStats.played += 1;
      
      if (isCorrect) {
        newStats.won += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
        newStats.guessDistribution[newAttempts] += 1;
      } else {
        newStats.currentStreak = 0;
      }
      
      setGameState(prev => ({
        ...prev,
        stats: newStats
      }));
      
      // Save stats to localStorage
      localStorage.setItem('syntaxWordleStats', JSON.stringify(newStats));
      localStorage.setItem('syntaxWordleLastPlayed', format(new Date(), 'yyyy-MM-dd'));
      localStorage.setItem('syntaxWordleResult', JSON.stringify({
        guessedLanguage: language,
        attempts: newAttempts,
        gameWon: isCorrect
      }));
    }
  };
  
  const toggleStats = () => {
    setGameState(prev => ({
      ...prev,
      showStats: !prev.showStats,
      showInstructions: false
    }));
  };
  
  const toggleInstructions = () => {
    setGameState(prev => ({
      ...prev,
      showInstructions: !prev.showInstructions,
      showStats: false
    }));
  };
  
  const shareResults = () => {
    const { gameWon, attempts, maxAttempts, currentSnippet } = gameState;
    
    let resultText = `SyntaxWordle ${format(new Date(), 'yyyy-MM-dd')}\n`;
    resultText += gameWon ? `Solved in ${attempts}/${maxAttempts} attempts!\n` : 'Not solved\n';
    
    // Add emoji grid
    for (let i = 1; i <= maxAttempts; i++) {
      if (i <= attempts) {
        resultText += i === attempts && gameWon ? '🟩' : '🟥';
      } else {
        resultText += '⬜';
      }
    }
    
    resultText += `\nLanguage: ${currentSnippet.language}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(resultText)
      .then(() => {
        alert('Results copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy results: ', err);
      });
  };
  
  if (!gameState.currentSnippet) {
    return <GameContainer>Loading today's challenge...</GameContainer>;
  }
  
  return (
    <GameContainer>
      <GameHeader>
        <DailyChallenge>
          Daily Challenge: <DateSpan>{format(new Date(), 'MMMM d, yyyy')}</DateSpan>
        </DailyChallenge>
        <ButtonsContainer>
          <Button onClick={toggleInstructions}>How to Play</Button>
          <Button onClick={toggleStats}>Stats</Button>
        </ButtonsContainer>
      </GameHeader>
      
      {gameState.showInstructions && (
        <Instructions onClose={toggleInstructions} />
      )}
      
      {gameState.showStats && (
        <GameStats stats={gameState.stats} onClose={toggleStats} />
      )}
      
      {!gameState.showInstructions && !gameState.showStats && (
        <GameContent>
          <CodeDisplay code={gameState.currentSnippet.code} />
          
          {gameState.gameOver ? (
            <>
              {gameState.gameWon ? (
                <ResultMessage success>
                  Correct! You guessed the language in {gameState.attempts} {gameState.attempts === 1 ? 'attempt' : 'attempts'}.
                </ResultMessage>
              ) : (
                <ResultMessage>
                  Sorry, you've used all your attempts.
                </ResultMessage>
              )}
              
              <LanguageReveal>
                The language was <span>{gameState.currentSnippet.language}</span>
              </LanguageReveal>
              
              <ShareButton primary onClick={shareResults}>
                Share Results
              </ShareButton>
            </>
          ) : (
            <LanguageSelector 
              onSelectLanguage={handleGuess} 
              attempts={gameState.attempts}
              maxAttempts={gameState.maxAttempts}
            />
          )}
        </GameContent>
      )}
    </GameContainer>
  );
};

export default Game;
