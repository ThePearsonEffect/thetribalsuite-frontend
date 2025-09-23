import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Calendar, 
  Clock, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube,
  MoreVertical,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ScheduledPosts = () => {
  const { token } = useAuth();
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/schedule`, { headers });
      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data);
      } else {
        toast.error('Failed to fetch scheduled posts');
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast.error('Error loading scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const cancelScheduledPost = async (postId) => {
    try {
      const response = await fetch(`${API}/schedule/${postId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        setScheduledPosts(prev => prev.filter(post => post.id !== postId));
        toast.success('Scheduled post cancelled successfully');
      } else {
        toast.error('Failed to cancel scheduled post');
      }
    } catch (error) {
      console.error('Error cancelling scheduled post:', error);
      toast.error('Error cancelling scheduled post');
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

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      processing: <Clock className="w-4 h-4 animate-spin" />,
      published: <CheckCircle className="w-4 h-4" />,
      failed: <XCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const filteredPosts = scheduledPosts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter;
    const matchesSearch = post.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.status.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedPosts = filteredPosts.reduce((groups, post) => {
    const date = new Date(post.scheduled_time).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(post);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
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
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Posts</h1>
          <p className="text-gray-600 mt-1">Manage your upcoming and past scheduled posts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>
                All Posts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('pending')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('published')}>
                Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('failed')}>
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('cancelled')}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Scheduled', value: scheduledPosts.length, color: 'text-blue-600' },
          { label: 'Pending', value: scheduledPosts.filter(p => p.status === 'pending').length, color: 'text-yellow-600' },
          { label: 'Published', value: scheduledPosts.filter(p => p.status === 'published').length, color: 'text-green-600' },
          { label: 'Failed', value: scheduledPosts.filter(p => p.status === 'failed').length, color: 'text-red-600' }
        ].map((stat, index) => (
          <Card key={index} className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scheduled Posts */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'No posts match your filters' : 'No scheduled posts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter settings'
                : 'Schedule your first post to see it here'
              }
            </p>
            {(!searchTerm && filter === 'all') && (
              <Button className="btn-primary">
                Create Scheduled Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPosts)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([dateString, posts]) => (
              <div key={dateString}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {new Date(dateString).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <Badge variant="outline" className="text-xs">
                    {posts.length} post{posts.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {posts
                    .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
                    .map((post) => {
                      const { date, time } = formatDate(post.scheduled_time);
                      const upcoming = isUpcoming(post.scheduled_time);
                      
                      return (
                        <Card key={post.id} className="hover-lift">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                {/* Platform Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(post.platform)}`}>
                                  {getPlatformIcon(post.platform)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-semibold text-gray-900 capitalize">
                                      {post.platform}
                                    </h3>
                                    <Badge className={`${getStatusColor(post.status)} flex items-center gap-1`}>
                                      {getStatusIcon(post.status)}
                                      {post.status}
                                    </Badge>
                                    {upcoming && (
                                      <Badge variant="outline" className="text-green-600 border-green-200">
                                        Upcoming
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {time}
                                    </span>
                                  </div>

                                  {post.error_message && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                      <div className="flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        Error: {post.error_message}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {post.status === 'pending' && upcoming && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => cancelScheduledPost(post.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                  </Button>
                                )}

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {post.status === 'pending' && upcoming && (
                                      <DropdownMenuItem 
                                        onClick={() => cancelScheduledPost(post.id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Cancel Post
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledPosts;