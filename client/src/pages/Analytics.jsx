import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, Package, Activity } from 'lucide-react';
import { promptsAPI } from '@/services/api';

export default function Analytics() {
  // Stats state
  const [stats, setStats] = useState({
    totalPrompts: 0,
    downloadedPrompts: 0,
    createdPrompts: 0,
    totalCategories: 0,
    recentActivity: 0
  });
  
  // Chart data
  const [categoryData, setCategoryData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Fetch and process analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await promptsAPI.getAll();
      const prompts = response.data || [];
      
      console.log('Total prompts:', prompts.length);
      console.log('Sample prompt:', prompts[0]);

      // Split by source
      const downloadedPrompts = prompts.filter(p => p.source === 'marketplace');
      const createdPrompts = prompts.filter(p => p.source === 'created');
      
      console.log('Downloaded:', downloadedPrompts.length);
      console.log('Created:', createdPrompts.length);

      // Count prompts by category
      const categories = {};
      prompts.forEach(prompt => {
        let category = 'User Created';
        
        // Check if it's from marketplace
        if (prompt.source === 'marketplace' && prompt.marketplaceCategory) {
          // Use marketplaceCategory (visual/informational/student)
          // Capitalize first letter: visual → Visual
          category = prompt.marketplaceCategory.charAt(0).toUpperCase() + prompt.marketplaceCategory.slice(1);
        } 
        // User created prompts - keep as "User Created" unless they set a custom category
        else if (prompt.source === 'created' && prompt.category && prompt.category !== 'User Created') {
          category = prompt.category;
        }
        
        categories[category] = (categories[category] || 0) + 1;
      });

      // Prepare category data for charts
      const categoryChartData = Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      
      console.log('Categories:', categories);
      console.log('Category chart data:', categoryChartData);

      // Prepare source data (Downloaded vs Created)
      const sourceChartData = [
        { name: 'Downloaded', value: downloadedPrompts.length },
        { name: 'Created', value: createdPrompts.length }
      ].filter(item => item.value > 0);

      // Prepare activity data for last 7 days with REAL data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // Count prompts created/downloaded on this day
        const dayPrompts = prompts.filter(p => {
          const promptDate = new Date(p.createdAt);
          return promptDate >= date && promptDate < nextDate;
        });
        
        const downloaded = dayPrompts.filter(p => p.source === 'marketplace').length;
        const created = dayPrompts.filter(p => p.source === 'created').length;
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          Downloaded: downloaded,
          Created: created,
          Total: downloaded + created
        };
      });

      setStats({
        totalPrompts: prompts.length,
        downloadedPrompts: downloadedPrompts.length,
        createdPrompts: createdPrompts.length,
        totalCategories: Object.keys(categories).length,
        recentActivity: prompts.filter(p => {
          const createdDate = new Date(p.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length
      });

      setCategoryData(categoryChartData);
      setSourceData(sourceChartData);
      setActivityData(last7Days);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your prompt usage and activity</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrompts}</div>
            <p className="text-xs text-muted-foreground">All your prompts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloaded</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloadedPrompts}</div>
            <p className="text-xs text-muted-foreground">From marketplace</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.createdPrompts}</div>
            <p className="text-xs text-muted-foreground">By you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Activity Trend</CardTitle>
            <CardDescription>Downloaded and created prompts over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Downloaded" stroke="#3498db" strokeWidth={2} />
                <Line type="monotone" dataKey="Created" stroke="#2ecc71" strokeWidth={2} />
                <Line type="monotone" dataKey="Total" stroke="#e74c3c" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Sources</CardTitle>
            <CardDescription>Downloaded vs Created prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#3498db" />
                  <Cell fill="#2ecc71" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Prompts by Category</CardTitle>
            <CardDescription>Distribution across Visual, Informational, Student, and User Created</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#e74c3c">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Percentage breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
