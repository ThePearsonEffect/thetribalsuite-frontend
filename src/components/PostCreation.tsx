import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Send, Image, Users } from 'lucide-react';

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
  is_active: boolean;
}

interface PostCreationProps {
  user: User;
  onLogout: () => void;
}

const PostCreation: React.FC<PostCreationProps> = ({ user, onLogout }) => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);

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
        setAccounts(data.filter((account: SocialAccount) => account.is_active));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleAccountToggle = (accountId: number) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleMediaUrlAdd = () => {
    setMediaUrls([...mediaUrls, '']);
  };

  const handleMediaUrlChange = (index: number, url: string) => {
    const newUrls = [...mediaUrls];
    newUrls[index] = url;
    setMediaUrls(newUrls);
  };

  const handleMediaUrlRemove = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!content.trim()) {
      alert('Please enter post content');
      return;
    }

    if (selectedAccounts.length === 0) {
      alert('Please select at least one account');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const postData = {
        content: content.trim(),
        media_urls: mediaUrls.filter(url => url.trim()),
        scheduled_time: scheduledTime ? new Date(scheduledTime).toISOString() : null,
        target_accounts: selectedAccounts,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (!isDraft && !scheduledTime) {
          const publishResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${result.id}/publish`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (publishResponse.ok) {
            alert('Post published successfully!');
          } else {
            alert('Post created but failed to publish. You can publish it later from the dashboard.');
          }
        } else {
          alert(scheduledTime ? 'Post scheduled successfully!' : 'Draft saved successfully!');
        }

        setContent('');
        setMediaUrls([]);
        setScheduledTime('');
        setSelectedAccounts([]);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (accountsLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} onLogout={onLogout} currentPage="create-post" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} currentPage="create-post" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Post</h1>
            <p className="text-gray-600">Create and schedule posts across your social media accounts</p>
          </div>

          {accounts.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                You need to connect at least one social media account before creating posts. 
                <Button variant="link" className="p-0 ml-1" onClick={() => window.location.href = '/accounts'}>
                  Connect accounts
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Post Content</CardTitle>
                    <CardDescription>Write your post content and add media</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content</label>
                      <Textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">{content.length} characters</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Media URLs</label>
                        <Button variant="outline" size="sm" onClick={handleMediaUrlAdd}>
                          <Image className="h-4 w-4 mr-1" />
                          Add Media
                        </Button>
                      </div>
                      {mediaUrls.map((url, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={url}
                            onChange={(e) => handleMediaUrlChange(index, e.target.value)}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMediaUrlRemove(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Schedule (Optional)</label>
                      <Input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Target Accounts</CardTitle>
                    <CardDescription>Select which accounts to post to</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {accounts.map((account) => (
                        <div key={account.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`account-${account.id}`}
                            checked={selectedAccounts.includes(account.id)}
                            onCheckedChange={() => handleAccountToggle(account.id)}
                          />
                          <label 
                            htmlFor={`account-${account.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{account.display_name}</p>
                                <p className="text-sm text-gray-600">@{account.username}</p>
                              </div>
                              <Badge variant="secondary" className="capitalize">
                                {account.platform}
                              </Badge>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => handleSubmit(false)}
                      disabled={loading}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {scheduledTime ? 'Schedule Post' : 'Publish Now'}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                      className="w-full"
                    >
                      Save as Draft
                    </Button>

                    {scheduledTime && (
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Scheduled for {new Date(scheduledTime).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCreation;
