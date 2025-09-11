import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { Home, FolderOpen, History, Plus, Menu, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isGuest, signOut } = useAuth();

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'history', label: 'History', icon: History },
  ];

  const getPageTitle = () => {
    switch (currentView) {
      case 'home': return 'Home Projects';
      case 'projects': return 'Active Projects';
      case 'history': return 'Home History';
      case 'project-detail': return 'Project Details';
      case 'create-project': return 'New Project';
      case 'edit-project': return 'Edit Project';
      default: return 'Home Projects';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-medium truncate">{getPageTitle()}</h1>
            </div>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        {isGuest ? (
                          <div>
                            <p className="font-medium">Guest User</p>
                            <Badge variant="secondary" className="text-xs">Demo Mode</Badge>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">{user?.email}</p>
                            <Badge variant="outline" className="text-xs">Authenticated</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-medium mb-4">Menu</h2>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        onViewChange('create-project');
                        setIsMenuOpen(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-3" />
                      New Project
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        onViewChange('setup');
                        setIsMenuOpen(false);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Supabase Setup
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {isGuest ? 'Exit Demo' : 'Sign Out'}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="grid grid-cols-3 h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || 
              (item.id === 'projects' && ['projects', 'project-detail', 'create-project', 'edit-project'].includes(currentView));
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/5' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button - only show on home and projects */}
      {(currentView === 'home' || currentView === 'projects') && (
        <Button
          onClick={() => onViewChange('create-project')}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40"
          size="sm"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}