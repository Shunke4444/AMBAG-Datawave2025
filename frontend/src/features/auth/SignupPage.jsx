import React, { useState } from 'react';
const baseURL = import.meta?.env?.VITE_API_URL || "https://ambag-backend.onrender.com";
import { signupWithFirebase } from '../../lib/firebaseAuth';
import { useNavigate } from 'react-router-dom';
import {
  Visibility,
  VisibilityOff,
  Google,
  Person,
  Lock,
  Email,
  ArrowBack
} from '@mui/icons-material';

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: ''
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
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const { token, user } = await signupWithFirebase(formData.email, formData.password);
      const payload = {
        email: formData.email,
        password: formData.password,
        profile: {
          first_name: formData.firstName,
          last_name: formData.lastName
        },
        role: {
          role_type: null,
          permissions: [],
          group_id: null
        }
      };
      const res = await fetch(`${baseURL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
  let responseText = await res.text();
      if (!res.ok) {
        throw new Error('Backend registration failed: ' + responseText);
      }
      // Registration successful, navigate to dashboard
  setShowSuccessModal(true);
    } catch (error) {
      setErrors({ submit: error.message || 'Account creation failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
  navigate('/app/dashboard');
    } catch (error) {
      setErrors({ submit: 'Google authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen bg-gradient-to-br from-primary via-shadow to-primary flex items-center justify-center p-4 overflow-hidden">
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-primary mb-4">Successfully Signed Up!</h2>
            <p className="mb-6 text-textcolor">Your account has been created. You can now log in.</p>
            <button
              className="bg-primary text-secondary font-semibold py-2 px-6 rounded-lg hover:bg-shadow transition-colors"
              onClick={() => navigate('/login')}
            >Go to Login</button>
          </div>
        </div>
      )}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(251, 250, 249, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(221, 180, 64, 0.1) 0%, transparent 50%)`
        }} />
      </div>     

      <article className="relative bg-secondary/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-secondary/20">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-shadow rounded-xl flex items-center justify-center shadow-lg">
              <Person className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-textcolor mb-1">
            Create Account
          </h1>
          <p className="text-textcolor/70 text-xs">
            Join AMBAG to start your financial journey
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
            <span>Sign up with Google</span>
          </button>
        </section>

        <div className="relative flex items-center mb-4">
          <div className="flex-1 border-t border-textcolor/20"></div>
          <span className="px-3 text-textcolor/60 text-xs bg-secondary">or</span>
          <div className="flex-1 border-t border-textcolor/20"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="firstName" className="block text-xs font-medium text-textcolor">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Person className="w-4 h-4 text-textcolor/40" />
              </div>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-textcolor placeholder-textcolor/50 bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${
                  errors.firstName ? 'border-primary' : 'border-textcolor/20'
                }`}
                placeholder="Enter your first name"
              />
            </div>
            {errors.firstName && (
              <p className="text-primary text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="lastName" className="block text-xs font-medium text-textcolor">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Person className="w-4 h-4 text-textcolor/40" />
              </div>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-textcolor placeholder-textcolor/50 bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${
                  errors.lastName ? 'border-primary' : 'border-textcolor/20'
                }`}
                placeholder="Enter your last name"
              />
            </div>
            {errors.lastName && (
              <p className="text-primary text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

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

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-textcolor">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-textcolor/40" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-textcolor placeholder-textcolor/50 bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${
                  errors.confirmPassword ? 'border-primary' : 'border-textcolor/20'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textcolor/40 hover:text-textcolor transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <VisibilityOff className="w-4 h-4" /> : <Visibility className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-primary text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-shadow text-secondary font-semibold py-2.5 px-4 rounded-lg hover:from-shadow hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <footer className="mt-6 text-center">
          <p className="text-textcolor/70 text-xs">
            Already have an account?
            <button
              onClick={() => navigate('/login')}
              className="ml-1 text-primary hover:text-shadow font-medium transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </footer>
      </article>
    </main>
  );
}
