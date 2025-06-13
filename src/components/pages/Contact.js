import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

const ContactContainer = styled.div`
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

const ContactSection = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ContactForm = styled.form`
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #1a1a2e;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #61dafb;
    box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #61dafb;
    box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2);
  }
`;

const SubmitButton = styled.button`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #61dafb;
  color: #1a1a2e;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #4fa8c9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContactInfo = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const InfoTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #1a1a2e;
`;

const InfoList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const InfoItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const InfoIcon = styled.div`
  font-size: 1.2rem;
  color: #61dafb;
  margin-right: 1rem;
  margin-top: 0.2rem;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
`;

const InfoText = styled.p`
  color: #666;
  line-height: 1.6;
`;

const SocialLinks = styled.div`
  margin-top: 2rem;
`;

const SocialTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #f0f8ff;
  color: #61dafb;
  border-radius: 50%;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #61dafb;
    color: #fff;
    transform: translateY(-3px);
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    success: false,
    error: false
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, success: false, error: false });
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus({ submitting: false, success: true, error: false });
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, success: false }));
      }, 5000);
    }, 1500);
  };
  
  return (
    <ContactContainer>
      <PageTitle>Contact Me</PageTitle>
      
      <Introduction>
        I'm always interested in hearing about new projects and opportunities. 
        Whether you have a question or just want to say hi, I'll try my best to get back to you!
      </Introduction>
      
      <ContactSection>
        <ContactForm onSubmit={handleSubmit}>
          <FormTitle>Send Me a Message</FormTitle>
          
          {formStatus.success && (
            <SuccessMessage>
              Thank you for your message! I'll get back to you as soon as possible.
            </SuccessMessage>
          )}
          
          {formStatus.error && (
            <ErrorMessage>
              Something went wrong. Please try again later.
            </ErrorMessage>
          )}
          
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="subject">Subject</Label>
            <Input 
              type="text" 
              id="subject" 
              name="subject" 
              value={formData.subject} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="message">Message</Label>
            <TextArea 
              id="message" 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>
          
          <SubmitButton type="submit" disabled={formStatus.submitting}>
            {formStatus.submitting ? 'Sending...' : 'Send Message'}
          </SubmitButton>
        </ContactForm>
        
        <ContactInfo>
          <InfoTitle>Contact Information</InfoTitle>
          
          <InfoList>
            <InfoItem>
              <InfoIcon>
                <FaEnvelope />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Email</InfoLabel>
                <InfoText>grayson.newcomer@gmail.com</InfoText>
              </InfoContent>
            </InfoItem>
            
            <InfoItem>
              <InfoIcon>
                <FaPhone />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Phone</InfoLabel>
                <InfoText>amos graysonnewcomer</InfoText>
              </InfoContent>
            </InfoItem>
            
            <InfoItem>
              <InfoIcon>
                <FaMapMarkerAlt />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Location</InfoLabel>
                <InfoText>Bellevue, Washington</InfoText>
              </InfoContent>
            </InfoItem>
          </InfoList>
          
          <SocialLinks>
            <SocialTitle>Connect With Me</SocialTitle>
            <SocialIcons>
              <SocialIcon href="https://github.com/graysonewcomer" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub />
              </SocialIcon>
              <SocialIcon href="https://linkedin.com/in/grayson-newcomer" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </SocialIcon>
              <SocialIcon href="https://www.instagram.com/grayson_newcomer" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </SocialIcon>
            </SocialIcons>
          </SocialLinks>
        </ContactInfo>
      </ContactSection>
    </ContactContainer>
  );
};

export default Contact;
