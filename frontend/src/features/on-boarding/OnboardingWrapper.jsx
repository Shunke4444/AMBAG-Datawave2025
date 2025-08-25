

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { api } from '../../lib/api';
import { SimpleOnboarding } from './index';

export default function OnboardingWrapper() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGroupMembership = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }
        const token = await user.getIdToken();
        const firebase_uid = user.uid;
        // Fetch user profile
        const res = await api.get(`/users/profile/${firebase_uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const group_id = res?.data?.role?.group_id;
        const role_type = res?.data?.role?.role_type;
        if (group_id) {
          if (role_type === 'manager') {
            navigate('/app/dashboard'); // ManagerDashboard UI
          } else {
            navigate('/app/member'); // MemberPage UI
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    checkGroupMembership();
  }, [navigate]);

  const handleOnboardingComplete = () => {
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;
  return <SimpleOnboarding onComplete={handleOnboardingComplete} />;
}
