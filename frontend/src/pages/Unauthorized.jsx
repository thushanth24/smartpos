import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { AlertCircle } from 'lucide-react';
import Alert from '../components/ui/Alert';
import AlertDescription from '../components/ui/AlertDescription';
import AlertTitle from '../components/ui/AlertTitle';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="text-xl font-bold">Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            <p>You don't have permission to access this page.</p>
            {from && from !== '/' && (
              <p className="mt-2 text-sm text-gray-600">
                Tried to access: <span className="font-mono">{from}</span>
              </p>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button
            onClick={handleGoHome}
            className="w-full sm:w-auto"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
