import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Instagram, Facebook, Twitter, Linkedin, Music } from 'lucide-react';

interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface SocialAccount {
  id: number;
  platform: string;
  username: string;
  display_name: string;
  profile_image_url?: string;
  is_active: boolean;
  follower_count: number;
  created_at: string;
}

interface AccountManagementProps {
  user: User;
  onLogout: () => void;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ user, onLogout }) => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: 'bg-black' },
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (platform: string) => {
    setConnectingPlatform(platform);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/${platform}`);
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.auth_url;
      } else {
        alert('Failed to start OAuth flow. Please check your API configuration.');
      }
    } catch (error) {
      console.error('Error starting OAuth:', error);
      alert('Network error. Please try again.');
    } finally {
      setConnectingPlatform(null);
    }
  };

  const disconnectAccount = async (accountId: number) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAccounts(accounts.filter(account => account.id !== accountId));
      } else {
        alert('Failed to disconnect account');
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert('Network error. Please try again.');
    }
  };

  const getConnectedAccounts = () => {
    return accounts.filter(account => account.is_active);
  };

  const getAvailablePlatforms = () => {
    const connectedPlatforms = getConnectedAccounts().map(account => account.platform);
    return platforms.filter(platform => !connectedPlatforms.includes(platform.id));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} onLogout={onLogout} currentPage="accounts" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} currentPage="accounts" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
            <p className="text-gray-600">Connect and manage your social media accounts</p>
          </div>

          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Connected Accounts ({getConnectedAccounts().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getConnectedAccounts().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No accounts connected yet. Connect your first social media account to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getConnectedAccounts().map((account) => {
                      const platform = platforms.find(p => p.id === account.platform);
                      const Icon = platform?.icon || Users;
                      return (
                        <Card key={account.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`p-2 rounded-full ${platform?.color || 'bg-gray-500'} text-white`}>
                                <Icon size={20} />
                              </div>
                              <div>
                                <h3 className="font-semibold">{account.display_name}</h3>
                                <p className="text-sm text-gray-600">@{account.username}</p>
                                <p className="text-xs text-gray-500">{platform?.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium">{account.follower_count.toLocaleString()}</span>
                                <span className="text-gray-500 ml-1">followers</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => disconnectAccount(account.id)}
                              >
                                Disconnect
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connect New Account</CardTitle>
              <CardDescription>Add more social media accounts to manage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAvailablePlatforms().map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Card key={platform.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className={`inline-flex p-3 rounded-full ${platform.color} text-white mb-4`}>
                          <Icon size={24} />
                        </div>
                        <h3 className="font-semibold mb-2">{platform.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Connect your {platform.name} account to start managing posts
                        </p>
                        <Button
                          onClick={() => connectAccount(platform.id)}
                          disabled={connectingPlatform === platform.id}
                          className="w-full"
                        >
                          {connectingPlatform === platform.id ? 'Connecting...' : 'Connect'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Alert>
                    <Instagram className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Instagram Business Account Required</strong><br />
                      Instagram requires a Business or Creator account for API access.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      <strong>API Keys Configuration</strong><br />
                      Make sure your administrator has configured the API keys for each platform.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Badge className="h-4 w-4" />
                    <AlertDescription>
                      <strong>OAuth Permissions</strong><br />
                      Grant all requested permissions when connecting accounts for full functionality.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
