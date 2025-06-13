import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

const StatsContainer = styled.div`
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

const StatsTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #1a1a2e;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #61dafb;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-align: center;
`;

const DistributionTitle = styled.h4`
  font-size: 1.2rem;
  margin: 2rem 0 1rem;
  text-align: center;
  color: #1a1a2e;
`;

const DistributionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DistributionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DistributionLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  width: 20px;
  text-align: center;
`;

const DistributionBar = styled.div`
  flex: 1;
  height: 20px;
  background-color: ${props => props.active ? '#61dafb' : '#e0e0e0'};
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.percentage}%;
    background-color: #61dafb;
  }
`;

const DistributionCount = styled.div`
  font-size: 0.9rem;
  color: #666;
  width: 30px;
  text-align: right;
`;

const GameStats = ({ stats, onClose }) => {
  const { played, won, currentStreak, maxStreak, guessDistribution } = stats;
  const winPercentage = played > 0 ? Math.round((won / played) * 100) : 0;
  
  // Calculate the maximum value in the distribution for scaling
  const maxDistribution = Math.max(...Object.values(guessDistribution), 1);
  
  return (
    <StatsContainer>
      <CloseButton onClick={onClose}>
        <FaTimes />
      </CloseButton>
      
      <StatsTitle>Statistics</StatsTitle>
      
      <StatsGrid>
        <StatBox>
          <StatNumber>{played}</StatNumber>
          <StatLabel>Games Played</StatLabel>
        </StatBox>
        
        <StatBox>
          <StatNumber>{winPercentage}%</StatNumber>
          <StatLabel>Win Rate</StatLabel>
        </StatBox>
        
        <StatBox>
          <StatNumber>{currentStreak}</StatNumber>
          <StatLabel>Current Streak</StatLabel>
        </StatBox>
        
        <StatBox>
          <StatNumber>{maxStreak}</StatNumber>
          <StatLabel>Max Streak</StatLabel>
        </StatBox>
      </StatsGrid>
      
      <DistributionTitle>Guess Distribution</DistributionTitle>
      
      <DistributionContainer>
        {Object.entries(guessDistribution).map(([attempt, count]) => (
          <DistributionRow key={attempt}>
            <DistributionLabel>{attempt}</DistributionLabel>
            <DistributionBar 
              active={count > 0}
              percentage={(count / maxDistribution) * 100}
            />
            <DistributionCount>{count}</DistributionCount>
          </DistributionRow>
        ))}
      </DistributionContainer>
    </StatsContainer>
  );
};

export default GameStats;
