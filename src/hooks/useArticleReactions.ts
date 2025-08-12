import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';

interface ReactionCounts {
  likes: number;
  dislikes: number;
  userReaction: string | null; // '+', '-', or null
}

export function useArticleReactions(articleId: string, _articleAuthor: string) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['article-reactions', articleId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query for reactions to this article
      const reactions = await nostr.query([{
        kinds: [7], // Reaction events
        '#e': [articleId],
        limit: 500,
      }], { signal });

      // Count reactions by type
      let likes = 0;
      let dislikes = 0;
      let userReaction: string | null = null;

      reactions.forEach(reaction => {
        const content = reaction.content.trim();

        if (content === '+' || content === '') {
          likes++;
          if (user && reaction.pubkey === user.pubkey) {
            userReaction = '+';
          }
        } else if (content === '-') {
          dislikes++;
          if (user && reaction.pubkey === user.pubkey) {
            userReaction = '-';
          }
        }
      });

      return {
        likes,
        dislikes,
        userReaction,
      } as ReactionCounts;
    },
    enabled: !!articleId,
  });
}

export function useReactToArticle() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      articleId: string;
      articleAuthor: string;
      reaction: '+' | '-'
    }) => {
      const tags: string[][] = [
        ['e', data.articleId],
        ['p', data.articleAuthor],
        ['k', '30023'], // NIP-23 long-form content
      ];

      createEvent({
        kind: 7, // Reaction event
        content: data.reaction,
        tags,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate reactions query to refresh counts
      queryClient.invalidateQueries({
        queryKey: ['article-reactions', variables.articleId]
      });
    },
  });
}