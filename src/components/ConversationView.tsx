"use client";

import React from "react";
import { Conversation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Skeleton } from "./ui/SkeletonLoader";
import { EmptyState, EmptyStateIcons } from "./ui/EmptyState";

interface ConversationViewProps {
  conversation?: Conversation;
  title: string;
  loading?: boolean;
  isStreaming?: boolean;
}

export function ConversationView({ conversation, title, loading, isStreaming }: ConversationViewProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        );
      case 'assistant':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="3" height="8" x="13" y="2" rx="1.5"/>
            <path d="m19 8.5-2 3-2-3"/>
            <rect width="3" height="8" x="8" y="6" rx="1.5"/>
            <path d="m14 12.5-2 3-2-3"/>
            <rect width="3" height="8" x="3" y="10" rx="1.5"/>
            <path d="m9 16.5-2 3-2-3"/>
          </svg>
        );
      case 'system':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        );
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12h8"/>
          </svg>
        );
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user':
        return 'text-[color:var(--color-accent)]';
      case 'assistant':
        return 'text-[color:var(--color-success)]';
      case 'system':
        return 'text-[color:var(--color-muted-foreground)]';
      default:
        return 'text-[color:var(--color-muted-foreground)]';
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 h-full">
      <h3 className="text-xs sm:text-sm font-medium text-[color:var(--color-foreground)] flex items-center gap-1 sm:gap-2">
        <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <path d="M8 10h8"/>
          <path d="M8 14h6"/>
        </svg>
        <span className="truncate">{title}</span>
      </h3>
      
      <Card className="flex-1 h-full">
        <CardContent padding="none">
          {!conversation ? (
            <div className="p-4">
              <EmptyState
                icon={<EmptyStateIcons.Conversation />}
                title="No conversation yet"
                description="Run a simulation to see the conversation results here"
                className="py-8"
              />
            </div>
          ) : (
            <div className="p-2 sm:p-3 bg-[color:var(--color-surface-1)]">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between text-xs text-[color:var(--color-muted-foreground)]">
                  <span className="truncate">{conversation.messages.length} msg</span>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="hidden sm:inline">
                      {conversation.messages.filter(m => m.role === 'user').length} user · {' '}
                      {conversation.messages.filter(m => m.role === 'assistant').length} assistant
                    </span>
                    <span className="sm:hidden">
                      {conversation.messages.filter(m => m.role === 'user').length}u · {' '}
                      {conversation.messages.filter(m => m.role === 'assistant').length}a
                    </span>
                    {isStreaming && (
                      <span className="ml-1 px-1.5 py-0.5 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)] rounded-full text-xs">
                        <span className="hidden sm:inline">streaming...</span>
                        <span className="sm:hidden">●</span>
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Message Summary */}
                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[color:var(--color-border)] scrollbar-track-transparent">
                  {conversation.messages.map((message, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <div className={`flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 mt-1 ${
                        message.role === 'user' 
                          ? 'bg-[color:var(--color-accent)]/20 text-[color:var(--color-accent)]' 
                          : message.role === 'assistant'
                          ? 'bg-[color:var(--color-success)]/20 text-[color:var(--color-success)]'
                          : 'bg-[color:var(--color-surface-2)] text-[color:var(--color-muted-foreground)]'
                      }`}>
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                          <span className={`text-xs font-medium uppercase tracking-wider ${
                            message.role === 'user' ? 'text-[color:var(--color-accent)]' : 
                            message.role === 'assistant' ? 'text-[color:var(--color-success)]' : 
                            'text-[color:var(--color-muted-foreground)]'
                          }`}>
                            <span className="hidden sm:inline">{message.role}</span>
                            <span className="sm:hidden">{message.role === 'user' ? 'U' : message.role === 'assistant' ? 'A' : 'S'}</span>
                          </span>
                          <span className="text-xs text-[color:var(--color-muted-foreground)]">
                            <span className="hidden sm:inline">({message.content.length} chars)</span>
                            <span className="sm:hidden">({message.content.length}ch)</span>
                          </span>
                        </div>
                        <div className="text-[color:var(--color-foreground)] leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Streaming indicator */}
                  {isStreaming && conversation?.messages.length > 0 && conversation.messages[conversation.messages.length - 1].role === 'user' && (
                    <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <div className="flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 mt-1 bg-[color:var(--color-success)]/20 text-[color:var(--color-success)]">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                          <span className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-success)]">
                            <span className="hidden sm:inline">assistant</span>
                            <span className="sm:hidden">A</span>
                          </span>
                          <span className="text-xs text-[color:var(--color-success)]">
                            <span className="hidden sm:inline">thinking...</span>
                            <span className="sm:hidden">...</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[color:var(--color-success)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[color:var(--color-success)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[color:var(--color-success)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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


