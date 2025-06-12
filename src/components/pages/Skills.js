import React from 'react';
import styled from 'styled-components';
import { 
  FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaJs, FaDatabase, 
  FaGitAlt, FaAws, FaDocker, FaPython
} from 'react-icons/fa';
import { SiTypescript, SiMongodb, SiPostgresql, SiRedux } from 'react-icons/si';

const SkillsContainer = styled.div`
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

const SkillsSection = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #1a1a2e;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const SkillCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const SkillIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #61dafb;
`;

const SkillName = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const SkillLevel = styled.div`
  width: 100%;
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  
  &:after {
    content: '';
    display: block;
    width: ${props => props.level}%;
    height: 100%;
    background-color: #61dafb;
    border-radius: 4px;
  }
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: #666;
`;

const ProjectsSection = styled.section`
  margin-bottom: 4rem;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ProjectCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const ProjectImage = styled.div`
  height: 200px;
  background-color: #f0f0f0;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
`;

const ProjectContent = styled.div`
  padding: 1.5rem;
`;

const ProjectTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
`;

const ProjectDescription = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const TechTag = styled.span`
  background-color: #f0f8ff;
  color: #61dafb;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Skills = () => {
  const frontendSkills = [
    { name: 'React', icon: <FaReact />, level: 95 },
    { name: 'JavaScript', icon: <FaJs />, level: 80 },
    { name: 'TypeScript', icon: <SiTypescript />, level: 90 },
    { name: 'HTML5', icon: <FaHtml5 />, level: 90 },
    { name: 'CSS3', icon: <FaCss3Alt />, level: 70 },
    { name: 'Redux', icon: <SiRedux />, level: 20 }
  ];
  
  const backendSkills = [
    { name: 'Node.js', icon: <FaNodeJs />, level: 85 },
    { name: 'Python', icon: <FaPython />, level: 80 },
    { name: 'MongoDB', icon: <SiMongodb />, level: 30 },
    { name: 'PostgreSQL', icon: <SiPostgresql />, level: 45 },
    { name: 'RESTful APIs', icon: <FaDatabase />, level: 80 }
  ];
  
  const devOpsSkills = [
    { name: 'Git', icon: <FaGitAlt />, level: 90 },
    { name: 'AWS', icon: <FaAws />, level: 85 },
    { name: 'Docker', icon: <FaDocker />, level: 20 }
  ];
  
  return (
    <SkillsContainer>
      <PageTitle>My Skills</PageTitle>
      
      <Introduction>
        I've developed a diverse set of skills throughout my time as a software engineer.
        My expertise spans front-end and back-end development, with a focus on creating
        responsive, efficient, and user-friendly applications.
      </Introduction>
      
      <SkillsSection>
        <SectionTitle>Front-end Development</SectionTitle>
        <SkillsGrid>
          {frontendSkills.map((skill, index) => (
            <SkillCard key={index}>
              <SkillIcon>{skill.icon}</SkillIcon>
              <SkillName>{skill.name}</SkillName>
              <SkillLevel>
                <ProgressBar level={skill.level} />
                <ProgressLabel>
                  <span>Beginner</span>
                  <span>Expert</span>
                </ProgressLabel>
              </SkillLevel>
            </SkillCard>
          ))}
        </SkillsGrid>
      </SkillsSection>
      
      <SkillsSection>
        <SectionTitle>Back-end Development</SectionTitle>
        <SkillsGrid>
          {backendSkills.map((skill, index) => (
            <SkillCard key={index}>
              <SkillIcon>{skill.icon}</SkillIcon>
              <SkillName>{skill.name}</SkillName>
              <SkillLevel>
                <ProgressBar level={skill.level} />
                <ProgressLabel>
                  <span>Beginner</span>
                  <span>Expert</span>
                </ProgressLabel>
              </SkillLevel>
            </SkillCard>
          ))}
        </SkillsGrid>
      </SkillsSection>
      
      <SkillsSection>
        <SectionTitle>DevOps & Tools</SectionTitle>
        <SkillsGrid>
          {devOpsSkills.map((skill, index) => (
            <SkillCard key={index}>
              <SkillIcon>{skill.icon}</SkillIcon>
              <SkillName>{skill.name}</SkillName>
              <SkillLevel>
                <ProgressBar level={skill.level} />
                <ProgressLabel>
                  <span>Beginner</span>
                  <span>Expert</span>
                </ProgressLabel>
              </SkillLevel>
            </SkillCard>
          ))}
        </SkillsGrid>
      </SkillsSection>
      
      <ProjectsSection>
        <SectionTitle>Featured Projects</SectionTitle>
        <ProjectsGrid>
          <ProjectCard>
            <ProjectImage image="https://via.placeholder.com/600x300" />
            <ProjectContent>
              <ProjectTitle>Coming Soon....</ProjectTitle>
              <ProjectDescription>
                Project coming soon don't tweak on kd
              </ProjectDescription>
              <TechStack>
                <TechTag>React</TechTag>
                <TechTag>Node.js</TechTag>
                <TechTag>MongoDB</TechTag>
                <TechTag>Stripe API</TechTag>
              </TechStack>
            </ProjectContent>
          </ProjectCard>
          
          <ProjectCard>
            <ProjectImage image="https://via.placeholder.com/600x300" />
            <ProjectContent>
              <ProjectTitle>Other project coming soon...</ProjectTitle>
              <ProjectDescription>
                I wonder what it will be 
              </ProjectDescription>
              <TechStack>
                <TechTag>React</TechTag>
                <TechTag>Redux</TechTag>
                <TechTag>Firebase</TechTag>
                <TechTag>Material UI</TechTag>
              </TechStack>
            </ProjectContent>
          </ProjectCard>
        </ProjectsGrid>
      </ProjectsSection>
    </SkillsContainer>
  );
};

export default Skills;
