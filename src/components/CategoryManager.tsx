import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useReviewCategories, useAddCategory, useRemoveCategory, useUpdateCategories, type ReviewCategory } from '@/hooks/useReviewCategories';
import { Plus, Trash2, Tag, Loader2, Download } from 'lucide-react';

const categorySchema = z.object({
  value: z.string()
    .min(1, 'Value is required')
    .regex(/^[a-z0-9-]+$/, 'Value must contain only lowercase letters, numbers, and hyphens'),
  label: z.string().min(1, 'Label is required'),
  group: z.string().min(1, 'Group is required'),
  emoji: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const COMMON_GROUPS = [
  'Shops & Stores',
  'Food & Drink',
  'Places',
  'Services',
  'Health',
  'Outdoor & Fun',
  'Entertainment',
  'Education & Public',
  'Transport',
  'Religious',
];

const SAMPLE_CATEGORIES: ReviewCategory[] = [
  { value: 'restaurant', label: '🍽️ Restaurant', group: 'Food & Drink' },
  { value: 'cafe', label: '☕ Café', group: 'Food & Drink' },
  { value: 'fast-food', label: '🍔 Fast Food', group: 'Food & Drink' },
  { value: 'bar-pub', label: '🍺 Bar / Pub', group: 'Food & Drink' },
  { value: 'grocery-store', label: '🛒 Grocery Store', group: 'Shops & Stores' },
  { value: 'clothing-store', label: '👕 Clothing Store', group: 'Shops & Stores' },
  { value: 'hotel', label: '🏨 Hotel', group: 'Places' },
  { value: 'landmarks', label: '🏛️ Landmarks', group: 'Places' },
  { value: 'park', label: '🌳 Park', group: 'Outdoor & Fun' },
  { value: 'beach', label: '🏖️ Beach', group: 'Outdoor & Fun' },
];

export function CategoryManager() {
  const { data: categories = [], isLoading, error } = useReviewCategories();
  const addCategory = useAddCategory();
  const removeCategory = useRemoveCategory();
  const updateCategories = useUpdateCategories();
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      value: '',
      label: '',
      group: '',
      emoji: '',
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const newCategory: ReviewCategory = {
        value: data.value,
        label: data.emoji ? `${data.emoji} ${data.label}` : data.label,
        group: data.group,
      };

      await addCategory.mutateAsync(newCategory);

      // Reset form and hide it
      form.reset();
      setShowAddForm(false);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error adding category:', error);
    }
  };

  const handleRemoveCategory = async (categoryValue: string) => {
    try {
      await removeCategory.mutateAsync(categoryValue);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error removing category:', error);
    }
  };

  const handleLoadSampleCategories = async () => {
    try {
      await updateCategories.mutateAsync(SAMPLE_CATEGORIES);
    } catch (error) {
      console.error('Error loading sample categories:', error);
    }
  };

  // Group categories by group
  const groupedCategories = categories.reduce((groups, category) => {
    const group = category.group;
    if (!groups[group]) groups[group] = [];
    groups[group].push(category);
    return groups;
  }, {} as Record<string, ReviewCategory[]>);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading categories...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <CardContent className="py-8 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load categories. Using default categories.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Review Categories
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage categories available for reviews. Total: {categories.length}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
              {categories.length === 0 && (
                <Button
                  onClick={handleLoadSampleCategories}
                  variant="outline"
                  disabled={updateCategories.isPending}
                >
                  {updateCategories.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Load Sample Categories
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {showAddForm && (
          <CardContent className="border-t">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    placeholder="e.g., coffee-shop"
                    {...form.register('value')}
                  />
                  {form.formState.errors.value && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.value.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Lowercase letters, numbers, and hyphens only
                  </p>
                </div>

                <div>
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Coffee Shop"
                    {...form.register('label')}
                  />
                  {form.formState.errors.label && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.label.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="group">Group *</Label>
                  <div className="space-y-2">
                    <Select onValueChange={(value) => form.setValue('group', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_GROUPS.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or type a custom group name"
                      onChange={(e) => form.setValue('group', e.target.value)}
                      value={form.watch('group') || ''}
                    />
                  </div>
                  {form.formState.errors.group && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.group.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input
                    id="emoji"
                    placeholder="e.g., ☕"
                    {...form.register('emoji')}
                    maxLength={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional emoji to display with the category
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={addCategory.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {addCategory.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Categories List */}
      <div className="space-y-4">
        {Object.entries(groupedCategories).map(([group, groupCategories]) => (
          <Card key={group}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{group}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {groupCategories.length} categories
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {groupCategories.map((category) => (
                  <div key={category.value} className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-sm">
                      {category.label}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove the category "{category.label}"?
                            This action cannot be undone and may affect existing reviews.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveCategory(category.value)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={removeCategory.isPending}
                          >
                            {removeCategory.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Removing...
                              </>
                            ) : (
                              'Remove'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Categories</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first review category or load sample categories.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Category
              </Button>
              <Button
                onClick={handleLoadSampleCategories}
                variant="outline"
                disabled={updateCategories.isPending}
              >
                {updateCategories.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Load Sample Categories
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}