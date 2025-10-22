import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { StatCard } from '@/components/StatCard';
import { PromptCard } from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Heart, Plus, Trash2, ShoppingBag, FolderDown, Clock, Library } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { promptsAPI } from '@/services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrompts: 0,
    createdPrompts: 0,
    marketplacePrompts: 0,
    totalLibrary: 0,
  });

  // Load prompts when component mounts
  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);

  // Refresh when user comes back to tab
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchPrompts();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Fetch all prompts from API
  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await promptsAPI.getAll();
      const data = response.data || [];
      console.log('📊 Fetched prompts:', data);
      
      setPrompts(data);
      
      // Calculate stats
      const createdCount = data.filter((p) => p.source === 'created').length;
      const marketplaceCount = data.filter((p) => p.source === 'marketplace').length;
      const totalDownloads = data.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
      
      console.log('📈 Stats:', {
        total: data.length,
        created: createdCount,
        marketplace: marketplaceCount,
        downloads: totalDownloads
      });
      
      setStats({
        totalPrompts: data.length,
        createdPrompts: createdCount,
        marketplacePrompts: marketplaceCount,
        totalLibrary: totalDownloads,
      });
    } catch (error) {
      console.error('❌ Error fetching prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  // Delete prompt handler
  const handleDelete = async (promptId) => {
    try {
      await promptsAPI.delete(promptId);
      toast.success('Prompt deleted successfully');
      fetchPrompts(); // reload list
    } catch (error) {
      console.error('❌ Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
    }
  };

  // Filter prompts by source
  const createdPrompts = prompts.filter((p) => p.source === 'created');
  const marketplacePrompts = prompts.filter((p) => p.source === 'marketplace');

  // Show loading spinner
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
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your AI prompts and explore the marketplace
          </p>
        </div>

        {/* Info cards section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main guide card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle>Master the Art of Prompt Engineering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to your prompt engineering workspace! Crafting effective prompts is both an art and a science. 
                The quality of your AI interactions depends heavily on how well you structure your instructions.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Pro Tip:</strong> Great prompts are specific, contextual, and goal-oriented. 
                Start with a clear objective, provide relevant context, and specify the desired output format. 
                Experiment with different approaches and save your best-performing prompts for future use.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="text-xs">Be Specific</Badge>
                <Badge variant="secondary" className="text-xs">Add Context</Badge>
                <Badge variant="secondary" className="text-xs">Define Format</Badge>
                <Badge variant="secondary" className="text-xs">Iterate & Refine</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Features card */}
          <Card className="bg-gradient-to-br from-slate-900/40 to-zinc-800/30 border-slate-700/50">
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {/* Feature list items */}
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Design</strong> professional prompts from scratch with our intuitive editor
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Discover</strong> and install high-quality prompts from the marketplace
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Enhance</strong> your prompts using AI-powered optimization tools
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Monitor</strong> usage patterns and insights through analytics dashboard
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => navigate('/create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Prompt
          </Button>
          <Button variant="outline" onClick={() => navigate('/marketplace')} className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Browse Marketplace
          </Button>
        </div>

        {/* Prompts Tabs */}
        <Tabs defaultValue="created" className="space-y-6">
          <TabsList>
            <TabsTrigger value="created">Created ({stats.createdPrompts})</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace ({stats.marketplacePrompts})</TabsTrigger>
            <TabsTrigger value="all">All Prompts ({stats.totalPrompts})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {prompts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Get started by creating your first prompt or exploring the marketplace
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate('/create')}>Create Prompt</Button>
                    <Button variant="outline" onClick={() => navigate('/marketplace')}>
                      Browse Marketplace
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map((prompt) => (
                  <PromptCard
                    key={prompt._id}
                    prompt={prompt}
                    onDelete={handleDelete}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="created" className="space-y-6">
            {createdPrompts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No created prompts</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start creating your own custom prompts
                  </p>
                  <Button onClick={() => navigate('/create')}>Create Your First Prompt</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {createdPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt._id}
                    prompt={prompt}
                    onDelete={handleDelete}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            {marketplacePrompts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderDown className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No marketplace prompts</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Explore the marketplace to find and install useful prompts
                  </p>
                  <Button onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplacePrompts.map((prompt) => (
                  <PromptCard
                    key={prompt._id}
                    prompt={prompt}
                    onDelete={handleDelete}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
