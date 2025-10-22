import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function PromptCard({ prompt, onDelete, showActions = true }) {
  const navigate = useNavigate();
  
  // Copy prompt to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    toast.success('Prompt copied to clipboard');
  };

  return (
    <Card className="border-border/50 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{prompt.title}</CardTitle>
            {prompt.description && (
              <CardDescription className="mt-1">
                {prompt.description}
              </CardDescription>
            )}
          </div>
          {prompt.source === 'marketplace' && (
            <Badge variant="secondary" className="ml-2">
              Marketplace
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {prompt.content}
          </p>
          
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(prompt._id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
