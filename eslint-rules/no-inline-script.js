/**
 * Rule to prevent inline script tags in HTML files
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent inline script tags in HTML files',
      category: 'Security',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noInlineScript: 'Inline script tags are not allowed. Move script content to external files.',
    },
  },

  create(context) {
    return {
      // For HTML files, we need to check script tags
      'ScriptTag'(node) {
        const attrs = node.attributes || [];

        // Check if this is an inline script (has content but no src attribute)
        const hasContent = node.value && node.value.value && node.value.value.trim().length > 0;
        const hasSrc = attrs.some(attr => attr.key && attr.key.value === 'src');

        // JSON-LD / JSON data blocks are data, not executable code — allow them inline
        const typeAttr = attrs.find(attr => attr.key && attr.key.value === 'type');
        const type = (typeAttr && typeAttr.value && typeAttr.value.value) || '';
        const isDataBlock = /^(application\/(ld\+json|json)|text\/plain)$/i.test(type.trim());

        // If the script has content but no src attribute (and isn't a data block), it's an inline script
        if (hasContent && !hasSrc && !isDataBlock) {
          context.report({
            node,
            messageId: 'noInlineScript',
          });
        }
      },
    };
  },
};