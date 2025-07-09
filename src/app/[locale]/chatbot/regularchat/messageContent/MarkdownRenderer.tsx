import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * A dedicated component for rendering Markdown content with consistent styling and plugins.
 * It encapsulates the configuration for ReactMarkdown, making it reusable.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  if (!content) return null;

  return (
    <div className={`sm:prose-sm prose-xs prose max-w-none dark:prose-invert ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
            <a {...props} target='_blank' rel='noopener noreferrer' />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;