import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Camera, Trash2, Eye, X } from 'lucide-react';
import { Photo } from '../types/project';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PhotoGalleryProps {
  photos: Photo[];
  onUpdatePhotos: (photos: Photo[]) => void;
}

export function PhotoGallery({ photos, onUpdatePhotos }: PhotoGalleryProps) {
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [newPhoto, setNewPhoto] = useState({
    type: 'documentary' as Photo['type'],
    caption: '',
    url: '',
  });

  const handleAddPhoto = () => {
    if (!newPhoto.url.trim()) return;

    const photo: Photo = {
      id: `photo-${Date.now()}`,
      url: newPhoto.url,
      type: newPhoto.type,
      caption: newPhoto.caption || undefined,
      uploadedDate: new Date().toISOString(),
    };

    onUpdatePhotos([...photos, photo]);
    setNewPhoto({ type: 'documentary', caption: '', url: '' });
    setIsAddingPhoto(false);
  };

  const handleDeletePhoto = (photoId: string) => {
    onUpdatePhotos(photos.filter(photo => photo.id !== photoId));
  };

  const getPhotosByType = (type: Photo['type']) => {
    return photos.filter(photo => photo.type === type);
  };

  const getTypeLabel = (type: Photo['type']) => {
    switch (type) {
      case 'inspirational': return 'Ideas';
      case 'documentary': return 'Progress';
      case 'before': return 'Before';
      case 'after': return 'After';
      default: return type;
    }
  };

  const getTypeColor = (type: Photo['type']) => {
    switch (type) {
      case 'inspirational': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'documentary': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'before': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'after': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const PhotoGrid = ({ photos: gridPhotos }: { photos: Photo[] }) => {
    if (gridPhotos.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No photos yet</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {gridPhotos.map((photo) => (
          <div key={photo.id} className="relative group">
            <div 
              className="aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <ImageWithFallback
                src={photo.url}
                alt={photo.caption || 'Project photo'}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Photo Type Badge */}
            <div className="absolute top-2 left-2">
              <Badge className={`${getTypeColor(photo.type)} text-xs`} variant="outline">
                {getTypeLabel(photo.type)}
              </Badge>
            </div>

            {/* Delete Button */}
            <div className="absolute top-2 right-2 opacity-0 group-active:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(photo.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {photo.caption && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-tight">
                {photo.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Photos</h3>
        <Sheet open={isAddingPhoto} onOpenChange={setIsAddingPhoto}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <SheetTitle>Add New Photo</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photoType" className="text-sm">Photo Type</Label>
                  <Select
                    value={newPhoto.type}
                    onValueChange={(value) => setNewPhoto(prev => ({ ...prev, type: value as Photo['type'] }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before</SelectItem>
                      <SelectItem value="after">After</SelectItem>
                      <SelectItem value="documentary">Progress</SelectItem>
                      <SelectItem value="inspirational">Ideas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photoUrl" className="text-sm">Photo URL</Label>
                  <Input
                    id="photoUrl"
                    value={newPhoto.url}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/photo.jpg"
                    className="h-12 text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste an image URL from your gallery or photo service
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photoCaption" className="text-sm">Caption (Optional)</Label>
                  <Input
                    id="photoCaption"
                    value={newPhoto.caption}
                    onChange={(e) => setNewPhoto(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Describe this photo..."
                    className="h-12 text-base"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={handleAddPhoto} 
                  className="w-full h-12"
                  disabled={!newPhoto.url.trim()}
                >
                  Add Photo
                </Button>
                <Button variant="outline" onClick={() => setIsAddingPhoto(false)} className="w-full h-12">
                  Cancel
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-2">No Photos Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Document your project progress and save inspiration photos.
            </p>
            <Button onClick={() => setIsAddingPhoto(true)} variant="outline">
              Add Your First Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 h-10">
            <TabsTrigger value="all" className="text-xs px-2">
              All ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="before" className="text-xs px-2">
              Before ({getPhotosByType('before').length})
            </TabsTrigger>
            <TabsTrigger value="after" className="text-xs px-2">
              After ({getPhotosByType('after').length})
            </TabsTrigger>
            <TabsTrigger value="documentary" className="text-xs px-2">
              Progress ({getPhotosByType('documentary').length})
            </TabsTrigger>
            <TabsTrigger value="inspirational" className="text-xs px-2">
              Ideas ({getPhotosByType('inspirational').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <PhotoGrid photos={photos} />
          </TabsContent>

          <TabsContent value="before">
            <PhotoGrid photos={getPhotosByType('before')} />
          </TabsContent>

          <TabsContent value="after">
            <PhotoGrid photos={getPhotosByType('after')} />
          </TabsContent>

          <TabsContent value="documentary">
            <PhotoGrid photos={getPhotosByType('documentary')} />
          </TabsContent>

          <TabsContent value="inspirational">
            <PhotoGrid photos={getPhotosByType('inspirational')} />
          </TabsContent>
        </Tabs>
      )}

      {/* Full-screen Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="p-0 m-0 w-full h-full max-w-none max-h-none border-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {selectedPhoto && (
              <>
                <ImageWithFallback
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || 'Project photo'}
                  className="max-w-full max-h-full object-contain"
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="text-white">
                    <Badge className={`${getTypeColor(selectedPhoto.type)} mb-2`}>
                      {getTypeLabel(selectedPhoto.type)}
                    </Badge>
                    {selectedPhoto.caption && (
                      <p className="text-sm">{selectedPhoto.caption}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(selectedPhoto.uploadedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}