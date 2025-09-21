import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Calendar, Users, MessageSquare, BarChart3, Plus, Instagram, Facebook, Twitter, Linkedin, Settings, Clock, Send, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface SocialAccount {
  id: string
  platform: string
  username: string
  display_name: string
  profile_image?: string
  is_connected: boolean
  follower_count: number
  created_at: string
}

interface ScheduledPost {
  id: string
  account_ids: string[]
  content: string
  media_urls: string[]
  scheduled_time: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  created_at: string
  published_at?: string
}

interface Analytics {
  total_accounts: number
  total_posts: number
  published_posts: number
  scheduled_posts: number
  engagement_data: Array<{
    date: string
    likes: number
    comments: number
    shares: number
  }>
  platform_distribution: Record<string, number>
}

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: MessageSquare
}

const platformColors = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  tiktok: '#000000'
}

function App() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [newAccount, setNewAccount] = useState({
    platform: '',
    username: '',
    display_name: '',
    profile_image: ''
  })

  const [newPost, setNewPost] = useState({
    account_ids: [] as string[],
    content: '',
    media_urls: [] as string[],
    scheduled_time: ''
  })

  useEffect(() => {
    fetchAccounts()
    fetchPosts()
    fetchAnalytics()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/accounts`)
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts`)
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const handleAddAccount = async () => {
    if (!newAccount.platform || !newAccount.username || !newAccount.display_name) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      })
      
      if (response.ok) {
        await fetchAccounts()
        await fetchAnalytics()
        setIsAddAccountOpen(false)
        setNewAccount({ platform: '', username: '', display_name: '', profile_image: '' })
      }
    } catch (error) {
      console.error('Error adding account:', error)
    }
    setLoading(false)
  }

  const handleCreatePost = async () => {
    if (!newPost.content || newPost.account_ids.length === 0) return
    
    setLoading(true)
    try {
      const postData = {
        ...newPost,
        scheduled_time: newPost.scheduled_time ? new Date(newPost.scheduled_time).toISOString() : null
      }
      
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      
      if (response.ok) {
        await fetchPosts()
        await fetchAnalytics()
        setIsCreatePostOpen(false)
        setNewPost({ account_ids: [], content: '', media_urls: [], scheduled_time: '' })
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
    setLoading(false)
  }

  const handlePublishPost = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/publish`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchPosts()
        await fetchAnalytics()
      }
    } catch (error) {
      console.error('Error publishing post:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchPosts()
        await fetchAnalytics()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500'
      case 'scheduled': return 'bg-blue-500'
      case 'draft': return 'bg-gray-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const pieData = analytics ? Object.entries(analytics.platform_distribution).map(([platform, count]) => ({
    name: platform,
    value: count,
    color: platformColors[platform as keyof typeof platformColors] || '#8884d8'
  })) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TheTribalSuite</h1>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Social Media Management Made Easy
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
            <TabsList className="grid w-full grid-cols-1 gap-2 h-auto bg-transparent">
              <TabsTrigger value="dashboard" className="justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="accounts" className="justify-start">
                <Users className="h-4 w-4 mr-2" />
                Accounts
              </TabsTrigger>
              <TabsTrigger value="posts" className="justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="calendar" className="justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </nav>

        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <div className="flex space-x-2">
                  <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect Social Media Account</DialogTitle>
                        <DialogDescription>
                          Add a new social media account to manage with TheTribalSuite
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="platform">Platform</Label>
                          <Select value={newAccount.platform} onValueChange={(value) => setNewAccount({...newAccount, platform: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            value={newAccount.username}
                            onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="display_name">Display Name</Label>
                          <Input
                            value={newAccount.display_name}
                            onChange={(e) => setNewAccount({...newAccount, display_name: e.target.value})}
                            placeholder="Your Brand Name"
                          />
                        </div>
                        <Button onClick={handleAddAccount} disabled={loading} className="w-full">
                          {loading ? 'Connecting...' : 'Connect Account'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                        <DialogDescription>
                          Create and schedule content across your social media accounts
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Select Accounts</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {accounts.map((account) => {
                              const Icon = platformIcons[account.platform as keyof typeof platformIcons]
                              return (
                                <div
                                  key={account.id}
                                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                    newPost.account_ids.includes(account.id)
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => {
                                    const isSelected = newPost.account_ids.includes(account.id)
                                    setNewPost({
                                      ...newPost,
                                      account_ids: isSelected
                                        ? newPost.account_ids.filter(id => id !== account.id)
                                        : [...newPost.account_ids, account.id]
                                    })
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <Icon className="h-4 w-4" style={{ color: platformColors[account.platform as keyof typeof platformColors] }} />
                                    <span className="text-sm font-medium">{account.display_name}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            value={newPost.content}
                            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                            placeholder="What's on your mind?"
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="scheduled_time">Schedule Time (Optional)</Label>
                          <Input
                            type="datetime-local"
                            value={newPost.scheduled_time}
                            onChange={(e) => setNewPost({...newPost, scheduled_time: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleCreatePost} disabled={loading} className="w-full">
                          {loading ? 'Creating...' : newPost.scheduled_time ? 'Schedule Post' : 'Save as Draft'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.total_accounts}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.total_posts}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.published_posts}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.scheduled_posts}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics?.engagement_data || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="likes" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="comments" stroke="#82ca9d" strokeWidth={2} />
                        <Line type="monotone" dataKey="shares" stroke="#ffc658" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Connected Accounts</h2>
                <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => {
                  const Icon = platformIcons[account.platform as keyof typeof platformIcons]
                  return (
                    <Card key={account.id}>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Icon className="h-8 w-8" style={{ color: platformColors[account.platform as keyof typeof platformColors] }} />
                          <div>
                            <CardTitle className="text-lg">{account.display_name}</CardTitle>
                            <CardDescription>@{account.username}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Followers</p>
                            <p className="text-2xl font-bold">{account.follower_count.toLocaleString()}</p>
                          </div>
                          <Badge variant={account.is_connected ? "default" : "secondary"}>
                            {account.is_connected ? "Connected" : "Disconnected"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Posts</h2>
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(post.scheduled_time).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {post.status === 'draft' || post.status === 'scheduled' ? (
                            <Button
                              size="sm"
                              onClick={() => handlePublishPost(post.id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Publish Now
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900 mb-4">{post.content}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Accounts:</span>
                        {post.account_ids.map((accountId) => {
                          const account = accounts.find(a => a.id === accountId)
                          if (!account) return null
                          const Icon = platformIcons[account.platform as keyof typeof platformIcons]
                          return (
                            <div key={accountId} className="flex items-center space-x-1">
                              <Icon className="h-4 w-4" style={{ color: platformColors[account.platform as keyof typeof platformColors] }} />
                              <span className="text-sm">{account.display_name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Content Calendar</h2>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Posts</CardTitle>
                  <CardDescription>Your scheduled content for the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {posts
                      .filter(post => post.status === 'scheduled')
                      .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
                      .slice(0, 10)
                      .map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{post.content.substring(0, 100)}...</p>
                            <p className="text-sm text-gray-500">
                              {new Date(post.scheduled_time).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {post.account_ids.map((accountId) => {
                              const account = accounts.find(a => a.id === accountId)
                              if (!account) return null
                              const Icon = platformIcons[account.platform as keyof typeof platformIcons]
                              return (
                                <Icon
                                  key={accountId}
                                  className="h-5 w-5"
                                  style={{ color: platformColors[account.platform as keyof typeof platformColors] }}
                                />
                              )
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default App
