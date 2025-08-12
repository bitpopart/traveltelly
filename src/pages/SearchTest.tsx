import { useState } from 'react';
import { Navigation } from "@/components/Navigation";
import { UnifiedSearchBar } from "@/components/UnifiedSearchBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedSearch, useSearchSuggestions } from "@/hooks/useUnifiedSearch";
import { Search, Star, BookOpen, Camera } from "lucide-react";

export default function SearchTest() {
  const [testQuery, setTestQuery] = useState('');
  const { data: searchResults, isLoading } = useUnifiedSearch(testQuery);
  const { data: suggestions } = useSearchSuggestions();

  const runTestSearch = (query: string) => {
    setTestQuery(query);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🔍 Search Test Page</h1>
            <p className="text-muted-foreground mb-6">
              Test the unified search functionality across reviews, stories, and media
            </p>
          </div>

          {/* Main Search Bar */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Main Search Bar
              </CardTitle>
              <CardDescription>
                This is the main search component. Click in the search box to see suggestions, or type to search.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnifiedSearchBar className="mb-4" />
              <p className="text-sm text-muted-foreground">
                💡 Try typing keywords like "travel", "food", "beach", or <strong>click on suggested tags to navigate directly to the first matching result</strong>
              </p>
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Test Search Programmatically</CardTitle>
              <CardDescription>
                Test the search hook directly with predefined queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={() => runTestSearch('travel')}
                  className="text-sm"
                >
                  Search "travel"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runTestSearch('food')}
                  className="text-sm"
                >
                  Search "food"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runTestSearch('beach')}
                  className="text-sm"
                >
                  Search "beach"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runTestSearch('restaurant')}
                  className="text-sm"
                >
                  Search "restaurant"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTestQuery('')}
                  className="text-sm"
                >
                  Clear
                </Button>
              </div>

              {testQuery && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-medium mb-2">
                    Search Results for "{testQuery}"
                    {isLoading && <span className="text-muted-foreground"> (Loading...)</span>}
                  </h4>

                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map((result) => (
                        <div key={`${result.type}-${result.id}`} className="border rounded p-3 bg-background">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {result.type === 'review' && <Star className="h-4 w-4 text-orange-500" />}
                              {result.type === 'story' && <BookOpen className="h-4 w-4 text-blue-500" />}
                              {result.type === 'media' && <Camera className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-sm truncate">{result.title}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {result.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {result.content}
                              </p>
                              {result.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {result.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                  {result.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{result.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No results found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Suggestions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Available Search Suggestions</CardTitle>
              <CardDescription>
                These are the popular tags that appear when you click in the search box. Click any tag below to test the suggestion functionality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions && suggestions.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      🎯 Test Suggestion Clicking → Direct Navigation
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Click any tag below to search and automatically navigate to the first result (same as clicking the search button):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 10).map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => runTestSearch(suggestion)}
                          className="text-xs hover:bg-blue-100 dark:hover:bg-blue-800 hover:border-blue-400 transition-all duration-200 hover:scale-105"
                        >
                          #{suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">All Available Tags ({suggestions.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 20).map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => runTestSearch(suggestion)}
                          className="text-xs"
                        >
                          #{suggestion}
                        </Button>
                      ))}
                      {suggestions.length > 20 && (
                        <Badge variant="secondary" className="text-xs">
                          +{suggestions.length - 20} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No suggestions available</p>
              )}
            </CardContent>
          </Card>

          {/* Debug Console */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Debug Console</CardTitle>
              <CardDescription>
                Open your browser's developer console (F12) to see search click debugging logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm">
                <p className="text-green-600 dark:text-green-400">✓ Console logging enabled</p>
                <p className="text-blue-600 dark:text-blue-400">→ Look for "SearchResultItem handleClick called" messages</p>
                <p className="text-purple-600 dark:text-purple-400">→ Look for "Navigating to..." messages</p>
                <p className="text-orange-600 dark:text-orange-400">→ Any errors will appear in red</p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Test Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Using the Main Search Bar:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Click in the search box</strong> to see popular tag suggestions</li>
                  <li>• <strong>Click any suggestion tag</strong> to automatically navigate to the first matching result</li>
                  <li>• <strong>Type 2+ characters</strong> to see real-time search results</li>
                  <li>• <strong>Click on any search result</strong> to navigate to that content</li>
                  <li>• <strong>Click on tags within results</strong> to navigate to the first result for that tag</li>
                  <li>• <strong>Use arrow keys</strong> to navigate results, Enter to select</li>
                  <li>• <strong>Click search button</strong> to navigate to the first result (same as suggestion clicks)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Using Test Buttons:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Click the test buttons above to run predefined searches</li>
                  <li>• Results will appear in the "Search Results" section</li>
                  <li>• This tests the search hook directly</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. What Gets Searched:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• <Star className="h-3 w-3 text-orange-500 inline mr-1" />Reviews: Titles, content, tags, categories, locations</li>
                  <li>• <BookOpen className="h-3 w-3 text-blue-500 inline mr-1" />Stories: Titles, content, tags</li>
                  <li>• <Camera className="h-3 w-3 text-green-500 inline mr-1" />Media: Titles, content, tags, locations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}