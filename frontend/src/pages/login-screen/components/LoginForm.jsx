import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn, loading: authLoading, authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (authError) {
      // Clear auth error when user starts typing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result?.success) {
        // Navigation will be handled by auth state change in AuthContext
        navigate('/sales-dashboard');
      } else {
        setError(result?.error || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

 

  const displayError = error || authError;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border rounded-lg shadow-elevation-2 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email Input */}
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="mb-4"
          />

          {/* Password Input */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="mb-4"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <span className="text-sm text-error">{displayError}</span>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <Button
            type="submit"
            variant="default"
            loading={loading || authLoading}
            fullWidth
            className="h-12"
          >
            {loading || authLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              onClick={() => {
                alert('Password reset functionality: Use the demo credentials above to sign in');
              }}
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;