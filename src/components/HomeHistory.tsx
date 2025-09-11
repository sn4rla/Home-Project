import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Plus, Calendar, DollarSign, TrendingUp, Eye, Edit } from 'lucide-react';
import { HomeHistoryEntry } from '../types/project';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useData } from '../contexts/DataContext';

interface HomeHistoryProps {
  historyEntries: HomeHistoryEntry[];
  onUpdateHistory: (entry: HomeHistoryEntry) => Promise<void>;
}

export function HomeHistory({ historyEntries, onUpdateHistory }: HomeHistoryProps) {
  const { createHomeHistoryEntry } = useData();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HomeHistoryEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    projectName: '',
    completionDate: '',
    description: '',
    beforePhoto: '',
    afterPhoto: '',
    projectedValue: '',
    actualValue: '',
  });

  const handleAddEntry = async () => {
    if (!newEntry.projectName.trim() || !newEntry.completionDate) return;

    const entryData: Omit<HomeHistoryEntry, 'id'> = {
      projectName: newEntry.projectName,
      completionDate: newEntry.completionDate,
      description: newEntry.description || undefined,
      beforePhoto: newEntry.beforePhoto || undefined,
      afterPhoto: newEntry.afterPhoto || undefined,
      projectedValue: parseFloat(newEntry.projectedValue) || undefined,
      actualValue: parseFloat(newEntry.actualValue) || undefined,
      wasTrackedProject: false,
    };

    try {
      await createHomeHistoryEntry(entryData);
      setNewEntry({
        projectName: '',
        completionDate: '',
        description: '',
        beforePhoto: '',
        afterPhoto: '',
        projectedValue: '',
        actualValue: '',
      });
      setIsAddingEntry(false);
    } catch (error) {
      console.error('Error adding history entry:', error);
      // You could add a toast notification here
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sortedEntries = [...historyEntries].sort(
    (a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
  );

  const totalValueAdded = historyEntries.reduce(
    (sum, entry) => sum + (entry.actualValue || entry.projectedValue || 0),
    0
  );

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  if (historyEntries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium">Home History</h2>
          <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Past Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Past Project to History</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      value={newEntry.projectName}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, projectName: e.target.value }))}
                      placeholder="e.g., Bathroom Renovation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="completionDate">Completion Date *</Label>
                    <Input
                      id="completionDate"
                      type="date"
                      value={newEntry.completionDate}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, completionDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what was done in this project..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beforePhoto">Before Photo URL</Label>
                    <Input
                      id="beforePhoto"
                      value={newEntry.beforePhoto}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, beforePhoto: e.target.value }))}
                      placeholder="https://example.com/before.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="afterPhoto">After Photo URL</Label>
                    <Input
                      id="afterPhoto"
                      value={newEntry.afterPhoto}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, afterPhoto: e.target.value }))}
                      placeholder="https://example.com/after.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectedValue">Projected Value Added ($)</Label>
                    <Input
                      id="projectedValue"
                      type="number"
                      value={newEntry.projectedValue}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, projectedValue: e.target.value }))}
                      placeholder="15000"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actualValue">Actual Value Added ($)</Label>
                    <Input
                      id="actualValue"
                      type="number"
                      value={newEntry.actualValue}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, actualValue: e.target.value }))}
                      placeholder="18000"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddEntry} className="flex-1">Add to History</Button>
                  <Button variant="outline" onClick={() => setIsAddingEntry(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Home History Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your home improvements by adding past projects or completing current ones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium">Home History</h2>
          <p className="text-muted-foreground">
            {historyEntries.length} completed project{historyEntries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Past Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Past Project to History</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={newEntry.projectName}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, projectName: e.target.value }))}
                    placeholder="e.g., Bathroom Renovation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completionDate">Completion Date *</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={newEntry.completionDate}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, completionDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what was done in this project..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beforePhoto">Before Photo URL</Label>
                  <Input
                    id="beforePhoto"
                    value={newEntry.beforePhoto}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, beforePhoto: e.target.value }))}
                    placeholder="https://example.com/before.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afterPhoto">After Photo URL</Label>
                  <Input
                    id="afterPhoto"
                    value={newEntry.afterPhoto}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, afterPhoto: e.target.value }))}
                    placeholder="https://example.com/after.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectedValue">Projected Value Added ($)</Label>
                  <Input
                    id="projectedValue"
                    type="number"
                    value={newEntry.projectedValue}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, projectedValue: e.target.value }))}
                    placeholder="15000"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualValue">Actual Value Added ($)</Label>
                  <Input
                    id="actualValue"
                    type="number"
                    value={newEntry.actualValue}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, actualValue: e.target.value }))}
                    placeholder="18000"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddEntry} className="flex-1">Add to History</Button>
                <Button variant="outline" onClick={() => setIsAddingEntry(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
                <div className="text-xl font-medium">{historyEntries.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Value Added</div>
                <div className="text-xl font-medium text-green-600">
                  {formatCurrency(totalValueAdded)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Avg. Value per Project</div>
                <div className="text-xl font-medium">
                  {formatCurrency(totalValueAdded / historyEntries.length)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {sortedEntries.map((entry, index) => (
          <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Photos Section */}
                <div className="relative">
                  {entry.beforePhoto || entry.afterPhoto ? (
                    <div className="grid grid-cols-2 h-48 lg:h-full">
                      {entry.beforePhoto && (
                        <div className="relative">
                          <ImageWithFallback
                            src={entry.beforePhoto}
                            alt="Before"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge variant="outline" className="bg-white/90">Before</Badge>
                          </div>
                        </div>
                      )}
                      {entry.afterPhoto && (
                        <div className="relative">
                          <ImageWithFallback
                            src={entry.afterPhoto}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge variant="outline" className="bg-white/90">After</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 lg:h-full bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No photos</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="lg:col-span-2 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-medium mb-1">{entry.projectName}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Completed {new Date(entry.completionDate).toLocaleDateString()}
                        {!entry.wasTrackedProject && (
                          <Badge variant="outline" className="ml-2">Manual Entry</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {entry.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {entry.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {entry.projectedValue && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-sm text-muted-foreground">Projected Value</div>
                          <div className="font-medium text-green-600">
                            +{formatCurrency(entry.projectedValue)}
                          </div>
                        </div>
                      </div>
                    )}
                    {entry.actualValue && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-sm text-muted-foreground">Actual Value</div>
                          <div className="font-medium text-green-600">
                            +{formatCurrency(entry.actualValue)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.projectName}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Completion Date:</span>
                  <span className="ml-2">{new Date(selectedEntry.completionDate).toLocaleDateString()}</span>
                </div>
                {selectedEntry.projectedValue && (
                  <div>
                    <span className="text-muted-foreground">Projected Value:</span>
                    <span className="ml-2 text-green-600">+{formatCurrency(selectedEntry.projectedValue)}</span>
                  </div>
                )}
                {selectedEntry.actualValue && (
                  <div>
                    <span className="text-muted-foreground">Actual Value:</span>
                    <span className="ml-2 text-green-600">+{formatCurrency(selectedEntry.actualValue)}</span>
                  </div>
                )}
              </div>

              {selectedEntry.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedEntry.description}</p>
                </div>
              )}

              {(selectedEntry.beforePhoto || selectedEntry.afterPhoto) && (
                <div>
                  <h4 className="font-medium mb-4">Photos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEntry.beforePhoto && (
                      <div>
                        <div className="text-sm font-medium mb-2">Before</div>
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={selectedEntry.beforePhoto}
                            alt="Before"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {selectedEntry.afterPhoto && (
                      <div>
                        <div className="text-sm font-medium mb-2">After</div>
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={selectedEntry.afterPhoto}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}