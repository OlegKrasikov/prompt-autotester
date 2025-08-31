'use client';

import React from 'react';
import { Conversation } from '@/lib/types';
import { Card, CardContent } from './ui/Card';
import { EmptyState, EmptyStateIcons } from './ui/EmptyState';

interface ConversationViewProps {
  conversation?: Conversation;
  title: string;
  loading?: boolean;
  isStreaming?: boolean;
}

export function ConversationView({
  conversation,
  title,
  loading: _loading,
  isStreaming,
}: ConversationViewProps) {

  return (
    <div className="flex h-full flex-col gap-2 sm:gap-3">
      <h3 className="flex items-center gap-1 text-xs font-medium text-[color:var(--color-foreground)] sm:gap-2 sm:text-sm">
        <svg
          width="14"
          height="14"
          className="sm:h-4 sm:w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h8" />
          <path d="M8 14h6" />
        </svg>
        <span className="truncate">{title}</span>
      </h3>

      <Card className="h-full flex-1">
        <CardContent padding="none">
          {!conversation ? (
            <div className="p-4">
              <EmptyState
                icon={EmptyStateIcons.Conversation}
                title="No conversation yet"
                description="Run a simulation to see the conversation results here"
                className="py-8"
              />
            </div>
          ) : (
            <div className="bg-[color:var(--color-surface-1)] p-2 sm:p-3">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between text-xs text-[color:var(--color-muted-foreground)]">
                  <span className="truncate">{conversation.messages.length} msg</span>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="hidden sm:inline">
                      {conversation.messages.filter((m) => m.role === 'user').length} user ·{' '}
                      {conversation.messages.filter((m) => m.role === 'assistant').length} assistant
                    </span>
                    <span className="sm:hidden">
                      {conversation.messages.filter((m) => m.role === 'user').length}u ·{' '}
                      {conversation.messages.filter((m) => m.role === 'assistant').length}a
                    </span>
                    {isStreaming && (
                      <span className="ml-1 rounded-full bg-[color:var(--color-success)]/10 px-1.5 py-0.5 text-xs text-[color:var(--color-success)]">
                        <span className="hidden sm:inline">streaming...</span>
                        <span className="sm:hidden">●</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Summary */}
                <div className="scrollbar-thin scrollbar-thumb-[color:var(--color-border)] scrollbar-track-transparent max-h-80 space-y-2 overflow-y-auto sm:max-h-96 sm:space-y-3">
                  {conversation.messages.map((message, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs sm:gap-2 sm:text-sm">
                      <div
                        className={`mt-1 flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full sm:h-4 sm:w-4 ${
                          message.role === 'user'
                            ? 'bg-[color:var(--color-accent)]/20 text-[color:var(--color-accent)]'
                            : message.role === 'assistant'
                              ? 'bg-[color:var(--color-success)]/20 text-[color:var(--color-success)]'
                              : 'bg-[color:var(--color-surface-2)] text-[color:var(--color-muted-foreground)]'
                        }`}
                      >
                        <div className="h-1 w-1 rounded-full bg-current sm:h-1.5 sm:w-1.5"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-1 sm:mb-1">
                          <span
                            className={`text-xs font-medium tracking-wider uppercase ${
                              message.role === 'user'
                                ? 'text-[color:var(--color-accent)]'
                                : message.role === 'assistant'
                                  ? 'text-[color:var(--color-success)]'
                                  : 'text-[color:var(--color-muted-foreground)]'
                            }`}
                          >
                            <span className="hidden sm:inline">{message.role}</span>
                            <span className="sm:hidden">
                              {message.role === 'user'
                                ? 'U'
                                : message.role === 'assistant'
                                  ? 'A'
                                  : 'S'}
                            </span>
                          </span>
                          <span className="text-xs text-[color:var(--color-muted-foreground)]">
                            <span className="hidden sm:inline">
                              ({message.content.length} chars)
                            </span>
                            <span className="sm:hidden">({message.content.length}ch)</span>
                          </span>
                        </div>
                        <div className="leading-relaxed break-words whitespace-pre-wrap text-[color:var(--color-foreground)]">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Streaming indicator */}
                  {isStreaming &&
                    conversation?.messages.length > 0 &&
                    conversation.messages[conversation.messages.length - 1].role === 'user' && (
                      <div className="flex items-start gap-1.5 text-xs sm:gap-2 sm:text-sm">
                        <div className="mt-1 flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-success)]/20 text-[color:var(--color-success)] sm:h-4 sm:w-4">
                          <div className="h-1 w-1 rounded-full bg-current sm:h-1.5 sm:w-1.5"></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center gap-1 sm:mb-1">
                            <span className="text-xs font-medium tracking-wider text-[color:var(--color-success)] uppercase">
                              <span className="hidden sm:inline">assistant</span>
                              <span className="sm:hidden">A</span>
                            </span>
                            <span className="text-xs text-[color:var(--color-success)]">
                              <span className="hidden sm:inline">thinking...</span>
                              <span className="sm:hidden">...</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <div
                              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--color-success)] sm:h-2 sm:w-2"
                              style={{ animationDelay: '0ms' }}
                            ></div>
                            <div
                              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--color-success)] sm:h-2 sm:w-2"
                              style={{ animationDelay: '150ms' }}
                            ></div>
                            <div
                              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--color-success)] sm:h-2 sm:w-2"
                              style={{ animationDelay: '300ms' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
