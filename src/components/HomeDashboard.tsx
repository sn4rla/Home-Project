import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Home, TrendingUp, Calendar, DollarSign, Plus, ChevronRight, Hammer, CheckCircle, Settings } from 'lucide-react';
import { Home as HomeType, Project, HomeHistoryEntry } from '../types/project';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';

interface HomeDashboardProps {
  home: HomeType | null;
  projects: Project[];
  homeHistory: HomeHistoryEntry[];
  onCreateProject: () => void;
  onViewProjects: () => void;
  onViewProject: (projectId: string) => void;
}

export function HomeDashboard({ 
  home, 
  projects, 
  homeHistory, 
  onCreateProject, 
  onViewProjects,
  onViewProject 
}: HomeDashboardProps) {
  const { isGuest } = useAuth();
  // Handle case where home data is not available
  if (!home) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-2">Welcome to HomeProject Pro</h4>
            <p className="text-sm text-muted-foreground mb-6">
              This app helps you track home improvement projects and their impact on your property value.
            </p>
            <Button onClick={onCreateProject} className="w-full max-w-xs">
              <Plus className="h-4 w-4 mr-2" />
              Start Your First Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'planning');
  const completedProjects = projects.filter(p => p.status === 'completed');
  
  // Calculate projected value increase from active projects
  const projectedValueIncrease = activeProjects.reduce(
    (sum, project) => sum + (project.projectedValue || 0), 
    0
  );

  // Calculate actual value added from completed projects
  const actualValueAdded = [
    ...completedProjects.map(p => p.actualValue || p.projectedValue || 0),
    ...homeHistory.map(h => h.actualValue || h.projectedValue || 0)
  ].reduce((sum, value) => sum + value, 0);

  const projectedHomeValue = (home?.currentValue || 0) + projectedValueIncrease;
  const totalValueGain = (home?.currentValue || 0) + actualValueAdded - (home?.purchasePrice || 0);

  const calculateProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return (completedTasks / project.tasks.length) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Alert */}
      {isGuest && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            You're in demo mode. To save data and use all features, check the menu for Supabase setup instructions.
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-medium">Welcome Home</h1>
          <p className="text-muted-foreground">{home.address}</p>
        </div>

        {/* Home Photo */}
        {home.photos && home.photos.length > 0 && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <ImageWithFallback
              src={home.photos[0]}
              alt="Your home"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Home Value Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Home Value Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Purchase Price</div>
              <div className="text-lg font-medium">{formatCurrency(home.purchasePrice)}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(home.purchaseDate).getFullYear()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Current Value</div>
              <div className="text-lg font-medium">{formatCurrency(home.currentValue)}</div>
              <div className="text-xs text-green-600">
                +{formatCurrency(totalValueGain)} gained
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Projected Value</span>
            </div>
            <div className="text-xl font-medium text-green-800">
              {formatCurrency(projectedHomeValue)}
            </div>
            <div className="text-sm text-green-600">
              +{formatCurrency(projectedValueIncrease)} from planned projects
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <Hammer className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-lg font-medium">{activeProjects.length}</div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-lg font-medium">
              {completedProjects.length + homeHistory.length}
            </div>
            <div className="text-sm text-muted-foreground">Completed Projects</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects Summary */}
      {activeProjects.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Projects</CardTitle>
              <Button variant="ghost" size="sm" onClick={onViewProjects}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onViewProject(project.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-1">{project.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                      {project.projectedValue && (
                        <span className="text-xs text-green-600">
                          +{formatCurrency(project.projectedValue)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{Math.round(calculateProjectProgress(project))}%</span>
                  </div>
                  <Progress value={calculateProjectProgress(project)} className="h-2" />
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Due {new Date(project.estimatedCompletionDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{formatCurrency(project.budget)}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Hammer className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-2">No Active Projects</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Start improving your home and tracking its value by creating your first project.
            </p>
            <Button onClick={onCreateProject} className="w-full max-w-xs">
              <Plus className="h-4 w-4 mr-2" />
              Start Your First Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Completions */}
      {(completedProjects.length > 0 || homeHistory.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Show recent completed projects */}
              {completedProjects.slice(0, 2).map((project) => (
                <div key={project.id} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.actualCompletionDate && 
                        new Date(project.actualCompletionDate).toLocaleDateString()
                      }
                    </div>
                  </div>
                  {(project.actualValue || project.projectedValue) && (
                    <div className="text-sm text-green-600 flex-shrink-0">
                      +{formatCurrency(project.actualValue || project.projectedValue || 0)}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Show recent history entries */}
              {homeHistory.slice(0, 2).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">{entry.projectName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.completionDate).toLocaleDateString()}
                    </div>
                  </div>
                  {(entry.actualValue || entry.projectedValue) && (
                    <div className="text-sm text-green-600 flex-shrink-0">
                      +{formatCurrency(entry.actualValue || entry.projectedValue || 0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onCreateProject} className="h-12">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
        <Button variant="outline" onClick={onViewProjects} className="h-12">
          View All Projects
        </Button>
      </div>
    </div>
  );
}