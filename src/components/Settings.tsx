import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Key, Bell, User, Webhook } from 'lucide-react';

interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface SettingsProps {
  user: User;
  onLogout: () => void;
}

interface ApiKeys {
  instagram_app_id: string;
  instagram_app_secret: string;
  facebook_app_id: string;
  facebook_app_secret: string;
  twitter_api_key: string;
  twitter_api_secret: string;
  twitter_bearer_token: string;
  linkedin_client_id: string;
  linkedin_client_secret: string;
  tiktok_client_key: string;
  tiktok_client_secret: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  post_published: boolean;
  post_failed: boolean;
  account_connected: boolean;
  weekly_report: boolean;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    instagram_app_id: '',
    instagram_app_secret: '',
    facebook_app_id: '',
    facebook_app_secret: '',
    twitter_api_key: '',
    twitter_api_secret: '',
    twitter_bearer_token: '',
    linkedin_client_id: '',
    linkedin_client_secret: '',
    tiktok_client_key: '',
    tiktok_client_secret: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    post_published: true,
    post_failed: true,
    account_connected: true,
    weekly_report: false,
  });

  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.api_keys) setApiKeys(data.api_keys);
        if (data.notifications) setNotifications(data.notifications);
        if (data.webhook_url) setWebhookUrl(data.webhook_url);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveApiKeys = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/api-keys`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiKeys),
      });

      if (response.ok) {
        setMessage('API keys saved successfully!');
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to save API keys');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(notifications),
      });

      if (response.ok) {
        setMessage('Notification settings saved successfully!');
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to save notification settings');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveWebhook = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/webhook`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      });

      if (response.ok) {
        setMessage('Webhook URL saved successfully!');
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to save webhook URL');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} currentPage="settings" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and application settings</p>
          </div>

          {message && (
            <Alert className="mb-6">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="api-keys" className="space-y-6">
            <TabsList>
              <TabsTrigger value="api-keys" className="flex items-center">
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="flex items-center">
                <Webhook className="h-4 w-4 mr-2" />
                Webhooks
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Instagram & Facebook API</CardTitle>
                    <CardDescription>
                      Configure your Meta (Facebook) app credentials for Instagram and Facebook integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Instagram App ID</label>
                        <Input
                          type="password"
                          value={apiKeys.instagram_app_id}
                          onChange={(e) => setApiKeys({...apiKeys, instagram_app_id: e.target.value})}
                          placeholder="Your Instagram App ID"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Instagram App Secret</label>
                        <Input
                          type="password"
                          value={apiKeys.instagram_app_secret}
                          onChange={(e) => setApiKeys({...apiKeys, instagram_app_secret: e.target.value})}
                          placeholder="Your Instagram App Secret"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Twitter API</CardTitle>
                    <CardDescription>
                      Configure your Twitter API v2 credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">API Key</label>
                        <Input
                          type="password"
                          value={apiKeys.twitter_api_key}
                          onChange={(e) => setApiKeys({...apiKeys, twitter_api_key: e.target.value})}
                          placeholder="Your Twitter API Key"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">API Secret</label>
                        <Input
                          type="password"
                          value={apiKeys.twitter_api_secret}
                          onChange={(e) => setApiKeys({...apiKeys, twitter_api_secret: e.target.value})}
                          placeholder="Your Twitter API Secret"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bearer Token</label>
                      <Input
                        type="password"
                        value={apiKeys.twitter_bearer_token}
                        onChange={(e) => setApiKeys({...apiKeys, twitter_bearer_token: e.target.value})}
                        placeholder="Your Twitter Bearer Token"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>LinkedIn API</CardTitle>
                    <CardDescription>
                      Configure your LinkedIn Marketing API credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Client ID</label>
                        <Input
                          type="password"
                          value={apiKeys.linkedin_client_id}
                          onChange={(e) => setApiKeys({...apiKeys, linkedin_client_id: e.target.value})}
                          placeholder="Your LinkedIn Client ID"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Client Secret</label>
                        <Input
                          type="password"
                          value={apiKeys.linkedin_client_secret}
                          onChange={(e) => setApiKeys({...apiKeys, linkedin_client_secret: e.target.value})}
                          placeholder="Your LinkedIn Client Secret"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>TikTok API</CardTitle>
                    <CardDescription>
                      Configure your TikTok for Business API credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Client Key</label>
                        <Input
                          type="password"
                          value={apiKeys.tiktok_client_key}
                          onChange={(e) => setApiKeys({...apiKeys, tiktok_client_key: e.target.value})}
                          placeholder="Your TikTok Client Key"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Client Secret</label>
                        <Input
                          type="password"
                          value={apiKeys.tiktok_client_secret}
                          onChange={(e) => setApiKeys({...apiKeys, tiktok_client_secret: e.target.value})}
                          placeholder="Your TikTok Client Secret"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={saveApiKeys} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save API Keys'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose which notifications you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email_notifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, email_notifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Post Published</h4>
                      <p className="text-sm text-gray-600">Notify when posts are successfully published</p>
                    </div>
                    <Switch
                      checked={notifications.post_published}
                      onCheckedChange={(checked) => setNotifications({...notifications, post_published: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Post Failed</h4>
                      <p className="text-sm text-gray-600">Notify when posts fail to publish</p>
                    </div>
                    <Switch
                      checked={notifications.post_failed}
                      onCheckedChange={(checked) => setNotifications({...notifications, post_failed: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Account Connected</h4>
                      <p className="text-sm text-gray-600">Notify when new accounts are connected</p>
                    </div>
                    <Switch
                      checked={notifications.account_connected}
                      onCheckedChange={(checked) => setNotifications({...notifications, account_connected: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Report</h4>
                      <p className="text-sm text-gray-600">Receive weekly analytics reports</p>
                    </div>
                    <Switch
                      checked={notifications.weekly_report}
                      onCheckedChange={(checked) => setNotifications({...notifications, weekly_report: checked})}
                    />
                  </div>

                  <Button onClick={saveNotifications} disabled={loading} className="w-full">
                    {loading ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks">
              <Card>
                <CardHeader>
                  <CardTitle>n8n Webhook Integration</CardTitle>
                  <CardDescription>
                    Configure webhook URL for n8n automation integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Webhook URL</label>
                    <Input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This URL will receive notifications for account connections, post publishing, and other events
                    </p>
                  </div>

                  <Alert>
                    <Webhook className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Webhook Events:</strong><br />
                      • Account connected/disconnected<br />
                      • Post published/failed<br />
                      • Analytics milestones<br />
                      • User registration
                    </AlertDescription>
                  </Alert>

                  <Button onClick={saveWebhook} disabled={loading} className="w-full">
                    {loading ? 'Saving...' : 'Save Webhook URL'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    View and manage your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input value={user.email} disabled />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Account Status</label>
                    <Input value={user.is_active ? 'Active' : 'Inactive'} disabled />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Member Since</label>
                    <Input value={new Date(user.created_at).toLocaleDateString()} disabled />
                  </div>

                  <Alert>
                    <User className="h-4 w-4" />
                    <AlertDescription>
                      To change your email or password, please contact support or use the password reset feature.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
