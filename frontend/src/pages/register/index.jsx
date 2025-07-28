import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RegisterForm from './components/RegisterForm';
import BrandingHeader from '../login-screen/components/BrandingHeader';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-2 -ml-2 self-start"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Branding Header */}
        <BrandingHeader />

        {/* Registration Form */}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <RegisterForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ModernPOS. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <a 
              href="/privacy" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Handle privacy policy click
              }}
            >
              Privacy Policy
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href="/terms" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Handle terms of service click
              }}
            >
              Terms of Service
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href="#" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Handle support click
              }}
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
