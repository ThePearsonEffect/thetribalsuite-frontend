import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') || 
  'https://thetribalsuite-backend.onrender.com';

export default function SocialLoginPage() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      description: 'Connect your Instagram business account',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      provider: 'meta'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      description: 'Connect your Facebook page',
      color: 'bg-blue-600',
      provider: 'meta'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      description: 'Connect your LinkedIn profile',
      color: 'bg-blue-700',
      provider: 'linkedin'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      description: 'Connect your TikTok account',
      color: 'bg-black',
      provider: 'tiktok'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      description: 'Connect your YouTube channel',
      color: 'bg-red-600',
      provider: 'google'
    }
  ];

  const handleConnect = async (platform: typeof platforms[0]) => {
    setConnecting(true);
    try {
      // Start OAuth flow
      const oauthUrl = `${BASE}/auth/${platform.provider}/start?platform=${platform.id}`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Failed to start OAuth:', error);
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Connect Your Social Accounts
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Securely connect your social media accounts to start managing your content across platforms
            </p>
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  selectedPlatform === platform.id ? 'ring-4 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                <div className={`h-2 ${platform.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${platform.color} mr-4`}>
                      <span className="text-2xl">{platform.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {platform.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {platform.description}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(platform);
                    }}
                    disabled={connecting}
                    className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${platform.color} hover:opacity-90 disabled:opacity-50`}
                  >
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Security Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <span className="text-green-600 text-xl">🔒</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Secure OAuth Authentication
                </h3>
                <div className="text-gray-600 dark:text-gray-300 space-y-2">
                  <p>• Your passwords are never stored or transmitted</p>
                  <p>• We use industry-standard OAuth 2.0 for secure authentication</p>
                  <p>• You can revoke access at any time from your social media settings</p>
                  <p>• All data is encrypted and securely handled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/accounts')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
