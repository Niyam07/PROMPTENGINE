import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { promptsAPI, aiAPI } from '@/services/api';

export default function CreatePrompt() {
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [userInput, setUserInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Add tag to list
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove tag from list
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Generate prompt using AI
  const handleGenerateWithAI = async () => {
    if (!userInput.trim()) {
      toast.error('Please enter your prompt idea or requirements');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🔄 Calling enhance API with input:', userInput);
      const response = await aiAPI.enhance(userInput);
      console.log('✅ API Response:', response);
      
      const enhanced = response.enhancedPrompt || '';
      console.log('📝 Enhanced prompt:', enhanced);
      
      if (enhanced) {
        setGeneratedPrompt(enhanced);
        toast.success('Prompt generated successfully!');
      } else {
        console.error('❌ No enhanced prompt in response:', response);
        toast.error('No prompt generated');
      }
    } catch (error) {
      console.error('❌ Error generating prompt:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhance existing prompt with AI
  const handleEnhance = async () => {
    if (!generatedPrompt.trim()) {
      toast.error('Please generate a prompt first');
      return;
    }

    setIsEnhancing(true);
    try {
      console.log('🔄 Calling enhance API with prompt:', generatedPrompt);
      const response = await aiAPI.enhance(generatedPrompt);
      console.log('✅ API Response:', response);
      
      const enhanced = response.enhancedPrompt || '';
      console.log('📝 Enhanced prompt:', enhanced);
      
      if (enhanced) {
        setGeneratedPrompt(enhanced);
        toast.success('Prompt enhanced successfully!');
      } else {
        console.error('❌ No enhanced prompt in response:', response);
        toast.error('No enhanced prompt received');
      }
    } catch (error) {
      console.error('❌ Error enhancing prompt:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Save prompt to database
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !generatedPrompt.trim()) {
      toast.error('Please fill in all required fields and generate a prompt');
      return;
    }

    setIsLoading(true);
    try {
      await promptsAPI.create({
        title: title.trim(),
        description: '',
        content: generatedPrompt.trim(),
        tags,
        source: 'created'
      });
      
      toast.success('Prompt saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Failed to save prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Prompt</h1>
          <p className="text-muted-foreground">
            Design and save your custom AI prompts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Details</CardTitle>
              <CardDescription>
                Enter the basic information for your prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Spell Name *</Label>
                <Input
                  id="title"
                  placeholder="Name your spell..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userInput">Prompt Spell *</Label>
                <Textarea
                  id="userInput"
                  placeholder="Describe your prompt logic - Prompt Engine shall obey!"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || !userInput.trim()}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Prompt</CardTitle>
              <CardDescription>
                AI-generated prompt will be displayed here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Textarea
                    id="generatedPrompt"
                    placeholder="Generated prompt will be displayed here..."
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    rows={10}
                    className="font-mono text-sm pr-24"
                  />
                  {generatedPrompt && (
                    <Button
                      type="button"
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
                {!generatedPrompt && (
                  <p className="text-sm text-muted-foreground italic">
                    Click "Generate with AI" to create your prompt
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading || !generatedPrompt.trim()}>
              {isLoading ? 'Saving...' : 'Save Prompt'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
