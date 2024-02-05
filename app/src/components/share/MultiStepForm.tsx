import React, { ReactElement, useState, useEffect } from "react";
import { Button, Typography } from '@mui/material'
import styled from 'styled-components'
import HorizontalLayout from "../layout/HorizontalLayout";
import VerticalLayout from "../layout/VerticalLayout";

export interface StepProp {
  step: number;
  label: string;
}

export default function MultiStepForm ({
  stepProps,
  stepForms
}: {
  stepProps: StepProp[],
  stepForms: ReactElement[]
}) {
    const {
        activeStep,
        activeStepForm,
        isFirstStep,
        isLastStep,
        goto,
        nextStep,
        prevStep
    } = MultiStepFormHelper( {stepProps: stepProps, stepForms: stepForms })

    const progressBarProps = {
      stepProps:stepProps, 
      activeStep: activeStep, 
      nextStep: nextStep, 
      prevStep: prevStep
    }

    useEffect( () => {
      console.log("active step form", activeStepForm)
    }, [activeStepForm])

    return (
      <MainContainer>
        <HorizontalLayout style={{ height: '80%', marginTop: '10%'}}>
          <ProgressBar { ...progressBarProps } />

          <StepFormArea> { activeStepForm } </StepFormArea>
        </HorizontalLayout>
        
        <ButtonsContainer>
          <ButtonStyle onClick={prevStep} disabled={activeStep === 1}>
            Previous
          </ButtonStyle>
          <ButtonStyle onClick={nextStep} disabled={activeStep === stepProps.length}>
            Next
          </ButtonStyle>
        </ButtonsContainer>        
      </MainContainer>

    )
}



export function MultiStepFormHelper ({
  stepProps,
  stepForms
}: {
  stepProps: StepProp[],
  stepForms: ReactElement[]
}) {
  const [activeStep, setActiveStep] = useState<number>(1)

  const nextStep = () => {
    setActiveStep( (activeStep >= stepProps.length) ? activeStep : (activeStep + 1) )
  }

  const prevStep = () => {
    setActiveStep( (activeStep <= 1) ? activeStep : (activeStep - 1) )
  }

  function goto(index: number) {
    setActiveStep(index)
  }

  return {
      activeStep,
      activeStepForm: stepForms[activeStep - 1],
      isFirstStep: activeStep === 1,
      isLastStep: activeStep === stepProps.length,
      goto,
      nextStep,
      prevStep
  }
}

const ProgressBar = ({
  stepProps,
  activeStep,
  nextStep,
  prevStep
}: {
  stepProps: StepProp[],
  activeStep: number,
  nextStep: () => void,
  prevStep: () => void
}) => {
  return (
    <div style={{ width: '30%' }}>
      <StepContainer>
        {stepProps.map((stepProp) => (
          <StepWrapper key={stepProp.step} isActive={activeStep === stepProp.step}>
            <StepStyle step={activeStep >= stepProp.step ? 'completed' : 'incomplete'}>
              {activeStep > stepProp.step ? (
                <CheckMark>L</CheckMark>
              ) : (
                <StepCount>{stepProp.step}</StepCount>
              )}
            </StepStyle>
            <StepsLabelContainer>
              <StepLabel key={stepProp.step}> { stepProp.label } </StepLabel>
            </StepsLabelContainer>
          </StepWrapper>
        ))}
      </StepContainer>
    </div> 
  )
}

const StepFormArea = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return(
    <VerticalLayout style={{ background: 'lightblue', width: '60%' }}>
      {children}
    </VerticalLayout>
  )
}

const MainContainer = styled.div`
  height: 600px;
  margin-left: 10%;
`

const StepCount = styled.span`
  font-size: 19px;
  color: #f3e7f3;
`

const StepsLabelContainer = styled.div`
  position: relative;
  top: 20px;
  left: 10%;
  transform: translate(0, -50%);
`

const ButtonsContainer = styled.div`
  width: 60%;
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-left: 30%;
`

const ButtonStyle = styled.button`
  border-radius: 4px;
  border: 0;
  background: #4a154b;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  width: 90px;
  :active {
    transform: scale(0.98);
  }
  :disabled {
    background: #f3e7f3;
    color: #000000;
    cursor: not-allowed;
  }
`
const CheckMark = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: #4a154b;
  -ms-transform: scaleX(-1) rotate(-46deg); /* IE 9 */
  -webkit-transform: scaleX(-1) rotate(-46deg); /* Chrome, Safari, Opera */
  transform: scaleX(-1) rotate(-46deg);
`

const StepContainer = ({ 
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) =>  {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      backgroundColor: 'white',
      ...style,
    }}>
      { children }
    </div>
  )
}

const StepStyle = ({ 
  children,
  step,
}: {
  children: React.ReactNode
  step: string
}) => {
  const borderColor = step === 'completed' ? '#4A154B' : '#F3E7F3';

  return (
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      border: `3px solid ${borderColor}`, 
      // transition: '0.4s ease',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      { children }
    </div>
  )
}

const StepLabel = ({
  children,
  key
}: {
  children: React.ReactNode
  key: number
}) => {
  return (
    <Typography key={key} variant="body1" color="#4a154b" className="">
      { children }
    </Typography>
  )
}

interface StepWrapperProps {
  isActive: boolean;
  children: React.ReactNode;
}

const StepWrapper: React.FC<StepWrapperProps> = ({ isActive, children }) => {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        padding: '20px',
        margin: '0px',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        backgroundColor: isActive ? 'lightblue' : 'transparent',
      }}
    >
      {children}
    </div>
  )
};