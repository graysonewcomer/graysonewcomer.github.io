import React from 'react';
import styled from 'styled-components';
import { FaBriefcase, FaGraduationCap, FaCertificate, FaCode } from 'react-icons/fa';

const ExperienceContainer = styled.div`
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

const Introduction = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
`;

const TimelineSection = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: #61dafb;
  }
`;

const Timeline = styled.div`
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: 20px;
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
  padding-left: 60px;
  margin-bottom: 3rem;
  
  @media (min-width: 768px) {
    width: 50%;
    padding-left: 0;
    padding-right: 40px;
    margin-left: ${props => props.position === 'right' ? '50%' : '0'};
    padding-left: ${props => props.position === 'right' ? '40px' : '0'};
    padding-right: ${props => props.position === 'left' ? '40px' : '0'};
    text-align: ${props => props.position === 'left' ? 'right' : 'left'};
  }
`;

const TimelineMarker = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #61dafb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #61dafb;
  font-size: 1.2rem;
  z-index: 1;
  
  @media (min-width: 768px) {
    left: ${props => props.position === 'right' ? '-20px' : 'auto'};
    right: ${props => props.position === 'left' ? '-20px' : 'auto'};
  }
`;

const TimelineContent = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

const TimelineDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
`;

const SkillsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    justify-content: ${props => props.position === 'left' ? 'flex-end' : 'flex-start'};
  }
`;

const SkillTag = styled.li`
  background-color: #f0f8ff;
  color: #61dafb;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Experience = () => {
  return (
    <ExperienceContainer>
      <PageTitle>Experience</PageTitle>
      
      <Introduction>
        My professional journey has equipped me with a diverse set of experiences across different 
        roles and industries. Here's a look at my career path and the skills I've developed along the way.
      </Introduction>
      
      <TimelineSection>
        <SectionTitle>
          <FaBriefcase /> Work Experience
        </SectionTitle>
        
        <Timeline>
          <TimelineItem position="left">
            <TimelineMarker position="left">
              <FaBriefcase />
            </TimelineMarker>
            <TimelineContent>
              <TimelineDate>Aug 2024 - Present</TimelineDate>
              <TimelineTitle>Software Development Engineer I</TimelineTitle>
              <TimelineSubtitle>Amazon</TimelineSubtitle>
              <TimelineDescription>
                Implementing best practices in development as knowledge increases
              on various cloud technologies and development methodologies.
              </TimelineDescription>
              <SkillsList position="left">
                <SkillTag>React</SkillTag>
                <SkillTag>Java</SkillTag>
                <SkillTag>AWS</SkillTag>
                <SkillTag>Microservices</SkillTag>
              </SkillsList>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem position="right">
            <TimelineMarker position="right">
              <FaBriefcase />
            </TimelineMarker>
            <TimelineContent>
              <TimelineDate>May 2023 - Aug 2023</TimelineDate>
              <TimelineTitle>Software Development Engineer Intern</TimelineTitle>
              <TimelineSubtitle>Digital Solutions Co.</TimelineSubtitle>
              <TimelineDescription>
                Developed a tool to automate a workflow across several cloud-based
              tools for smoother processes when working with vendors.
              </TimelineDescription>
              <SkillsList position="right">
                <SkillTag>React</SkillTag>
                <SkillTag>Java</SkillTag>
                <SkillTag>AWS</SkillTag>
                <SkillTag>Microservices</SkillTag>
              </SkillsList>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </TimelineSection>
      
      <TimelineSection>
        <SectionTitle>
          <FaGraduationCap /> Education
        </SectionTitle>
        
        <Timeline>
          <TimelineItem position="right">
            <TimelineMarker position="right">
              <FaGraduationCap />
            </TimelineMarker>
            <TimelineContent>
              <TimelineDate>2013 - 2017</TimelineDate>
              <TimelineTitle>Bachelor of Science in Computer Science</TimelineTitle>
              <TimelineSubtitle>University of Technology</TimelineSubtitle>
              <TimelineDescription>
                Graduated with honors. Specialized in software engineering and data structures. 
                Completed a capstone project developing a real-time collaborative coding platform.
              </TimelineDescription>
              <SkillsList position="right">
                <SkillTag>Algorithms</SkillTag>
                <SkillTag>Data Structures</SkillTag>
                <SkillTag>Software Design</SkillTag>
                <SkillTag>Java</SkillTag>
              </SkillsList>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </TimelineSection>
      
      <TimelineSection>
        <SectionTitle>
          <FaCertificate /> Certifications
        </SectionTitle>
        
        <Timeline>
          <TimelineItem position="left">
            <TimelineMarker position="left">
              <FaCertificate />
            </TimelineMarker>
            <TimelineContent>
              <TimelineDate>2020</TimelineDate>
              <TimelineTitle>AWS Certified Solutions Architect</TimelineTitle>
              <TimelineSubtitle>Amazon Web Services</TimelineSubtitle>
              <TimelineDescription>
                Professional certification in designing distributed systems on AWS. 
                Developed expertise in creating cost-efficient, secure, and reliable applications.
              </TimelineDescription>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem position="right">
            <TimelineMarker position="right">
              <FaCertificate />
            </TimelineMarker>
            <TimelineContent>
              <TimelineDate>2018</TimelineDate>
              <TimelineTitle>Certified Scrum Master</TimelineTitle>
              <TimelineSubtitle>Scrum Alliance</TimelineSubtitle>
              <TimelineDescription>
                Certification in Agile project management methodologies, focusing on 
                team facilitation, sprint planning, and continuous improvement.
              </TimelineDescription>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </TimelineSection>
      
      <TimelineSection>
        <SectionTitle>
          <FaCode /> Projects
        </SectionTitle>
        
        <Timeline>
          <TimelineItem position="left">
            <TimelineMarker position="left">
              <FaCode />
            </TimelineMarker>
            <TimelineContent>
              <TimelineDate>2021</TimelineDate>
              <TimelineTitle>E-commerce Platform</TimelineTitle>
              <TimelineDescription>
                Developed a full-featured e-commerce platform with product management, 
                shopping cart, and payment processing capabilities. Implemented responsive 
                design and optimized for mobile devices.
              </TimelineDescription>
              <SkillsList position="left">
                <SkillTag>React</SkillTag>
                <SkillTag>Node.js</SkillTag>
                <SkillTag>MongoDB</SkillTag>
                <SkillTag>Stripe API</SkillTag>
              </SkillsList>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem position="right">
            <TimelineMarker position="right">
              <FaCode />
            </TimelineMarker>
            <TimelineContent>
              <TimelineDate>2020</TimelineDate>
              <TimelineTitle>Task Management App</TimelineTitle>
              <TimelineDescription>
                Created a collaborative task management application with real-time updates, 
                user authentication, and team workspaces. Implemented drag-and-drop functionality 
                for intuitive task organization.
              </TimelineDescription>
              <SkillsList position="right">
                <SkillTag>React</SkillTag>
                <SkillTag>Redux</SkillTag>
                <SkillTag>Firebase</SkillTag>
                <SkillTag>Material UI</SkillTag>
              </SkillsList>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </TimelineSection>
    </ExperienceContainer>
  );
};

export default Experience;
