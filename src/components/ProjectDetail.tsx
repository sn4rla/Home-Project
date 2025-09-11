import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ArrowLeft, Edit, Calendar, DollarSign, TrendingUp, MoreVertical, CheckCircle, Clock, Circle } from 'lucide-react';
import { Project, Task } from '../types/project';
import { TaskList } from './TaskList';
import { PhotoGallery } from './PhotoGallery';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onUpdateProject: (project: Project) => void;
}

export function ProjectDetail({ project, onBack, onEdit, onUpdateProject }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateProgress = () => {
    if (project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return (completedTasks / project.tasks.length) * 100;
  };

  const getTasksByStatus = (status: string) => {
    return project.tasks.filter(task => task.status === status);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-medium line-clamp-1">{project.name}</h1>
            <p className="text-xs text-muted-foreground">
              Created {new Date(project.createdDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('-', ' ')}
          </Badge>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <div className="py-4">
                <Button
                  onClick={() => {
                    onEdit();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full h-12 justify-start"
                >
                  <Edit className="h-4 w-4 mr-3" />
                  Edit Project
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs">
            Tasks
            <span className="ml-1 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
              {project.tasks.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="text-xs">
            Photos
            <span className="ml-1 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
              {project.photos.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="finances" className="text-xs">Money</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Progress Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{Math.round(calculateProgress())}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <Circle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-lg font-medium">{getTasksByStatus('pending').length}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="text-lg font-medium">{getTasksByStatus('in-progress').length}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-lg font-medium">{getTasksByStatus('completed').length}</div>
                  <div className="text-xs text-muted-foreground">Done</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Info Cards */}
          <div className="grid gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Timeline</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(project.targetStartDate).toLocaleDateString()} - {new Date(project.estimatedCompletionDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Budget</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(project.budget)} planned
                      {project.actualCost && ` • ${formatCurrency(project.actualCost)} actual`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {project.projectedValue && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">Home Value Impact</div>
                      <div className="text-xs text-muted-foreground">
                        +{formatCurrency(project.projectedValue)} projected
                        {project.actualValue && ` • +${formatCurrency(project.actualValue)} actual`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {project.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          <TaskList 
            tasks={project.tasks}
            onUpdateTasks={(tasks) => onUpdateProject({ ...project, tasks })}
          />
        </TabsContent>

        <TabsContent value="photos">
          <PhotoGallery 
            photos={project.photos}
            onUpdatePhotos={(photos) => onUpdateProject({ ...project, photos })}
          />
        </TabsContent>

        <TabsContent value="finances">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Budget Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-medium">{formatCurrency(project.budget)}</div>
                    <div className="text-xs text-muted-foreground">Planned Budget</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-green-600">
                      {formatCurrency(project.receipts.reduce((sum, receipt) => sum + receipt.amount, 0))}
                    </div>
                    <div className="text-xs text-muted-foreground">Spent So Far</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {project.receipts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.receipts.slice(0, 5).map((receipt) => (
                      <div key={receipt.id} className="flex items-center justify-between py-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{receipt.vendor}</div>
                          <div className="text-xs text-muted-foreground">{receipt.category}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-medium">{formatCurrency(receipt.amount)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(receipt.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}