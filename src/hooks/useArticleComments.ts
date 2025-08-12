import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import type { NostrEvent } from '@nostrify/nostrify';

interface ArticleComment extends NostrEvent {
  kind: 1111;
}

function validateComment(event: NostrEvent): event is ArticleComment {
  if (event.kind !== 1111) return false;

  // Must have required NIP-22 tags for commenting on articles
  const hasRootA = event.tags.some(([name]) => name === 'A');
  const hasRootK = event.tags.some(([name, value]) => name === 'K' && value === '30023');
  const hasParentA = event.tags.some(([name]) => name === 'a');
  const hasParentK = event.tags.some(([name, value]) => name === 'k' && value === '30023');

  return hasRootA && hasRootK && hasParentA && hasParentK && event.content.trim().length > 0;
}

export function useArticleComments(articleId: string, articleAuthor: string, articleIdentifier: string) {
  const { nostr } = useNostr();

  // Note: naddr could be used for linking but not needed for queries

  return useQuery({
    queryKey: ['article-comments', articleId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query for comments on this article using NIP-22 format
      const comments = await nostr.query([{
        kinds: [1111], // Comment events
        '#A': [`30023:${articleAuthor}:${articleIdentifier}`], // Root article reference
        limit: 100,
      }], { signal });

      // Filter and validate comments
      const validComments = comments.filter(validateComment);

      // Sort by creation time, newest first
      return validComments.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!articleId && !!articleAuthor && !!articleIdentifier,
  });
}

export function useCommentOnArticle() {
  const { mutate: createEvent } = useNostrPublish();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      articleId: string;
      articleAuthor: string;
      articleIdentifier: string;
      content: string;
      parentCommentId?: string; // For replying to comments
    }) => {
      if (!user) throw new Error('Must be logged in to comment');

      const articleCoordinate = `30023:${data.articleAuthor}:${data.articleIdentifier}`;

      const tags: string[][] = [
        // Root article references (uppercase for NIP-22)
        ['A', articleCoordinate],
        ['K', '30023'],
        ['P', data.articleAuthor],

        // Parent references (lowercase for NIP-22)
        ['a', articleCoordinate],
        ['e', data.articleId],
        ['k', '30023'],
        ['p', data.articleAuthor],
      ];

      // If replying to a comment, add parent comment references
      if (data.parentCommentId) {
        // This would need the parent comment's author - for now, just reference the comment
        tags.push(['e', data.parentCommentId]);
        tags.push(['k', '1111']); // Parent is a comment
      }

      createEvent({
        kind: 1111, // NIP-22 Comment event
        content: data.content.trim(),
        tags,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['article-comments', variables.articleId]
      });
    },
  });
}