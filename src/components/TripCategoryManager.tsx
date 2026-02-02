import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface TripCategory {
  value: string;
  label: string;
  emoji: string;
}

// Default trip categories
const DEFAULT_CATEGORIES: TripCategory[] = [
  { value: 'walk', label: 'Walk', emoji: '🚶' },
  { value: 'hike', label: 'Hike', emoji: '🥾' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴' },
  { value: 'running', label: 'Running', emoji: '🏃' },
  { value: 'road-trip', label: 'Road Trip', emoji: '🚗' },
  { value: 'flight', label: 'Flight', emoji: '✈️' },
  { value: 'train', label: 'Train', emoji: '🚂' },
  { value: 'boat', label: 'Boat', emoji: '⛵' },
];

export function TripCategoryManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<TripCategory[]>(() => {
    const stored = localStorage.getItem('trip-categories');
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ value: '', label: '', emoji: '' });

  const saveCategories = (updatedCategories: TripCategory[]) => {
    setCategories(updatedCategories);
    localStorage.setItem('trip-categories', JSON.stringify(updatedCategories));
  };

  const handleAddCategory = () => {
    if (!newCategory.value || !newCategory.label) {
      toast({
        title: 'Validation Error',
        description: 'Value and label are required',
        variant: 'destructive',
      });
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.value === newCategory.value)) {
      toast({
        title: 'Category Exists',
        description: 'A category with this value already exists',
        variant: 'destructive',
      });
      return;
    }

    const updatedCategories = [...categories, newCategory];
    saveCategories(updatedCategories);

    toast({
      title: 'Category Added',
      description: `${newCategory.emoji} ${newCategory.label} has been added`,
    });

    setNewCategory({ value: '', label: '', emoji: '' });
    setShowAddForm(false);
  };

  const handleRemoveCategory = (value: string) => {
    const updatedCategories = categories.filter(cat => cat.value !== value);
    saveCategories(updatedCategories);

    toast({
      title: 'Category Removed',
      description: 'The category has been removed',
    });
  };

  const handleResetToDefaults = () => {
    saveCategories(DEFAULT_CATEGORIES);
    toast({
      title: 'Categories Reset',
      description: 'Trip categories have been reset to defaults',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Trip Categories
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefaults}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Category Form */}
          {showAddForm && (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-value">Value (slug)</Label>
                    <Input
                      id="category-value"
                      placeholder="e.g., kayaking"
                      value={newCategory.value}
                      onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-label">Label</Label>
                    <Input
                      id="category-label"
                      placeholder="e.g., Kayaking"
                      value={newCategory.label}
                      onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-emoji">Emoji</Label>
                    <Input
                      id="category-emoji"
                      placeholder="e.g., 🛶"
                      value={newCategory.emoji}
                      onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategory({ value: '', label: '', emoji: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddCategory}
                  >
                    Add Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories List */}
          <div className="grid gap-2">
            {categories.map((category) => (
              <div
                key={category.value}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.emoji}</span>
                  <div>
                    <p className="font-medium">{category.label}</p>
                    <p className="text-xs text-muted-foreground">{category.value}</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Category?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove "{category.emoji} {category.label}"?
                        Existing trips with this category will not be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveCategory(category.value)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No categories defined. Add one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
