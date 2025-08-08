import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

export default function Welcome({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      title: "Welcome\nTo AMBAG",
      buttonText: "Get Started",
      image: "👋",
      description: ""
    },
    {
      title: (
        <>
          Split <span className="text-yellow-400">bills</span>, not <span className="text-yellow-400">friendships</span>.
        </>
      ),
      buttonText: "Next",
      image: "💰",
      description: "Manage group expenses and contributions easily"
    },
    {
      title: (
        <>
          Turn shared <span className="text-yellow-400">expenses</span> into shared <span className="text-yellow-400">success</span>.
        </>
      ),
      buttonText: "Next", 
      image: "📊",
      description: "Track goals and achievements together"
    },
    {
      title: (
        <>
          <span className="text-yellow-400">Assign</span>.<br/>
          <span className="text-yellow-400">Remind</span>.<br/>
          <span className="text-yellow-400">Collect</span>. All in one tap
        </>
      ),
      buttonText: "Next",
      image: "✅",
      description: "Streamlined group financial management"
    }
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and navigate
      onComplete && onComplete();
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-yellow-300 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Image/Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-white/20 rounded-3xl flex items-center justify-center text-6xl mb-4">
            {currentStepData.image}
          </div>
        </div>

        {/* Title */}
        <Typography 
          variant="h3" 
          className="font-bold mb-4 leading-tight"
          component="div"
        >
          {currentStepData.title}
        </Typography>

        {/* Description */}
        {currentStepData.description && (
          <Typography variant="body1" className="text-white/80 mb-8">
            {currentStepData.description}
          </Typography>
        )}

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-yellow-400 w-8' 
                  : index < currentStep 
                    ? 'bg-white' 
                    : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleNext}
          variant="contained"
          size="large"
          endIcon={<ChevronRight />}
          sx={{
            backgroundColor: '#FFD700',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            py: 2,
            px: 4,
            borderRadius: 3,
            '&:hover': {
              backgroundColor: '#FFC107',
            },
            minWidth: 200
          }}
        >
          {currentStepData.buttonText}
        </Button>

        {/* Skip Option */}
        {currentStep < onboardingSteps.length - 1 && (
          <Button
            onClick={() => setCurrentStep(onboardingSteps.length - 1)}
            variant="text"
            sx={{
              color: 'white',
              mt: 2,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Skip
          </Button>
        )}
      </div>

      {/* Bottom Navigation Dots (Alternative) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-3">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-yellow-400 scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
