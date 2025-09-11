import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Calendar, DollarSign, Users, Camera, ChevronRight, Plus, FolderOpen } from 'lucide-react';
import { Project } from '../types/project';

interface ProjectDashboardProps {
  projects: Project[];
  onViewProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function ProjectDashboard({ projects, onViewProject, onCreateProject }: ProjectDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return (completedTasks / project.tasks.length) * 100;
  };

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'TBD';
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <FolderOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Start your home improvement journey by creating your first project.
        </p>
        <Button onClick={onCreateProject} className="w-full max-w-xs">
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Project
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Active Projects</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''} in progress
          </p>
        </div>
      </div>

      {/* Project Cards */}
      <div className="space-y-3">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="hover:shadow-md transition-shadow active:scale-95 transition-transform cursor-pointer"
            onClick={() => onViewProject(project.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium leading-tight line-clamp-2 mb-1">
                    {project.name || 'Untitled Project'}
                  </h3>
                  <Badge className={`${getStatusColor(project.status)} text-xs`}>
                    {(project.status || 'planning').replace('-', ' ')}
                  </Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(calculateProgress(project))}%</span>
                </div>
                <Progress value={calculateProgress(project)} className="h-2" />
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-muted-foreground text-xs">Due Date</div>
                    <div className="font-medium truncate">
                      {formatDate(project.estimatedCompletionDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-muted-foreground text-xs">Budget</div>
                    <div className="font-medium truncate">{formatCurrency(project.budget)}</div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{project.tasks?.length || 0} tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  <span>{project.photos?.length || 0} photos</span>
                </div>
                {project.projectedValue && (
                  <div className="text-green-600 font-medium">
                    +{formatCurrency(project.projectedValue)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}