import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Project } from '../types/project';

interface ProjectFormProps {
  project?: Project;
  onSave: (project: Partial<Project>) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    targetStartDate: project?.targetStartDate || '',
    estimatedCompletionDate: project?.estimatedCompletionDate || '',
    budget: project?.budget?.toString() || '',
    projectedValue: project?.projectedValue?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData: Partial<Project> = {
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      projectedValue: parseFloat(formData.projectedValue) || undefined,
      updatedDate: new Date().toISOString(),
    };

    if (!project) {
      projectData.id = `project-${Date.now()}`;
      projectData.createdDate = new Date().toISOString();
      projectData.tasks = [];
      projectData.photos = [];
      projectData.notes = [];
      projectData.estimates = [];
      projectData.receipts = [];
      projectData.contractors = [];
    }

    onSave(projectData);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="min-h-full">
      {/* Mobile Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">
          {project ? 'Edit Project' : 'New Project'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Kitchen Renovation"
                required
                className="h-12 text-base"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project goals and scope..."
                rows={4}
                className="text-base resize-none"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dates */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Target Start Date</Label>
                <Input
                  type="date"
                  value={formatDateForInput(formData.targetStartDate)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    targetStartDate: e.target.value ? new Date(e.target.value).toISOString() : ''
                  }))}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Estimated Completion</Label>
                <Input
                  type="date"
                  value={formatDateForInput(formData.estimatedCompletionDate)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimatedCompletionDate: e.target.value ? new Date(e.target.value).toISOString() : ''
                  }))}
                  className="h-12 text-base"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="10000"
                min="0"
                step="100"
                className="h-12 text-base"
              />
            </div>

            {/* Projected Value */}
            <div className="space-y-2">
              <Label htmlFor="projectedValue" className="text-sm">Expected Home Value Increase ($)</Label>
              <Input
                id="projectedValue"
                type="number"
                value={formData.projectedValue}
                onChange={(e) => setFormData(prev => ({ ...prev, projectedValue: e.target.value }))}
                placeholder="15000"
                min="0"
                step="1000"
                className="h-12 text-base"
              />
              <p className="text-xs text-muted-foreground">
                How much this project might increase your home's value
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          <Button type="submit" className="w-full h-12">
            <Save className="h-4 w-4 mr-2" />
            {project ? 'Update Project' : 'Create Project'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="w-full h-12">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}