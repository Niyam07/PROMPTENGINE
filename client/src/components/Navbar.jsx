import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Settings, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Check if current page is active
  const isActive = (path) => {
    return location.pathname === path;
  }
  
  // Get user initials for avatar
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo section */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold">
              <Zap className="h-6 w-6 text-primary" />
              Prompt Engine
            </Link>
          </div>
          
          {/* Right side - nav links and user menu */}
          <div className="flex items-center gap-6">
            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/dashboard') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/marketplace"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/marketplace') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Marketplace
              </Link>
              <Link
                to="/analytics"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/analytics') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Analytics
              </Link>
            </nav>
            
            {/* Create button */}
            <Button onClick={() => navigate('/create')} size="sm">
              + Create Prompt
            </Button>
            
            {/* User dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    My Workspace • free
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  signOut(); // logout user
                  navigate('/'); // go to home
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}