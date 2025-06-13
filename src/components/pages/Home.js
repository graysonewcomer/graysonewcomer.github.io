import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 0;
  
  @media (min-width: 768px) {
    padding: 6rem 0;
  }
`;

const Greeting = styled.p`
  font-size: 1.2rem;
  color: #61dafb;
  margin-bottom: 1rem;
`;

const Name = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  color: #666;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  max-width: 700px;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.primary ? '#61dafb' : 'transparent'};
  color: ${props => props.primary ? '#1a1a2e' : '#61dafb'};
  border: 2px solid #61dafb;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.primary ? '#4fa8c9' : 'rgba(97, 218, 251, 0.1)'};
    transform: translateY(-2px);
  }
`;

const FeaturedSection = styled.section`
  padding: 4rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
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

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FeaturedItem = styled(Link)`
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ItemTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1a1a2e;
`;

const ItemDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
`;

const ReadMore = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #61dafb;
  font-weight: 600;
`;

const Home = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <Greeting>Hello, I'm</Greeting>
        <Name>Grayson Newcomer</Name>
        <Title>Software Engineer</Title>
        <Description>
          I'm a passionate software engineer specializing in building exceptional digital experiences. 
          Currently, I'm focused on building accessible, human-centered products.
        </Description>
        <ButtonContainer>
          <Button to="/about" primary>Learn About Me</Button>
          <Button to="/contact">Get In Touch</Button>
        </ButtonContainer>
      </HeroSection>
      
      <FeaturedSection>
        <SectionTitle>Featured</SectionTitle>
        <FeaturedGrid>
          <FeaturedItem to="/syntaxwordle">
            <ItemTitle>SyntaxWordle</ItemTitle>
            <ItemDescription>
              Test your programming language recognition skills with this fun twist on the popular word game.
              Can you identify the language from a code snippet?
            </ItemDescription>
            <ReadMore>
              Play Now <FaArrowRight />
            </ReadMore>
          </FeaturedItem>
          
          <FeaturedItem to="/skills">
            <ItemTitle>My Skills</ItemTitle>
            <ItemDescription>
              Explore my technical skills and expertise across various programming languages, 
              frameworks, and tools that I've mastered throughout my career.
            </ItemDescription>
            <ReadMore>
              View Skills <FaArrowRight />
            </ReadMore>
          </FeaturedItem>
        </FeaturedGrid>
      </FeaturedSection>
    </HomeContainer>
  );
};

export default Home;
