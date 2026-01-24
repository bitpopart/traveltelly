import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryManager } from '@/components/CategoryManager';
import { useReviewCategories } from '@/hooks/useReviewCategories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CategoryTest() {
  const { data: categories = [], isLoading, refetch } = useReviewCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#e8e8e8' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Link to="/admin">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <Button
                onClick={() => refetch()}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Categories
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">Category Management Test</h1>
            <p className="text-muted-foreground">
              Test page for the dynamic category management system. This demonstrates how categories work in the review form.
            </p>
          </div>

          {/* System Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {categories.length > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
                  <div className="text-sm text-muted-foreground">Total Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(categories.reduce((groups, cat) => {
                      groups[cat.group] = true;
                      return groups;
                    }, {} as Record<string, boolean>)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Category Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {isLoading ? '...' : (categories.length > 0 ? 'Active' : 'Empty')}
                  </div>
                  <div className="text-sm text-muted-foreground">System Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Selector Test */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Review Form Category Selector Test</CardTitle>
              <p className="text-sm text-muted-foreground">
                This simulates how categories appear in the review form
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <Select onValueChange={setSelectedCategory} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading categories..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Loading categories...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No categories available
                      </div>
                    ) : (
                      Object.entries(
                        categories.reduce((groups, category) => {
                          const group = category.group;
                          if (!groups[group]) groups[group] = [];
                          groups[group].push(category);
                          return groups;
                        }, {} as Record<string, typeof categories>)
                      ).map(([group, items]) => (
                        <div key={group}>
                          <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                            {group}
                          </div>
                          {items.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Selected Category: {categories.find(c => c.value === selectedCategory)?.label}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Value: {selectedCategory}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Categories Display */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>All Categories ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <p className="text-muted-foreground mb-4">
                    No categories found. Use the category manager below to add some.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    categories.reduce((groups, category) => {
                      const group = category.group;
                      if (!groups[group]) groups[group] = [];
                      groups[group].push(category);
                      return groups;
                    }, {} as Record<string, typeof categories>)
                  ).map(([group, groupCategories]) => (
                    <div key={group}>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        {group}
                        <Badge variant="outline" className="text-xs">
                          {groupCategories.length}
                        </Badge>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {groupCategories.map((category) => (
                          <Badge
                            key={category.value}
                            variant={selectedCategory === category.value ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(category.value)}
                          >
                            {category.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Manager */}
          <CategoryManager />
        </div>
      </div>
    </div>
  );
}