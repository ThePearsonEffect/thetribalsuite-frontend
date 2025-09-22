import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const { platform } = useParams<{ platform: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`OAuth error: ${error}`);
      return;
    }

    if (!code || !state || !platform) {
      setStatus('error');
      setMessage('Missing required OAuth parameters');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setStatus('error');
        setMessage('Not authenticated. Please log in first.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/callback/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          state,
          platform,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setMessage(`Successfully connected ${platform} account: ${data.username || data.display_name}!`);
        setTimeout(() => navigate('/accounts'), 2000);
      } else {
        const errorData = await response.json();
        setStatus('error');
        setMessage(errorData.detail || 'Failed to connect account');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage('Network error during OAuth callback');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'processing' && <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-600" />}
            {status === 'error' && <XCircle className="h-12 w-12 text-red-600" />}
          </div>
          
          <CardTitle className="text-xl">
            {status === 'processing' && 'Connecting Account...'}
            {status === 'success' && 'Account Connected!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          
          <CardDescription className="capitalize">
            {platform} OAuth Callback
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-700">{message}</p>
          
          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Redirecting to account management in 2 seconds...
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/accounts')}
                  className="flex-1"
                >
                  Back to Accounts
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
