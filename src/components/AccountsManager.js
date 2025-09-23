import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Plus, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube,
  Users,
  MoreVertical,
  ExternalLink,
  Unlink,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AccountsManager = () => {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/accounts`, { headers });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        toast.error('Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Error loading accounts');
    } finally {
      setLoading(false);
    }
  };

  const connectInstagram = async () => {
    setConnecting(true);
    try {
      const response = await fetch(`${API}/instagram/authorize`, { headers });
      if (response.ok) {
        const data = await response.json();
        window.open(data.authorization_url, '_blank', 'width=600,height=700');
        
        // Listen for the authorization completion
        const pollForConnection = setInterval(async () => {
          try {
            const accountsResponse = await fetch(`${API}/accounts`, { headers });
            if (accountsResponse.ok) {
              const accountsData = await accountsResponse.json();
              const instagramAccounts = accountsData.filter(acc => acc.platform === 'instagram');
              
              if (instagramAccounts.length > accounts.filter(acc => acc.platform === 'instagram').length) {
                setAccounts(accountsData);
                toast.success('Instagram account connected successfully!');
                clearInterval(pollForConnection);
                setConnecting(false);
              }
            }
          } catch (error) {
            console.error('Polling error:', error);
          }
        }, 2000);

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollForConnection);
          setConnecting(false);
        }, 120000);

      } else {
        toast.error('Failed to initiate Instagram connection');
        setConnecting(false);
      }
    } catch (error) {
      console.error('Error connecting Instagram:', error);
      toast.error('Error connecting Instagram account');
      setConnecting(false);
    }
  };

  const disconnectAccount = async (accountId) => {
    try {
      const response = await fetch(`${API}/accounts/${accountId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        setAccounts(prev => prev.filter(account => account.id !== accountId));
        toast.success('Account disconnected successfully');
      } else {
        toast.error('Failed to disconnect account');
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error('Error disconnecting account');
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: <Instagram className="w-6 h-6" />,
      facebook: <Facebook className="w-6 h-6" />,
      linkedin: <Linkedin className="w-6 h-6" />,
      youtube: <Youtube className="w-6 h-6" />
    };
    return icons[platform] || <Users className="w-6 h-6" />;
  };

  const getPlatformColor = (platform) => {
    const colors = {
      instagram: 'from-pink-500 to-purple-600',
      facebook: 'from-blue-500 to-blue-600',
      linkedin: 'from-blue-600 to-indigo-600',
      youtube: 'from-red-500 to-red-600',
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  const getPlatformName = (platform) => {
    const names = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      youtube: 'YouTube'
    };
    return names[platform] || platform;
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count?.toString() || '0';
  };

  const availablePlatforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your Instagram Business account',
      icon: <Instagram className="w-8 h-8" />,
      color: 'from-pink-500 to-purple-600',
      available: true,
      onClick: connectInstagram
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Connect your Facebook Page',
      icon: <Facebook className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      available: false,
      onClick: () => toast.info('Facebook integration coming soon!')
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Connect your LinkedIn Company Page',
      icon: <Linkedin className="w-8 h-8" />,
      color: 'from-blue-600 to-indigo-600',
      available: false,
      onClick: () => toast.info('LinkedIn integration coming soon!')
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Connect your YouTube Channel',
      icon: <Youtube className="w-8 h-8" />,
      color: 'from-red-500 to-red-600',
      available: false,
      onClick: () => toast.info('YouTube integration coming soon!')
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connected Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your social media account connections</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                <p className="text-2xl font-bold text-blue-600">{accounts.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {accounts.filter(acc => acc.is_active).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Followers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatFollowers(accounts.reduce((sum, acc) => sum + (acc.followers_count || 0), 0))}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platforms</p>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(accounts.map(acc => acc.platform)).size}
                </p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Connected Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlatformColor(account.platform)} flex items-center justify-center text-white`}>
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">@{account.username}</h3>
                        <p className="text-sm text-gray-500">{getPlatformName(account.platform)}</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          Account Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => disconnectAccount(account.id)}
                          className="text-red-600"
                        >
                          <Unlink className="w-4 h-4 mr-2" />
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge className={account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {account.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Followers</span>
                      <span className="font-semibold text-gray-900">
                        {formatFollowers(account.followers_count)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Connected</span>
                      <span className="text-sm text-gray-500">
                        {new Date(account.connected_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {account.profile_picture && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={account.profile_picture} alt={account.username} />
                          <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">Profile synced</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect New Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {availablePlatforms.map((platform) => {
            const isConnected = accounts.some(acc => acc.platform === platform.id);
            
            return (
              <Card key={platform.id} className={`hover-lift cursor-pointer transition-all ${!platform.available ? 'opacity-60' : ''}`}>
                <CardContent className="p-6" onClick={platform.available ? platform.onClick : undefined}>
                  <div className="text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white`}>
                      {platform.icon}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{platform.description}</p>
                    </div>

                    {isConnected ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    ) : platform.available ? (
                      <Button 
                        className="w-full btn-primary"
                        disabled={connecting}
                        onClick={(e) => {
                          e.stopPropagation();
                          platform.onClick();
                        }}
                      >
                        {connecting && platform.id === 'instagram' ? (
                          <>
                            <div className="loading-spinner mr-2" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {accounts.length === 0 && (
        <Card className="mt-8">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts connected yet</h3>
            <p className="text-gray-500 mb-6">
              Connect your social media accounts to start managing your content from one place
            </p>
            <Button 
              onClick={connectInstagram}
              className="btn-primary"
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Connecting Instagram...
                </>
              ) : (
                <>
                  <Instagram className="w-4 h-4 mr-2" />
                  Connect Instagram
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountsManager;