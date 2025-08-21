import React, { useState } from 'react';
import { loginWithFirebase } from '../../lib/firebaseAuth';
import { useNavigate } from 'react-router-dom';
import {
  Visibility,
  VisibilityOff,
  Google,
  Person,
  Lock,
  Email,
} from '@mui/icons-material';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // 1. Authenticate with Firebase and get token
      const { token, user } = await loginWithFirebase(formData.email, formData.password);
      // 2. Send token and user info to backend
      const res = await fetch('http://localhost:8000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      if (!res.ok) {
        throw new Error('Backend login failed');
      }
      // After login, check user profile and route accordingly
      try {
        const userProfileRes = await fetch(`http://localhost:8000/users/profile/${user.uid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userProfile = await userProfileRes.json();
        const group_id = userProfile?.role?.group_id;
        const role_type = userProfile?.role?.role_type;
        if (group_id) {
          if (role_type === 'manager') {
            navigate('/dashboard');
          } else if (role_type === 'member') {
            navigate('/member');
          } else {
            navigate('/dashboard'); // fallback
          }
        } else {
          navigate('/onboarding');
        }
      } catch (err) {
        navigate('/onboarding');
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: 'Google authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen bg-gradient-to-br from-primary via-shadow to-primary flex items-center justify-center p-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(251, 250, 249, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(221, 180, 64, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <article className="relative bg-secondary/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-secondary/20">
        <header className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-shadow rounded-xl flex items-center justify-center shadow-lg">
              <Person className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-textcolor mb-1">
            Welcome Back
          </h1>
          <p className="text-textcolor/70 text-xs">
            Sign in to continue to your account
          </p>
        </header>

        {errors.submit && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-primary text-xs text-center">{errors.submit}</p>
          </div>
        )}

        <section className="mb-4">
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary border-2 border-textcolor/10 rounded-lg text-textcolor text-sm font-medium hover:border-primary/30 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            <Google className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Continue with Google</span>
          </button>
        </section>

        <div className="relative flex items-center mb-4">
          <div className="flex-1 border-t border-textcolor/20"></div>
          <span className="px-3 text-textcolor/60 text-xs bg-secondary">or</span>
          <div className="flex-1 border-t border-textcolor/20"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-medium text-textcolor">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Email className="w-4 h-4 text-textcolor/40" />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-textcolor placeholder-textcolor/50 bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${
                  errors.email ? 'border-primary' : 'border-textcolor/20'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-primary text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-medium text-textcolor">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-textcolor/40" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-textcolor placeholder-textcolor/50 bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${
                  errors.password ? 'border-primary' : 'border-textcolor/20'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textcolor/40 hover:text-textcolor transition-colors cursor-pointer"
              >
                {showPassword ? <VisibilityOff className="w-4 h-4" /> : <Visibility className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-primary text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="text-right">
            <button
              type="button"
              className="text-xs text-primary hover:text-shadow transition-colors cursor-pointer"
            >
              Forgot your password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-shadow text-secondary font-semibold py-2.5 px-4 rounded-lg hover:from-shadow hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <footer className="mt-6 text-center">
          <p className="text-textcolor/70 text-xs">
            Don't have an account?
            <button
              onClick={() => navigate('/signup')}
              className="ml-1 text-primary hover:text-shadow font-medium transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </footer>
      </article>
    </main>
  );
}
