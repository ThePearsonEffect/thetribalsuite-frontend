import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

interface AnalyticsData {
  total_accounts: number;
  total_posts: number;
  published_posts: number;
  scheduled_posts: number;
  engagement_data: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
  platform_distribution: Record<string, number>;
  recent_posts: Array<any>;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} onLogout={onLogout} currentPage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Connected Accounts',
      value: analytics?.total_accounts || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Posts',
      value: analytics?.total_posts || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Published Posts',
      value: analytics?.published_posts || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Scheduled Posts',
      value: analytics?.scheduled_posts || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} currentPage="dashboard" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.email}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Platform Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.platform_distribution && Object.keys(analytics.platform_distribution).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.platform_distribution).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="font-medium capitalize">{platform}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No connected accounts yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.engagement_data && analytics.engagement_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.engagement_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="likes" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="shares" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No engagement data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Your latest social media posts</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.recent_posts && analytics.recent_posts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recent_posts.map((post) => (
                    <div key={post.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-gray-900">{post.content}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge 
                            variant={post.status === 'published' ? 'default' : post.status === 'scheduled' ? 'secondary' : 'destructive'}
                          >
                            {post.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No posts yet. Create your first post to get started!</p>
                  <Button onClick={() => window.location.href = '/create-post'}>
                    Create Post
                  </Button>
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
