import React from 'react';

/**
 * Formats a multi-line message string into React elements
 * @param message - The message string that may contain newlines
 * @returns JSX elements with proper line breaks
 */
export function formatMultilineMessage(message: string): React.ReactElement[] {
  return message.split('\n').map((line, index) => (
    <p key={index} className={index > 0 ? 'mt-2' : ''}>
      {line}
    </p>
  ));
}

/**
 * Formats a multi-line message for compact display (like alert modals)
 * @param message - The message string that may contain newlines  
 * @returns JSX elements with minimal spacing
 */
export function formatCompactMessage(message: string): React.ReactElement[] {
  return message.split('\n').map((line, index) => (
    <p key={index} className={index > 0 ? 'mt-1' : ''}>
      {line}
    </p>
  ));
}