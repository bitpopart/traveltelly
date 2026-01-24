import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link,
  Image,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your article content in Markdown format...',
  minHeight = '500px',
}: MarkdownEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const insertText = (before: string, after: string = '', placeholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    onChange(newText);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertNewLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    
    // Check if we're at the start of a line
    const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
    const newText = beforeCursor + (needsNewlineBefore ? '\n' : '') + prefix + afterCursor;
    
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (needsNewlineBefore ? 1 : 0) + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertNewLine('# '),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertNewLine('## '),
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => insertNewLine('### '),
    },
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertText('**', '**', 'bold text'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertText('*', '*', 'italic text'),
    },
    {
      icon: Strikethrough,
      label: 'Strikethrough',
      action: () => insertText('~~', '~~', 'strikethrough text'),
    },
    {
      icon: Code,
      label: 'Code',
      action: () => insertText('`', '`', 'code'),
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertNewLine('> '),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertNewLine('- '),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertNewLine('1. '),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertText('[', '](https://example.com)', 'link text'),
    },
    {
      icon: Image,
      label: 'Image',
      action: () => insertAtCursor('![alt text](https://example.com/image.jpg)'),
    },
  ];

  const renderPreview = (markdown: string) => {
    // Basic markdown to HTML conversion for preview
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Code inline
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />');

    // Block quotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // Wrap consecutive <li> with <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc list-inside my-2">${match}</ul>`);

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;

    return html;
  };

  const editorContent = (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.label}
            className="h-8 w-8 p-0"
          >
            <button.icon className="w-4 h-4" />
          </Button>
        ))}
        
        <div className="flex-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="h-8 w-8 p-0"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Editor Tabs */}
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="mt-3">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono text-sm"
            style={{ minHeight }}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-3">
          <div
            className="border rounded-md p-6 bg-white dark:bg-gray-950"
            style={{ minHeight }}
          >
            {value ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-600 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
              />
            ) : (
              <p className="text-muted-foreground italic">Preview will appear here...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Character count */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Markdown formatting supported</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Article Editor</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
          {editorContent}
        </div>
      </div>
    );
  }

  return editorContent;
}
