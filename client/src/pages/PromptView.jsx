import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Download, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { promptsAPI, aiAPI } from '@/services/api';

export default function PromptView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { prompt, mode = 'view', pack } = location.state || {}; // mode: 'view' (marketplace) or 'edit' (dashboard)
  
  // Prompt content state
  const [promptContent, setPromptContent] = useState('');
  
  // Loading states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (prompt) {
      setPromptContent(prompt.content || '');
    } else {
      toast.error('No prompt data found');
      navigate(-1);
    }
  }, [prompt, navigate]);

  const handleEnhance = async () => {
    if (!promptContent.trim()) {
      toast.error('No content to enhance');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await aiAPI.enhance(promptContent);
      const enhanced = response.enhancedPrompt || '';
      if (enhanced) {
        setPromptContent(enhanced);
        toast.success('Prompt enhanced successfully!');
      } else {
        toast.error('No enhanced prompt received');
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      toast.error('Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (!promptContent.trim()) {
      toast.error('Prompt content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      if (mode === 'edit') {
        // Update existing prompt
        await promptsAPI.update(prompt._id, {
          ...prompt,
          content: promptContent,
          // Preserve marketplaceCategory for analytics
          marketplaceCategory: prompt.marketplaceCategory
        });
        toast.success('Prompt updated successfully!');
        navigate('/dashboard');
      } else {
        // View mode - install from marketplace
        await promptsAPI.create({
          title: prompt.title,
          content: promptContent,
          tags: [...(prompt.tags || []), ...(promptContent !== prompt.content ? ['enhanced'] : [])],
          category: pack?.name || prompt.category || 'Downloaded',
          marketplaceCategory: pack?.category || prompt.marketplaceCategory || null,
          source: 'marketplace'
        });
        toast.success('Prompt installed successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error(mode === 'edit' ? 'Failed to update prompt' : 'Failed to install prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const getPageTitle = () => {
    if (mode === 'edit') return 'Edit Prompt';
    return prompt?.title || 'View Prompt';
  };

  const getBackPath = () => {
    if (mode === 'view') return '/marketplace';
    return '/dashboard';
  };

  if (!prompt) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(getBackPath())}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {mode === 'view' ? 'Marketplace' : 'Dashboard'}
          </Button>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{getPageTitle()}</h1>
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {prompt.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Prompt Content Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'edit' ? 'Prompt Content' : 'Prompt'}
              </CardTitle>
              <CardDescription>
                {mode === 'edit'
                  ? 'Edit your prompt'
                  : 'View this prompt'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={promptContent}
                    onChange={mode === 'edit' ? (e) => setPromptContent(e.target.value) : undefined}
                    readOnly={mode === 'view'}
                    rows={12}
                    className={`font-mono text-sm pr-24 ${mode === 'view' ? 'bg-muted' : ''}`}
                  />
                  {promptContent && (
                    <Button
                      onClick={handleEnhance}
                      disabled={isEnhancing}
                      variant="outline"
                      size="sm"
                      className="absolute bottom-3 right-3"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isEnhancing ? 'Enhancing...' : 'Enhance'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !promptContent.trim()}
            >
              {mode === 'view' ? (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {isSaving ? 'Installing...' : 'Install Prompt'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(getBackPath())}
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
