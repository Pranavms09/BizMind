import React from 'react';

/**
 * Parses inline markdown elements (***bold italic***, **bold**, `code`, *italic*) into styled React elements
 */
export function parseInlineFormatting(str: string): React.ReactNode[] {
  if (!str) return [];
  const parts: React.ReactNode[] = [];
  // Matches ***bold italic***, **bold**, `code`, or *italic*
  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let match;
  let lastIndex = 0;
  let i = 0;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    const matchText = match[0];
    if (matchText.startsWith('***') && matchText.endsWith('***')) {
      parts.push(
        <strong key={`bi-${i++}`} className="font-semibold text-white">
          <em className="italic text-neutral-200">{matchText.slice(3, -3)}</em>
        </strong>
      );
    } else if (matchText.startsWith('**') && matchText.endsWith('**')) {
      parts.push(
        <strong key={`b-${i++}`} className="font-semibold text-white">
          {matchText.slice(2, -2)}
        </strong>
      );
    } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
      parts.push(
        <code key={`c-${i++}`} className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">
          {matchText.slice(1, -1)}
        </code>
      );
    } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
      parts.push(
        <em key={`i-${i++}`} className="italic text-neutral-200">
          {matchText.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [str];
}

/**
 * Renders structured multi-line AI analysis responses with clean headings, bullets, numbers, and typography
 */
export function renderFormattedMarkdown(content: string) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`sp-${idx}`} className="h-2" />);
      return;
    }

    if (trimmed.startsWith('###')) {
      const title = trimmed.replace(/^###\s*/, '');
      elements.push(
        <h4
          key={`h3-${idx}`}
          className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mt-4 mb-2 pb-1.5 border-b border-white/10 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          <span>{parseInlineFormatting(title)}</span>
        </h4>
      );
    } else if (trimmed.startsWith('##')) {
      const title = trimmed.replace(/^##\s*/, '');
      elements.push(
        <h3
          key={`h2-${idx}`}
          className="text-sm font-bold uppercase tracking-wider text-white mt-4 mb-2 pb-1 border-b border-white/10"
        >
          {parseInlineFormatting(title)}
        </h3>
      );
    } else if (trimmed.startsWith('#')) {
      const title = trimmed.replace(/^#\s*/, '');
      elements.push(
        <h2 key={`h1-${idx}`} className="text-base font-bold uppercase tracking-wider text-white mt-4 mb-2">
          {parseInlineFormatting(title)}
        </h2>
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const itemText = trimmed.replace(/^[\*\-•]\s*/, '');
      elements.push(
        <div key={`li-${idx}`} className="flex items-start gap-2.5 my-1 text-xs sm:text-sm text-neutral-200 font-sans pl-1.5">
          <span className="text-neutral-400 mt-1 select-none text-[10px]">•</span>
          <div className="leading-relaxed flex-1">{parseInlineFormatting(itemText)}</div>
        </div>
      );
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
      const num = match ? match[1] : '';
      const itemText = match ? match[2] : trimmed;
      elements.push(
        <div key={`num-${idx}`} className="flex items-start gap-2.5 my-1 text-xs sm:text-sm text-neutral-200 font-sans pl-1.5">
          <span className="text-neutral-400 font-mono text-xs mt-0.5 select-none">{num}.</span>
          <div className="leading-relaxed flex-1">{parseInlineFormatting(itemText)}</div>
        </div>
      );
    } else {
      elements.push(
        <p key={`p-${idx}`} className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans my-1.5">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  return elements;
}
