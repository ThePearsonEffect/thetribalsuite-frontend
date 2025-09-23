import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Share,
  Calendar,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Analytics = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch overview analytics
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

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: <Instagram className="w-4 h-4" />,
      facebook: <Facebook className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />,
      youtube: <Youtube className="w-4 h-4" />
    };
    return icons[platform] || null;
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

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num?.toString() || '0';
  };

  // Mock data for demonstration
  const mockMetrics = {
    totalReach: 45600,
    totalEngagement: 3240,
    totalImpressions: 67800,
    engagementRate: 7.1,
    growthRate: 12.3,
    topPerformingPost: "Brand awareness campaign",
    bestPostingTime: "3:00 PM",
    reachGrowth: 15.2,
    engagementGrowth: -2.1,
    impressionsGrowth: 8.7
  };

  const mockPlatformData = [
    {
      platform: 'instagram',
      followers: 12500,
      reach: 18900,
      engagement: 1580,
      posts: 15,
      growth: 8.2
    },
    {
      platform: 'facebook',
      followers: 8300,
      reach: 15200,
      engagement: 890,
      posts: 12,
      growth: -1.5
    },
    {
      platform: 'linkedin',
      followers: 5600,
      reach: 8700,
      engagement: 620,
      posts: 8,
      growth: 15.8
    },
    {
      platform: 'youtube',
      followers: 3200,
      reach: 12400,
      engagement: 340,
      posts: 4,
      growth: 22.1
    }
  ];

  const mockContentPerformance = [
    { id: 1, title: "Product Launch Announcement", platform: "instagram", reach: 8900, engagement: 450, date: "2024-01-15" },
    { id: 2, title: "Behind the Scenes Video", platform: "youtube", reach: 12400, engagement: 890, date: "2024-01-14" },
    { id: 3, title: "Industry Insights Article", platform: "linkedin", reach: 5600, engagement: 280, date: "2024-01-13" },
    { id: 4, title: "Customer Success Story", platform: "facebook", reach: 6700, engagement: 320, date: "2024-01-12" },
    { id: 5, title: "Weekly Tips Carousel", platform: "instagram", reach: 7200, engagement: 380, date: "2024-01-11" }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your social media performance across all platforms</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockMetrics.totalReach)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +{mockMetrics.reachGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockMetrics.totalEngagement)}</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              {mockMetrics.engagementGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockMetrics.totalImpressions)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +{mockMetrics.impressionsGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.engagementRate}%</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Industry avg: 6.2%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">By Platform</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Your social media metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Placeholder for chart */}
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                      <p className="text-blue-600 font-medium">Performance Chart</p>
                      <p className="text-sm text-blue-500">Analytics visualization coming soon</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">+{mockMetrics.growthRate}%</p>
                      <p className="text-sm text-gray-600">Growth Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{analytics?.published_posts || 0}</p>
                      <p className="text-sm text-gray-600">Posts Published</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{mockMetrics.bestPostingTime}</p>
                      <p className="text-sm text-gray-600">Best Posting Time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connected Accounts</span>
                    <span className="font-semibold">{accounts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Content</span>
                    <span className="font-semibold">{analytics?.total_content || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Scheduled Posts</span>
                    <span className="font-semibold">{analytics?.scheduled_posts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Engagement</span>
                    <span className="font-semibold">{mockMetrics.engagementRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">{mockMetrics.topPerformingPost}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        8.9K
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        450
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        32
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockPlatformData.map((platform) => (
              <Card key={platform.platform} className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(platform.platform)}`}>
                        {getPlatformIcon(platform.platform)}
                      </div>
                      <div>
                        <CardTitle className="capitalize">{platform.platform}</CardTitle>
                        <CardDescription>{formatNumber(platform.followers)} followers</CardDescription>
                      </div>
                    </div>
                    <Badge className={platform.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {platform.growth > 0 ? '+' : ''}{platform.growth}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Reach</p>
                        <p className="text-lg font-semibold">{formatNumber(platform.reach)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Engagement</p>
                        <p className="text-lg font-semibold">{formatNumber(platform.engagement)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Posts Published</span>
                        <span>{platform.posts}</span>
                      </div>
                      <Progress value={(platform.posts / 20) * 100} className="h-2" />
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      View Platform Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Your best performing posts across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockContentPerformance.map((content, index) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold">
                        #{index + 1}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlatformColor(content.platform)}`}>
                          {getPlatformIcon(content.platform)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{content.title}</h4>
                          <p className="text-sm text-gray-500 capitalize">{content.platform} • {new Date(content.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{formatNumber(content.reach)}</p>
                        <p>Reach</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{formatNumber(content.engagement)}</p>
                        <p>Engagement</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
                <CardDescription>Who's engaging with your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-200">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-purple-600 font-medium">Demographics Chart</p>
                    <p className="text-sm text-purple-500">Audience insights coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Posting Times</CardTitle>
                <CardDescription>When your audience is most active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-green-600 font-medium">Activity Heatmap</p>
                    <p className="text-sm text-green-500">Optimal timing analysis coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;