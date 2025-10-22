import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Package, GitBranch } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Show nothing while redirecting
  if (user) {
    return null;
  }
  
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Generate high-quality prompts instantly with advanced AI assistance',
    },
    {
      icon: Package,
      title: 'Prompt Marketplace',
      description: 'Browse and install curated prompt packs from the community',
    },
    {
      icon: GitBranch,
      title: 'Version Control',
      description: 'Track changes and maintain multiple versions of your prompts',
    },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>Prompt Engine</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        {/* Hero Section */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 text-center">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-red-700 to-green-200 bg-clip-text text-transparent">
              Master Your AI Prompts
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create, enhance, and manage professional AI prompts with intelligent assistance. 
              Join the marketplace and access thousands of battle-tested templates.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/signup')}>
                Create Prompt
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Explore Marketplace
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Prompt Engine?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="border-border/50 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
