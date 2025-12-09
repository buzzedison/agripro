/**
 * Mention utility functions for parsing, extracting, and handling @mentions
 */

import React from 'react';
import Link from 'next/link';

// Type for mentioned user info
export interface MentionedUser {
  id: string;
  full_name: string;
}

/**
 * Convert a name to a URL-friendly slug
 * "John Doe" -> "john-doe"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove duplicate hyphens
}

/**
 * Extract mentions from text
 * Matches mentions like @JohnDoe, @Jane Smith, etc.
 * Returns array of mentioned names without the @ symbol
 */
export function extractMentions(text: string): string[] {
  if (!text) return [];

  // Regex to match mentions: @ followed by alphanumeric and spaces
  // Must start with a letter, can contain letters, numbers, spaces
  const mentionRegex = /@([a-zA-Z][a-zA-Z0-9\s]+?)(?=\s|$|[^\w])/g;
  const matches = text.matchAll(mentionRegex);

  const mentions = Array.from(matches, match => match[1].trim());

  // Remove duplicates and return
  return [...new Set(mentions)];
}

/**
 * Parse content with hashtags, mentions, and URLs
 * Returns JSX with all clickable elements
 * @param mentionedUsers - Optional map of user names to their IDs for direct profile linking
 */
export function parseContentWithAll(
  content: string,
  onHashtagClick?: (hashtag: string) => void,
  onMentionClick?: (mention: string) => void,
  mentionedUsers?: Map<string, string> // Map of full_name -> user_id
): React.ReactNode {
  if (!content) return content;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Combined regex for URLs, hashtags, and mentions
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_]*)/g;
  const mentionRegex = /@([a-zA-Z][a-zA-Z0-9\s]+?)(?=\s|$|[^\w])/g;

  // Find all matches
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

  const mentionMatches = Array.from(content.matchAll(mentionRegex), match => ({
    type: 'mention' as const,
    value: match[0],
    name: match[1].trim(),
    index: match.index!,
    length: match[0].length
  }));

  // Combine and sort by index
  const allMatches = [...urlMatches, ...hashtagMatches, ...mentionMatches]
    .sort((a, b) => a.index - b.index);

  // Build the content with clickable links, hashtags, and mentions
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
    } else if (match.type === 'hashtag') {
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
    } else if (match.type === 'mention') {
      // Check if we have a user ID for this mention
      // Try exact match first, then case-insensitive match
      let matchedFullName: string | undefined;
      const mentionName = match.name!;
      
      if (mentionedUsers) {
        // Try exact match
        if (mentionedUsers.has(mentionName)) {
          matchedFullName = mentionName;
        }
        
        // Try case-insensitive match if exact match fails
        if (!matchedFullName) {
          for (const [fullName] of mentionedUsers.entries()) {
            if (fullName.toLowerCase() === mentionName.toLowerCase() ||
                fullName.toLowerCase().startsWith(mentionName.toLowerCase()) ||
                mentionName.toLowerCase().startsWith(fullName.toLowerCase())) {
              matchedFullName = fullName;
              break;
            }
          }
        }
      }
      
      if (matchedFullName) {
        // Link directly to user profile using name slug
        const profileSlug = nameToSlug(matchedFullName);
        parts.push(
          <Link
            key={`mention-${idx}-${match.index}`}
            href={`/connect/${profileSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline bg-blue-50 px-1 rounded"
          >
            {match.value}
          </Link>
        );
      } else {
        // Fallback to callback or search
        parts.push(
          <button
            key={`mention-${idx}-${match.index}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onMentionClick) {
                onMentionClick(match.name!);
              }
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline bg-blue-50 px-1 rounded"
          >
            {match.value}
          </button>
        );
      }
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
 * Validate mention format
 * Returns true if mention is valid
 */
export function isValidMention(mention: string): boolean {
  const mentionRegex = /^[a-zA-Z][a-zA-Z0-9\s]*$/;
  return mentionRegex.test(mention);
}

/**
 * Format mention for display (adds @ if not present)
 */
export function formatMention(mention: string): string {
  return mention.startsWith('@') ? mention : `@${mention}`;
}

/**
 * Search users for mention autocomplete
 */
export async function searchUsersForMention(query: string): Promise<any[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(`/api/feed/mentions?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error searching users for mention:', error);
    return [];
  }
}
