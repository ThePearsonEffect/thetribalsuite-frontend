import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Save, 
  Send,
  Plus,
  X,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Use the same API base as the rest of the app
const BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
const API = `${BASE}/api`;

const ContentCreator = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [contentData, setContentData] = useState({
    content: {
      primary_text: '',
      platform_variants: {
        instagram: '',
        facebook: '',
        linkedin: '',
        youtube: ''
      }
    },
    media_assets: [],
    metadata: {
      hashtags: {
        primary: [],
        platform_specific: {
          instagram: [],
          linkedin: [],
          tiktok: []
        }
      },
      keywords: [],
      target_audience: '',
      content_category: ''
    },
    scheduling: null,
    platform_config: {}
  });

  const [hashtagInput, setHashtagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    platform: '',
    account_id: '',
    scheduled_time: ''
  });

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${API}/accounts`, { headers });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setContentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformVariantChange = (platform, value) => {
    setContentData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        platform_variants: {
          ...prev.content.platform_variants,
          [platform]: value
        }
      }
    }));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API}/files/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          return {
            url: data.url,
            filename: data.filename,
            size: data.size,
            type: file.type.startsWith('image/') ? 'image' : 'video'
          };
        }
        throw new Error('Upload failed');
      });

      const results = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...results]);
      setContentData(prev => ({
        ...prev,
        media_assets: [...prev.media_assets, ...results]
      }));

      toast.success(`${results.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('File upload failed');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setContentData(prev => ({
      ...prev,
      media_assets: prev.media_assets.filter((_, i) => i !== index)
    }));
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !contentData.metadata.hashtags.primary.includes(hashtagInput.trim())) {
      const newHashtag = hashtagInput.trim().replace('#', '');
      setContentData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          hashtags: {
            ...prev.metadata.hashtags,
            primary: [...prev.metadata.hashtags.primary, newHashtag]
          }
        }
      }));
      setHashtagInput('');
    }
  };

  const removeHashtag = (hashtag) => {
    setContentData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        hashtags: {
          ...prev.metadata.hashtags,
          primary: prev.metadata.hashtags.primary.filter(h => h !== hashtag)
        }
      }
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !contentData.metadata.keywords.includes(keywordInput.trim())) {
      setContentData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          keywords: [...prev.metadata.keywords, keywordInput.trim()]
        }
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setContentData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        keywords: prev.metadata.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const saveContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/content`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contentData)
      });

      if (response.ok) {
        toast.success('Content saved successfully');
        // Reset form
        setContentData({
          content: {
            primary_text: '',
            platform_variants: {
              instagram: '',
              facebook: '',
              linkedin: '',
              youtube: ''
            }
          },
          media_assets: [],
          metadata: {
            hashtags: { primary: [], platform_specific: { instagram: [], linkedin: [], tiktok: [] } },
            keywords: [],
            target_audience: '',
            content_category: ''
          },
          scheduling: null,
          platform_config: {}
        });
        setUploadedFiles([]);
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const schedulePost = async () => {
    if (!scheduleData.platform || !scheduleData.account_id || !scheduleData.scheduled_time) {
      toast.error('Please fill in all scheduling fields');
      return;
    }

    setLoading(true);
    try {
      // First save the content
      const contentResponse = await fetch(`${API}/content`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contentData)
      });

      if (!contentResponse.ok) {
        throw new Error('Failed to save content');
      }

      const savedContent = await contentResponse.json();

      // Then schedule it
      const formData = new FormData();
      formData.append('content_id', savedContent.id);
      formData.append('platform', scheduleData.platform);
      formData.append('account_id', scheduleData.account_id);
      formData.append('scheduled_time', scheduleData.scheduled_time);

      const scheduleResponse = await fetch(`${API}/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (scheduleResponse.ok) {
        toast.success('Post scheduled successfully');
        setActiveTab('create');
        // Reset form
        setContentData({
          content: {
            primary_text: '',
            platform_variants: {
              instagram: '',
              facebook: '',
              linkedin: '',
              youtube: ''
            }
          },
          media_assets: [],
          metadata: {
            hashtags: { primary: [], platform_specific: { instagram: [], linkedin: [], tiktok: [] } },
            keywords: [],
            target_audience: '',
            content_category: ''
          },
          scheduling: null,
          platform_config: {}
        });
        setUploadedFiles([]);
        setScheduleData({
          platform: '',
          account_id: '',
          scheduled_time: ''
        });
      } else {
        throw new Error('Failed to schedule post');
      }
    } catch (error) {
      toast.error('Failed to schedule post');
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Creator</h1>
          <p className="text-gray-600 mt-1">Create and manage your social media content</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Content</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Post</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Content Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Content
                  </CardTitle>
                  <CardDescription>Write your main content and platform-specific variations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primary-text">Primary Text</Label>
                    <Textarea
                      id="primary-text"
                      placeholder="Write your main content here..."
                      value={contentData.content.primary_text}
                      onChange={(e) => handleInputChange('content', {
                        ...contentData.content,
                        primary_text: e.target.value
                      })}
                      className="min-h-32"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Platform Variations (Optional)</Label>
                    {Object.entries(contentData.content.platform_variants).map(([platform, text]) => (
                      <div key={platform} className="space-y-2">
                        <Label className="flex items-center gap-2 capitalize">
                          {getPlatformIcon(platform)}
                          {platform}
                        </Label>
                        <Textarea
                          placeholder={`Custom ${platform} content...`}
                          value={text}
                          onChange={(e) => handlePlatformVariantChange(platform, e.target.value)}
                          className="min-h-24"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Media Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Media Assets
                  </CardTitle>
                  <CardDescription>Upload images and videos for your posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Upload media files</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 up to 8MB</p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              {file.type === 'image' ? (
                                <img
                                  src={file.url}
                                  alt={file.filename}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Video className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metadata Sidebar */}
            <div className="space-y-6">
              {/* Hashtags */}
              <Card>
                <CardHeader>
                  <CardTitle>Hashtags</CardTitle>
                  <CardDescription>Add relevant hashtags</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add hashtag..."
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    />
                    <Button onClick={addHashtag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contentData.metadata.hashtags.primary.map((hashtag) => (
                      <Badge key={hashtag} variant="secondary" className="cursor-pointer">
                        #{hashtag}
                        <X
                          className="w-3 h-3 ml-1 hover:text-red-500"
                          onClick={() => removeHashtag(hashtag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>Keywords</CardTitle>
                  <CardDescription>Add content keywords</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword..."
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button onClick={addKeyword} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contentData.metadata.keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="cursor-pointer">
                        {keyword}
                        <X
                          className="w-3 h-3 ml-1 hover:text-red-500"
                          onClick={() => removeKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Info</CardTitle>
                  <CardDescription>Content categorization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Input
                      id="target-audience"
                      placeholder="e.g., Young professionals"
                      value={contentData.metadata.target_audience}
                      onChange={(e) => handleInputChange('metadata', {
                        ...contentData.metadata,
                        target_audience: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content-category">Content Category</Label>
                    <Input
                      id="content-category"
                      placeholder="e.g., Educational, Entertainment"
                      value={contentData.metadata.content_category}
                      onChange={(e) => handleInputChange('metadata', {
                        ...contentData.metadata,
                        content_category: e.target.value
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={saveContent}
                    disabled={loading}
                    className="w-full btn-primary"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Post
              </CardTitle>
              <CardDescription>Schedule your content to be published automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="platform-select">Platform</Label>
                  <select
                    id="platform-select"
                    value={scheduleData.platform}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, platform: e.target.value, account_id: '' }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select platform</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="account-select">Account</Label>
                  <select
                    id="account-select"
                    value={scheduleData.account_id}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, account_id: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!scheduleData.platform}
                  >
                    <option value="">Select account</option>
                    {accounts
                      .filter(account => account.platform === scheduleData.platform)
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          @{account.username}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="scheduled-time">Scheduled Time</Label>
                <Input
                  id="scheduled-time"
                  type="datetime-local"
                  value={scheduleData.scheduled_time}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <Button
                onClick={schedulePost}
                disabled={loading || !scheduleData.platform || !scheduleData.account_id || !scheduleData.scheduled_time}
                className="w-full btn-primary"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule Post
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentCreator;