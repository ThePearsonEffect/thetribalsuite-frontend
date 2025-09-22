import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, Heart, MessageCircle, Share, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface AnalyticsProps {
  user: User;
  onLogout: () => void;
}

interface AnalyticsData {
  overview: {
    total_followers: number;
    total_posts: number;
    total_engagement: number;
    engagement_rate: number;
  };
  engagement_timeline: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
  }>;
  platform_performance: Array<{
    platform: string;
    followers: number;
    posts: number;
    engagement: number;
  }>;
  top_posts: Array<{
    id: number;
    content: string;
    platform: string;
    likes: number;
    comments: number;
    shares: number;
    created_at: string;
  }>;
}

const Analytics: React.FC<AnalyticsProps> = ({ user, onLogout }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics?range=${timeRange}`, {
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
        <Sidebar user={user} onLogout={onLogout} currentPage="analytics" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} currentPage="analytics" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Track your social media performance</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Followers</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.overview.total_followers.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-50">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Posts</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.overview.total_posts.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-green-50">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.overview.total_engagement.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-50">
                        <Heart className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.overview.engagement_rate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-orange-50">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Timeline</CardTitle>
                    <CardDescription>Track your engagement over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.engagement_timeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="likes" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="shares" stroke="#f59e0b" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Performance</CardTitle>
                    <CardDescription>Compare performance across platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.platform_performance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="platform" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="engagement" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Posts</CardTitle>
                      <CardDescription>Your most engaging content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.top_posts.map((post) => (
                          <div key={post.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <p className="text-gray-900 mb-2">{post.content}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <Badge variant="secondary" className="capitalize">
                                  {post.platform}
                                </Badge>
                                <span className="flex items-center">
                                  <Heart className="h-4 w-4 mr-1" />
                                  {post.likes}
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  {post.comments}
                                </span>
                                <span className="flex items-center">
                                  <Share className="h-4 w-4 mr-1" />
                                  {post.shares}
                                </span>
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                    <CardDescription>Followers by platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.platform_performance}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ platform, followers }) => `${platform}: ${followers}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="followers"
                        >
                          {analytics.platform_performance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-gray-600">Connect your social media accounts and create posts to see analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
