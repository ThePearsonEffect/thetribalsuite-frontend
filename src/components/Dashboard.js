import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  Plus, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Use the same API base as the rest of the app
const BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
const API = `${BASE}/api`;

const Dashboard = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recentContent, setRecentContent] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics overview
      const analyticsResponse = await fetch(`${API}/analytics/overview`, { headers });
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      // Fetch accounts
      const accountsResponse = await fetch(`${API}/accounts`, { headers });
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setAccounts(accountsData);
      }

      // Fetch recent content
      const contentResponse = await fetch(`${API}/content?limit=5`, { headers });
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setRecentContent(contentData);
      }

      // Fetch scheduled posts
      const scheduledResponse = await fetch(`${API}/schedule?status=pending`, { headers });
      if (scheduledResponse.ok) {
        const scheduledData = await scheduledResponse.json();
        setScheduledPosts(scheduledData.slice(0, 5));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: <Instagram className="w-5 h-5" />,
      facebook: <Facebook className="w-5 h-5" />,
      linkedin: <Linkedin className="w-5 h-5" />,
      youtube: <Youtube className="w-5 h-5" />,
    };
    return icons[platform] || <Users className="w-5 h-5" />;
  };

  const getPlatformColor = (platform) => {
    const colors = {
      instagram: 'text-pink-600 bg-pink-100',
      facebook: 'text-blue-600 bg-blue-100',
      linkedin: 'text-indigo-600 bg-indigo-100',
      youtube: 'text-red-600 bg-red-100',
    };
    return colors[platform] || 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your social media overview.</p>
        </div>
        <Link to="/content">
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_accounts || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Created</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_content || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              Total posts created
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.scheduled_posts || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              Ready to publish
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.published_posts || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              Successfully published
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Accounts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Connected Accounts</CardTitle>
              <Link to="/accounts">
                <Button variant="ghost" size="sm">
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Your social media accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No accounts connected</h3>
                <p className="text-sm text-gray-500 mb-4">Connect your social media accounts to get started</p>
                <Link to="/accounts">
                  <Button size="sm" className="btn-primary">
                    Connect Account
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(account.platform)}`}>
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">@{account.username}</p>
                        <p className="text-xs text-gray-500 capitalize">{account.platform}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Content & Scheduled Posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Content</CardTitle>
                <Link to="/content">
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Your latest created content</CardDescription>
            </CardHeader>
            <CardContent>
              {recentContent.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No content yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Create your first post to get started</p>
                  <Link to="/content">
                    <Button size="sm" className="btn-primary">
                      Create Content
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentContent.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {content.content?.primary_text?.slice(0, 60)}...
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(content.status)}>
                            {content.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(content.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduled Posts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Posts</CardTitle>
                <Link to="/scheduled">
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Posts scheduled for publishing</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No scheduled posts</h3>
                  <p className="text-sm text-gray-500 mb-4">Schedule your first post to automate publishing</p>
                  <Link to="/content">
                    <Button size="sm" className="btn-primary">
                      Schedule Post
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlatformColor(post.platform)}`}>
                          {getPlatformIcon(post.platform)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{post.platform}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(post.scheduled_time)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;