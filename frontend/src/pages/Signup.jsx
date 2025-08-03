import React, { useState } from 'react';
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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
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

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // just navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: 'Account creation failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Google OAuth
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

=        <section className="mb-4">
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary border-2 border-textcolor/10 rounded-lg text-textcolor text-sm font-medium hover:border-primary/30 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
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
            <label htmlFor="fullName" className="block text-xs font-medium text-textcolor">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Person className="w-4 h-4 text-textcolor/40" />
              </div>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm text-textcolor placeholder-textcolor/50 bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${
                  errors.fullName ? 'border-primary' : 'border-textcolor/20'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.fullName && (
              <p className="text-primary text-xs mt-1">{errors.fullName}</p>
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textcolor/40 hover:text-textcolor transition-colors"
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textcolor/40 hover:text-textcolor transition-colors"
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
            className="w-full bg-gradient-to-r from-primary to-shadow text-secondary font-semibold py-2.5 px-4 rounded-lg hover:from-shadow hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
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
              className="ml-1 text-primary hover:text-shadow font-medium transition-colors"
            >
              Sign In
            </button>
          </p>
        </footer>
      </article>
    </main>
  );
}
