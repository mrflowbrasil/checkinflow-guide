import React from "react";

// Escape HTML to prevent XSS, then apply a tiny markdown-like syntax:
// **bold**, *italic* or _italic_, <u>underline</u>, and newlines -> <br/>
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatInlineToHtml(input: string): string {
  if (!input) return "";
  let s = escapeHtml(input);
  // Restore <u>...</u> (escaped form) as real underline tags
  s = s.replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/g, "<u>$1</u>");
  // Bold: **text**
  s = s.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text* or _text_
  s = s.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^_])_([^_\n]+?)_(?!_)/g, "$1<em>$2</em>");
  // Newlines
  s = s.replace(/\n/g, "<br/>");
  return s;
}

export function FormattedText({ content, className, as: As = "p" }: { content: string; className?: string; as?: any }) {
  const html = formatInlineToHtml(content ?? "");
  return <As className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
