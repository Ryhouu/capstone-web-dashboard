import { Box, Button, Typography } from "@mui/material";
import * as React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Paper from '@mui/material/Paper';

export type StepItem = {
    label: string;
    description: string;
    children: React.ReactNode;
    continueLabel: string | null;
    handleNext: () => void
};

export default function VerticalLinearStepper({
    steps,
    completedChildren
}: {
    steps: StepItem[],
    completedChildren?: React.ReactNode
}) {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ maxWidth: "80ch" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === (steps.length - 1) ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              { step.label }
            </StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
              { step.children }
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                      variant="contained"
                      onClick={() => {
                        step.handleNext()
                        handleNext()
                      }}
                      sx={{ mt: 1, mr: 1 }}
                  >
                  {
                    step.continueLabel ? 
                      step.continueLabel :
                      (index === steps.length - 1 ? 'Finish' : 'Continue')
                  }
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={3} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          { completedChildren }
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
          <Button
            onClick={handleBack}
            sx={{ mt: 1, mr: 1 }}
          >
            Back
          </Button>
        </Paper>
      )}
    </Box>
  );
}
