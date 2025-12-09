/**
 * Hashtag utility functions for parsing, extracting, and handling hashtags
 */

import React from 'react';

/**
 * Extract hashtags from text
 * Matches hashtags like #PoultryFarming, #AgTech, etc.
 * Returns array of hashtag names without the # symbol
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];

  // Regex to match hashtags: # followed by alphanumeric characters and underscores
  // Must start with a letter, can contain letters, numbers, underscores
  const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_]*)/g;
  const matches = text.matchAll(hashtagRegex);

  const hashtags = Array.from(matches, match => match[1]);

  // Remove duplicates and return
  return [...new Set(hashtags)];
}

/**
 * Normalize hashtag name for database storage and comparison
 * Converts to lowercase for case-insensitive matching
 */
export function normalizeHashtag(hashtag: string): string {
  return hashtag.toLowerCase().trim();
}

/**
 * Parse content and convert hashtags to clickable links
 * Returns JSX with hashtags as clickable elements
 */
export function parseContentWithHashtags(
  content: string,
  onHashtagClick?: (hashtag: string) => void
): React.ReactNode {
  if (!content) return content;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Regex to match hashtags
  const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_]*)/g;
  let match;

  while ((match = hashtagRegex.exec(content)) !== null) {
    const fullHashtag = match[0]; // e.g., "#PoultryFarming"
    const hashtagName = match[1]; // e.g., "PoultryFarming"
    const startIndex = match.index;

    // Add text before hashtag
    if (startIndex > lastIndex) {
      parts.push(content.substring(lastIndex, startIndex));
    }

    // Add clickable hashtag
    parts.push(
      <button
        key={`hashtag-${startIndex}-${hashtagName}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onHashtagClick) {
            onHashtagClick(hashtagName);
          }
        }}
        className="text-green-600 hover:text-green-700 font-medium hover:underline"
      >
        {fullHashtag}
      </button>
    );

    lastIndex = startIndex + fullHashtag.length;
  }

  // Add remaining text after last hashtag
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

/**
 * Parse content with both URLs and hashtags
 * Combines URL parsing with hashtag parsing
 */
export function parseContentWithLinksAndHashtags(
  content: string,
  onHashtagClick?: (hashtag: string) => void
): React.ReactNode {
  if (!content) return content;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Combined regex for URLs and hashtags
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_]*)/g;

  // Find all matches (URLs and hashtags)
  const urlMatches = Array.from(content.matchAll(urlRegex), match => ({
    type: 'url' as const,
    value: match[0],
    index: match.index!,
    length: match[0].length
  }));

  const hashtagMatches = Array.from(content.matchAll(hashtagRegex), match => ({
    type: 'hashtag' as const,
    value: match[0],
    name: match[1],
    index: match.index!,
    length: match[0].length
  }));

  // Combine and sort by index
  const allMatches = [...urlMatches, ...hashtagMatches].sort((a, b) => a.index - b.index);

  // Build the content with clickable links and hashtags
  allMatches.forEach((match, idx) => {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    if (match.type === 'url') {
      // Add clickable URL
      parts.push(
        <a
          key={`url-${idx}-${match.index}`}
          href={match.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {match.value}
        </a>
      );
    } else {
      // Add clickable hashtag
      parts.push(
        <button
          key={`hashtag-${idx}-${match.index}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onHashtagClick) {
              onHashtagClick(match.name!);
            }
          }}
          className="text-green-600 hover:text-green-700 font-medium hover:underline"
        >
          {match.value}
        </button>
      );
    }

    lastIndex = match.index + match.length;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

/**
 * Validate hashtag name
 * Returns true if hashtag is valid (starts with letter, contains only alphanumeric and underscore)
 */
export function isValidHashtag(hashtag: string): boolean {
  const hashtagRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  return hashtagRegex.test(hashtag);
}

/**
 * Format hashtag for display (adds # if not present)
 */
export function formatHashtag(hashtag: string): string {
  return hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
}
