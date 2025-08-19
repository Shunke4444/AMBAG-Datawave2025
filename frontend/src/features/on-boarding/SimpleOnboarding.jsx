import React, { useState } from 'react';
import { Button } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import image1 from '../../assets/images/1.png';
import image2 from '../../assets/images/2.png';
import image3 from '../../assets/images/3.png';
import AMBAG_LOGO from '../../assets/AMBAG_LOGO.png';

export default function SimpleOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const GroupEntryModal = React.lazy(() => import('./GroupEntryModal'));

  const onboardingSteps = [
    {
      title: "Welcome\nTo AMBAG",
      buttonText: "Get Started",
      image: image1,
      isWelcome: true
    },
    {
      title: (
        <>
          Split <span className="text-yellow-400">bills</span>, not <span className="text-yellow-400">friendships</span>.
        </>
      ),
      buttonText: "Next",
      image: image2
    },
    {
      title: (
        <>
          Turn shared <span className="text-yellow-400">expenses</span> into shared <span className="text-yellow-400">success</span>.
        </>
      ),
      buttonText: "Next",
      image: image3
    },
    {
      title: (
        <>
          <span className="text-yellow-400">Assign</span>.<br/>
          <span className="text-yellow-400">Remind</span>.<br/>
          <span className="text-yellow-400">Collect</span>. <br/>All in one tap
        </>
      ),
      buttonText: "Find your new AMBAG-Pals!",
      image: image3 
    }
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowGroupModal(true);
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex flex-col p-6 text-white relative overflow-hidden">
      <React.Suspense fallback={null}>
        {showGroupModal && (
          <GroupEntryModal
            open={showGroupModal}
            onClose={() => setShowGroupModal(false)}
            onCreate={() => {/* handle create group */}}
            onJoin={() => {/* handle join group */}}
          />
        )}
      </React.Suspense>
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-yellow-300 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200 rounded-full"></div>
      </div>
      
      {/* Top Logo */}
      <header className="flex justify-center py-6 z-10 relative">
        <img src={AMBAG_LOGO} alt="AMBAG Logo" className="h-12 w-auto" />
      </header>

      {/* Top section - Image */}
      <section className="flex-1 flex items-center justify-center relative z-10">
        <figure className="w-80 h-80 relative">
          <img 
            src={currentStepData.image} 
            alt={`Onboarding illustration for step ${currentStep + 1}: ${
              typeof currentStepData.title === 'string' 
                ? currentStepData.title.replace('\n', ' ') 
                : 'AMBAG onboarding step'
            }`}
            className="w-full h-full object-contain"
          />
        </figure>
      </section>

      {/* Bottom section - Content */}
      <section className="relative z-10 text-center space-y-6">
        {/* Title */}
        <header>
          <h1 
            className={`font-bold leading-tight ${currentStepData.isWelcome ? 'text-4xl' : 'text-3xl'}`}
          >
            {currentStepData.title}
          </h1>
        </header>

        {/* Step indicators */}
        <nav aria-label="Onboarding progress" className="flex justify-center space-x-2 py-4">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              role="progressbar"
              aria-valuenow={currentStep + 1}
              aria-valuemin={1}
              aria-valuemax={onboardingSteps.length}
              aria-label={`Step ${index + 1} of ${onboardingSteps.length}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-yellow-400 w-8' 
                  : index < currentStep 
                    ? 'bg-white' 
                    : 'bg-white/30'
              }`}
            />
          ))}
        </nav>

        {/* Action button */}
        <footer className="pb-8 flex flex-col items-center gap-4">
          {currentStep !== onboardingSteps.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              size="large"
              endIcon={<ChevronRight />}
              aria-label={`Continue to step ${currentStep + 2} of ${onboardingSteps.length}`}
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
          ) : (
            <Button
              onClick={() => setShowGroupModal(true)}
              variant="contained"
              size="large"
              endIcon={<ChevronRight />}
              aria-label="Find your new AMBAG Pals!"
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
              Find your new AMBAG Pals!
            </Button>
          )}
        </footer>
      </section>
    </main>
  );
}
