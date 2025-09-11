import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Checkbox } from './ui/checkbox';
import { Plus, User, Calendar, Trash2, Edit2 } from 'lucide-react';
import { Task } from '../types/project';

interface TaskListProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export function TaskList({ tasks, onUpdateTasks }: TaskListProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    assignedTo: '',
    dueDate: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddTask = () => {
    if (!newTask.name.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      name: newTask.name,
      description: newTask.description || undefined,
      status: 'pending',
      assignedTo: newTask.assignedTo || undefined,
      dueDate: newTask.dueDate || undefined,
    };

    onUpdateTasks([...tasks, task]);
    setNewTask({ name: '', description: '', assignedTo: '', dueDate: '' });
    setIsAddingTask(false);
  };

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status,
          completedDate: status === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return task;
    });
    onUpdateTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter(task => task.id !== taskId));
  };

  const groupedTasks = {
    pending: tasks.filter(t => t.status === 'pending'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  const TaskForm = ({ task, onSave, onCancel }: { 
    task?: Task; 
    onSave: (taskData: any) => void; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState({
      name: task?.name || newTask.name,
      description: task?.description || newTask.description,
      assignedTo: task?.assignedTo || newTask.assignedTo,
      dueDate: task?.dueDate || newTask.dueDate,
    });

    return (
      <div className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-sm">Task Name *</Label>
            <Input
              id="taskName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Install kitchen cabinets"
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskDescription" className="text-sm">Description</Label>
            <Input
              id="taskDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional details..."
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignedTo" className="text-sm">Assigned To</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              placeholder="Person or contractor name"
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                dueDate: e.target.value ? new Date(e.target.value).toISOString() : ''
              }))}
              className="h-12 text-base"
            />
          </div>
        </div>
        <div className="space-y-3">
          <Button 
            onClick={() => {
              onSave(formData);
              onCancel();
            }} 
            className="w-full h-12"
            disabled={!formData.name.trim()}
          >
            {task ? 'Update Task' : 'Add Task'}
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full h-12">
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Tasks</h3>
        <Sheet open={isAddingTask} onOpenChange={setIsAddingTask}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Add New Task</SheetTitle>
            </SheetHeader>
            <TaskForm
              onSave={(formData) => {
                setNewTask(formData);
                handleAddTask();
              }}
              onCancel={() => setIsAddingTask(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-2">No Tasks Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Break down your project into manageable tasks.
            </p>
            <Button onClick={() => setIsAddingTask(true)} variant="outline">
              Add Your First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => {
            if (statusTasks.length === 0) return null;
            
            return (
              <Card key={status}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {status === 'pending' && 'To Do'}
                      {status === 'in-progress' && 'In Progress'}
                      {status === 'completed' && 'Completed'}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {statusTasks.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statusTasks.map((task) => (
                      <div
                        key={task.id}
                        className="border rounded-lg p-3 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={task.status === 'completed'}
                            onCheckedChange={(checked) => {
                              handleUpdateTaskStatus(
                                task.id,
                                checked ? 'completed' : 'pending'
                              );
                            }}
                            className="mt-1 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium leading-tight ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.name}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {task.assignedTo && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-20">{task.assignedTo}</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Select
                              value={task.status}
                              onValueChange={(value) => handleUpdateTaskStatus(task.id, value as Task['status'])}
                            >
                              <SelectTrigger className="w-24 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">To Do</SelectItem>
                                <SelectItem value="in-progress">Active</SelectItem>
                                <SelectItem value="completed">Done</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}