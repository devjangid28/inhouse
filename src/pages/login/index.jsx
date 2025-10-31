import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/event-planning-dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        setErrorMessage(error.message || 'Failed to sign in. Please check your credentials.');
      } else if (data?.user) {
        navigate('/event-planning-dashboard', { replace: true });
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center space-x-3 mb-8 group">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Icon name="Sparkles" size={26} color="white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">Smart Event</span>
              <span className="text-xs text-muted-foreground font-medium tracking-wide">Planner</span>
            </div>
          </Link>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-base">
              Sign in to continue planning amazing events
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
          {errorMessage && (
            <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-xl flex items-start space-x-3 animate-slide-in backdrop-blur-sm">
              <div className="flex items-center justify-center w-5 h-5 bg-error/20 rounded-full flex-shrink-0 mt-0.5">
                <Icon name="AlertCircle" size={14} className="text-error" />
              </div>
              <p className="text-sm text-error font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                  <Icon name="Mail" size={14} className="text-primary" />
                </div>
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/30"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error mt-1.5 flex items-center gap-1 animate-slide-in">
                  <Icon name="AlertCircle" size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2 group">
              <label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                  <Icon name="Lock" size={14} className="text-primary" />
                </div>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 bg-input border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error mt-1.5 flex items-center gap-1 animate-slide-in">
                  <Icon name="AlertCircle" size={12} />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-secondary font-medium transition-colors inline-flex items-center gap-1 group"
              >
                Forgot password?
                <Icon name="ArrowRight" size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                fullWidth
                size="lg"
                className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg py-3.5"
                iconName="ArrowRight"
                iconPosition="right"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-primary hover:text-secondary font-semibold transition-colors inline-flex items-center gap-1 group"
                >
                  Sign up
                  <Icon name="ArrowRight" size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary hover:text-secondary transition-colors font-medium">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:text-secondary transition-colors font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
