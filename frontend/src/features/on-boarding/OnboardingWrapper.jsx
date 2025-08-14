
import { useNavigate } from 'react-router-dom';
import { SimpleOnboarding } from './index';

export default function OnboardingWrapper() {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    navigate('/login');
  };

  return <SimpleOnboarding onComplete={handleOnboardingComplete} />;
}
