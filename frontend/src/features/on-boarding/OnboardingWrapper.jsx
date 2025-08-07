
import { useNavigate } from 'react-router-dom';
import { SimpleOnboarding } from './index';

export default function OnboardingWrapper() {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    navigate('/signup');
  };

  return <SimpleOnboarding onComplete={handleOnboardingComplete} />;
}
