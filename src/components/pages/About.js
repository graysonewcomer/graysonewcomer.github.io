import React from 'react';
import styled from 'styled-components';
import { FaDownload } from 'react-icons/fa';

const AboutContainer = styled.div`
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

const AboutSection = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
    align-items: start;
  }
`;

const ProfileImage = styled.div`
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
  
  img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const AboutContent = styled.div`
  p {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    line-height: 1.8;
  }
`;

const ResumeButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #61dafb;
  color: #1a1a2e;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background-color: #4fa8c9;
    transform: translateY(-2px);
  }
`;

const TimelineSection = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #1a1a2e;
`;

const Timeline = styled.div`
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 2px;
    height: 100%;
    background-color: #e0e0e0;
    
    @media (min-width: 768px) {
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const TimelineItem = styled.div`
  position: relative;
  padding-left: 2rem;
  margin-bottom: 3rem;
  
  @media (min-width: 768px) {
    width: 50%;
    padding-left: 0;
    padding-right: 2rem;
    margin-left: ${props => props.position === 'right' ? '50%' : '0'};
    padding-left: ${props => props.position === 'right' ? '2rem' : '0'};
    padding-right: ${props => props.position === 'left' ? '2rem' : '0'};
    text-align: ${props => props.position === 'left' ? 'right' : 'left'};
  }
  
  &:before {
    content: '';
    position: absolute;
    left: -8px;
    top: 0;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #61dafb;
    
    @media (min-width: 768px) {
      left: ${props => props.position === 'right' ? '-9px' : 'auto'};
      right: ${props => props.position === 'left' ? '-9px' : 'auto'};
    }
  }
`;

const TimelineDate = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #61dafb;
  margin-bottom: 0.5rem;
`;

const TimelineTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
`;

const TimelineSubtitle = styled.h4`
  font-size: 1.1rem;
  color: #666;
  font-weight: 400;
  margin-bottom: 1rem;
`;

const TimelineContent = styled.p`
  font-size: 1rem;
  line-height: 1.6;
`;

const About = () => {
  return (
    <AboutContainer>
      <PageTitle>About Me</PageTitle>
      
      <AboutSection>
        <ProfileImage>
          <img src="https://via.placeholder.com/350x350" alt="Grayson Newcomer" />
        </ProfileImage>
        
        <AboutContent>
          <p>
            Hello! I'm Grayson, a Software Development Engineer I at Amazon who is passionate about creating technology that makes a positive impact. 
            With a Bachelor's degree and a little over a year of experience in the field, I specialize in full-stack development, focusing on 
            building scalable, efficient, and user-friendly applications.
          </p>
          
          <p>
            My journey in software engineering began during my college years when I discovered my love for 
            problem-solving through code. Since then, I've worked with various technologies and frameworks, 
            constantly expanding my knowledge and skills to stay at the forefront of this fast-paced industry.
          </p>
          
          <p>
            I believe in writing clean, maintainable code and creating intuitive user experiences. My approach 
            combines technical expertise with a deep understanding of user needs, resulting in solutions that 
            are both powerful and accessible.
          </p>
          
          <p>
            When I'm not coding, you can find me working out & lifting weights, playing the guitar, or experimenting 
            with new recipes in the kitchen. I'm also an avid learner, always exploring new technologies and concepts.
          </p>
          
          <ResumeButton href="/Grayson_Newcomer_2024cr.pdf" target="_blank" rel="noopener noreferrer">
            <FaDownload /> Download Resume
          </ResumeButton>
        </AboutContent>
      </AboutSection>
      
      <TimelineSection>
        <SectionTitle>Experience</SectionTitle>
        
        <Timeline>
          <TimelineItem position="left">
            <TimelineDate>Aug 2024 - Present</TimelineDate>
            <TimelineTitle>Software Development Engineer I</TimelineTitle>
            <TimelineSubtitle>Amazon</TimelineSubtitle>
            <TimelineContent>
              Implementing best practices in development as knowledge increases
              on various cloud technologies and development methodologies.
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem position="right">
            <TimelineDate>May 2023 - Aug 2023</TimelineDate>
            <TimelineTitle>Software Development Engineer Intern</TimelineTitle>
            <TimelineSubtitle>Amazon</TimelineSubtitle>
            <TimelineContent>
              Developed a tool to automate a workflow across several cloud-based
              tools for smoother processes when working with vendors.
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </TimelineSection>
      
      <TimelineSection>
        <SectionTitle>Education</SectionTitle>
        
        <Timeline>
          <TimelineItem position="right">
            <TimelineDate>2021 - 2024</TimelineDate>
            <TimelineTitle>Bachelor of Science in Computer Science</TimelineTitle>
            <TimelineSubtitle>Illinois State University - Normal, IL</TimelineSubtitle>
            <TimelineContent>
              Graduated Summa Cum Laude with a GPA of 3.98, specializing in full-stack development
              and machine learning.
            </TimelineContent>
          </TimelineItem>
        
        </Timeline>
      </TimelineSection>
    </AboutContainer>
  );
};

export default About;
