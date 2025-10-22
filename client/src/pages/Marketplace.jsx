import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Star, Package, Eye, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { marketplaceAPI, aiAPI, promptsAPI } from '@/services/api';

export default function Marketplace() {
  const navigate = useNavigate();
  
  // State for packs and filtering
  const [packs, setPacks] = useState([]);
  const [filteredPacks, setFilteredPacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterRating, setFilterRating] = useState('all');
  const [loading, setLoading] = useState(true);
  const [installingId, setInstallingId] = useState(null);
  
  // Dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('visual');

  // Category definitions
  const categories = {
    visual: {
      name: 'Visual',
      description: 'Creative visual content generation prompts',
      packs: ['Ghibli Style', 'Midjourney V6', 'Anime/Fantasy', 'Product Mockups', 'Thumbnail Creator']
    },
    informational: {
      name: 'Informational',
      description: 'Professional and productivity prompts',
      packs: ['After Graduation', 'Professional Communication', 'Office Productivity']
    },
    student: {
      name: 'Student',
      description: 'Academic and learning prompts',
      packs: ['Projects & Mini Projects', 'Analysis Module', 'Assignments & Exams', 'Branches']
    }
  };

  // Load packs on mount
  useEffect(() => {
    fetchPacks();
  }, []);

  // Filter and sort packs when search/filters change
  useEffect(() => {
    let filtered = [...packs];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(pack =>
        pack.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pack.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply rating filter
    if (filterRating !== 'all') {
      const minRating = parseFloat(filterRating);
      filtered = filtered.filter(pack => (pack.rating || 0) >= minRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'installs':
          return (b.installs || 0) - (a.installs || 0);
        case 'prompts':
          return (b.assets?.length || 0) - (a.assets?.length || 0);
        default:
          return 0;
      }
    });

    setFilteredPacks(filtered);
  }, [searchQuery, packs, sortBy, filterRating]);

  // Filter packs by category
  const getPacksByCategory = (category) => {
    return filteredPacks.filter(pack => pack.category === category);
  };

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const response = await marketplaceAPI.getAll();
      setPacks(response.data || []);
      setFilteredPacks(response.data || []);
    } catch (error) {
      console.error('Error fetching marketplace packs:', error);
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallPack = async (packId) => {
    setInstallingId(packId);
    try {
      await marketplaceAPI.install(packId);
      toast.success('All prompts from pack installed successfully!');
      fetchPacks();
    } catch (error) {
      console.error('Error installing pack:', error);
      toast.error('Failed to install pack');
    } finally {
      setInstallingId(null);
    }
  };

  const handleViewPack = (pack) => {
    setSelectedPack(pack);
    setViewDialogOpen(true);
  };

  const handleViewIndividualPrompt = (prompt) => {
    // Pass the selected pack info along with the prompt
    navigate('/prompt', { state: { prompt, mode: 'view', pack: selectedPack } });
  };


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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Prompt Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and install professional prompts from the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="installs">Most Installed</SelectItem>
                <SelectItem value="prompts">Most Prompts</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter by Rating */}
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || sortBy !== 'name' || filterRating !== 'all') && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary">Search: {searchQuery}</Badge>
              )}
              {sortBy !== 'name' && (
                <Badge variant="secondary">Sort: {sortBy}</Badge>
              )}
              {filterRating !== 'all' && (
                <Badge variant="secondary">Rating: {filterRating}+</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSortBy('name');
                  setFilterRating('all');
                }}
                className="h-6 px-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="informational">Informational</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
          </TabsList>

          {Object.entries(categories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1">{category.name}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>

              {/* Marketplace Grid */}
              {getPacksByCategory(key).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No packs found</h3>
                    <p className="text-muted-foreground text-center">
                      {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new packs'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPacksByCategory(key).map((pack) => (
              <Card key={pack._id} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pack.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {pack.description || 'No description available'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pack.tags && pack.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pack.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {pack.installs || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {pack.rating || 0}
                        </span>
                      </div>
                      <span className="text-xs">
                        {pack.assets?.length || 0} prompts
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewPack(pack)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleInstallPack(pack._id)}
                        disabled={installingId === pack._id}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {installingId === pack._id ? 'Installing...' : 'Install Pack'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* View Pack Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPack?.name}</DialogTitle>
            <DialogDescription>{selectedPack?.description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedPack?.assets?.map((prompt, index) => (
              <Card key={index} className="border hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {prompt.title}
                      </CardTitle>
                      {prompt.tags && prompt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {prompt.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {prompt.content}
                  </p>
                  <Button
                    onClick={() => handleViewIndividualPrompt(prompt)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Prompt
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
