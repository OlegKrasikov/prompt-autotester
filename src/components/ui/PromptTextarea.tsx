'use client';

import React from 'react';
import { VariableListItem } from '@/lib/types';
import { VariableAutocomplete } from '@/components/VariableAutocomplete';
import { useVariables } from '@/hooks/useVariables';

export interface PromptTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCharCount?: boolean;
  maxLength?: number;
  enableVariableAutocomplete?: boolean;
}

const PromptTextarea = React.forwardRef<HTMLTextAreaElement, PromptTextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      showCharCount,
      maxLength,
      id,
      value,
      onChange,
      enableVariableAutocomplete = false,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { variables } = useVariables();
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hasError = Boolean(error);
    const charCount = typeof value === 'string' ? value.length : 0;

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const overlayRef = React.useRef<HTMLDivElement>(null);
    const overlayContentRef = React.useRef<HTMLDivElement>(null);
    const [showAutocomplete, setShowAutocomplete] = React.useState(false);
    const [autocompleteQuery, setAutocompleteQuery] = React.useState('');
    const [autocompletePosition, setAutocompletePosition] = React.useState<{
      top: number;
      left: number;
    }>({ top: 0, left: 0 });
    const [cursorPosition, setCursorPosition] = React.useState(0);

    // Use the forwarded ref or our internal ref
    React.useImperativeHandle(ref, () => textareaRef.current!);

    const baseClasses =
      'w-full px-3 py-2 text-sm bg-[color:var(--color-surface)] border rounded-[var(--radius)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-[color:var(--color-muted-foreground)] resize-none touch-manipulation';

    const stateClasses = hasError
      ? 'border-[color:var(--color-danger)] focus:ring-[color:var(--color-danger)]/50 focus:border-[color:var(--color-danger)]'
      : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-accent)]/50 focus:border-[color:var(--color-accent)]';

    const classes = [baseClasses, stateClasses, className].filter(Boolean).join(' ');

    // Keep overlay typography in sync but avoid layout-affecting classes
    const getTypographyClasses = (cn?: string) => {
      if (!cn) return '';
      const tokens = cn.split(/\s+/).filter(Boolean);
      const safe = tokens.filter((t) => /^(leading-|tracking-|font-|text-|tab-)/.test(t));
      return safe.join(' ');
    };

    // Robust caret position calculation using a hidden mirror element
    const getCaretCoordinates = (textarea: HTMLTextAreaElement, position: number) => {
      const style = window.getComputedStyle(textarea);

      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordWrap = 'break-word';
      div.style.overflow = 'hidden';
      div.style.top = '0';
      div.style.left = '0';
      div.style.width = `${textarea.clientWidth}px`;

      // Mirror critical styles for accurate wrapping
      const propsToCopy = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'letterSpacing',
        'textTransform',
        'textIndent',
        'textAlign',
        'lineHeight',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'boxSizing',
        'tabSize',
      ] as const;

      propsToCopy.forEach((prop) => {
        // @ts-expect-error: dynamic style copy
        div.style[prop] = style[prop as any];
      });

      // Ensure mirror has no borders to avoid width mismatches
      div.style.borderTopWidth = '0px';
      div.style.borderRightWidth = '0px';
      div.style.borderBottomWidth = '0px';
      div.style.borderLeftWidth = '0px';
      div.style.borderStyle = 'none';

      const value = textarea.value.substring(0, position);
      // Replace spaces/newlines to preserve layout
      const safeValue = value.replace(/\n$/g, '\n\u200b'); // zero-width space to keep last line height

      const span = document.createElement('span');
      span.textContent = '\u200b'; // marker

      div.textContent = safeValue;
      div.appendChild(span);

      document.body.appendChild(div);

      const top = span.offsetTop;
      const left = span.offsetLeft;
      const height = span.offsetHeight || parseInt(style.lineHeight) || 16;

      document.body.removeChild(div);

      return { top, left, height };
    };

    // Highlight variables in text
    const renderHighlightedText = (text: string) => {
      if (!enableVariableAutocomplete || !text) return text;

      const validVariableKeys = new Set(variables.map((v) => v.key));
      const variableRegex = /\{\{([^}]*)\}\}/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      let keyCounter = 0;

      while ((match = variableRegex.exec(text)) !== null) {
        // Add text before the variable
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${keyCounter++}`} className="text-[color:var(--color-foreground)]">
              {text.substring(lastIndex, match.index)}
            </span>,
          );
        }

        // Add the variable with highlighting
        const variableKey = match[1];
        const isValid = validVariableKeys.has(variableKey);
        const highlightClass = isValid
          ? 'bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]'
          : 'bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]';

        parts.push(
          <span key={`var-${match.index}`} className={`${highlightClass}`}>
            {match[0]}
          </span>,
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(
          <span key={`text-${keyCounter++}`} className="text-[color:var(--color-foreground)]">
            {text.substring(lastIndex)}
          </span>,
        );
      }

      return parts;
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart;

      if (onChange) {
        onChange(e);
      }

      if (!enableVariableAutocomplete) return;

      setCursorPosition(cursorPos);

      // Check if we just typed {{
      const textBeforeCursor = newValue.substring(0, cursorPos);

      // Only show autocomplete after {{ is fully typed
      if (textBeforeCursor.endsWith('{{')) {
        setAutocompleteQuery('');

        // Calculate caret position relative to container
        const coords = getCaretCoordinates(e.target, cursorPos);
        const taRect = e.target.getBoundingClientRect();
        const containerRect = containerRef.current
          ? containerRef.current.getBoundingClientRect()
          : (e.target as HTMLTextAreaElement).getBoundingClientRect();

        const top =
          taRect.top - containerRect.top + coords.top - e.target.scrollTop + coords.height;
        const left = taRect.left - containerRect.left + coords.left - e.target.scrollLeft;

        setAutocompletePosition(clampAutocompletePosition({ top, left }, containerRect));

        setShowAutocomplete(true);
      } else {
        // Check if we're inside {{ }}
        const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
        const lastCloseBrace = textBeforeCursor.lastIndexOf('}}');

        // If we have {{ after the last }} (or no }} at all), we might be typing a variable
        if (lastOpenBrace > lastCloseBrace && lastOpenBrace !== -1) {
          const queryStart = lastOpenBrace + 2;
          const query = textBeforeCursor.substring(queryStart);

          // Only show autocomplete if query doesn't contain invalid characters
          if (!/[{}]/.test(query)) {
            setAutocompleteQuery(query);

            // Calculate caret position relative to container
            const coords = getCaretCoordinates(e.target, cursorPos);
            const taRect = e.target.getBoundingClientRect();
            const containerRect = containerRef.current
              ? containerRef.current.getBoundingClientRect()
              : (e.target as HTMLTextAreaElement).getBoundingClientRect();

            const top =
              taRect.top - containerRect.top + coords.top - e.target.scrollTop + coords.height;
            const left = taRect.left - containerRect.left + coords.left - e.target.scrollLeft;

            setAutocompletePosition(clampAutocompletePosition({ top, left }, containerRect));

            setShowAutocomplete(true);
          } else {
            setShowAutocomplete(false);
          }
        } else {
          setShowAutocomplete(false);
        }
      }
    };

    const handleVariableSelect = (variable: VariableListItem) => {
      if (!textareaRef.current || !onChange) return;

      const textarea = textareaRef.current;
      const currentValue = textarea.value;
      const cursorPos = cursorPosition;

      // Find the {{ before cursor
      const textBeforeCursor = currentValue.substring(0, cursorPos);
      const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');

      if (lastOpenBrace !== -1) {
        // Replace from {{ to cursor with the complete variable
        const newValue =
          currentValue.substring(0, lastOpenBrace) +
          `{{${variable.key}}}` +
          currentValue.substring(cursorPos);

        // Create synthetic event
        const syntheticEvent = {
          target: { value: newValue, selectionStart: lastOpenBrace + variable.key.length + 4 },
        } as React.ChangeEvent<HTMLTextAreaElement>;

        onChange(syntheticEvent);

        // Set cursor position after the inserted variable
        setTimeout(() => {
          const newCursorPos = lastOpenBrace + variable.key.length + 4;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }, 0);
      }

      setShowAutocomplete(false);
    };

    const handleAutocompleteClose = () => {
      setShowAutocomplete(false);
    };

    // Handle cursor position changes
    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      setCursorPosition(target.selectionStart);
      // Reposition autocomplete when caret moves
      if (showAutocomplete) {
        const ta = target;
        const coords = getCaretCoordinates(ta, ta.selectionStart || 0);
        const taRect = ta.getBoundingClientRect();
        const containerRect = containerRef.current
          ? containerRef.current.getBoundingClientRect()
          : ta.getBoundingClientRect();
        const top = taRect.top - containerRect.top + coords.top - ta.scrollTop + coords.height;
        const left = taRect.left - containerRect.left + coords.left - ta.scrollLeft;
        setAutocompletePosition(clampAutocompletePosition({ top, left }, containerRect));
      }
    };

    // Sync overlay content position to textarea scroll (single scrollbar)
    const syncOverlayScroll = () => {
      if (!overlayContentRef.current || !textareaRef.current) return;
      const st = textareaRef.current.scrollTop;
      const sl = textareaRef.current.scrollLeft;
      overlayContentRef.current.style.transform = `translate(${-sl}px, ${-st}px)`;
    };

    const handleScroll = () => {
      syncOverlayScroll();
      // Reposition autocomplete when scrolling
      if (showAutocomplete && textareaRef.current) {
        const ta = textareaRef.current;
        const coords = getCaretCoordinates(ta, ta.selectionStart || 0);
        const taRect = ta.getBoundingClientRect();
        const containerRect = containerRef.current
          ? containerRef.current.getBoundingClientRect()
          : ta.getBoundingClientRect();
        const top = taRect.top - containerRect.top + coords.top - ta.scrollTop + coords.height;
        const left = taRect.left - containerRect.left + coords.left - ta.scrollLeft;
        setAutocompletePosition(clampAutocompletePosition({ top, left }, containerRect));
      }
    };

    // Keep overlay aligned on value changes and on mount
    React.useEffect(() => {
      syncOverlayScroll();
    }, [value]);

    // Reposition autocomplete on window resize
    React.useEffect(() => {
      if (!showAutocomplete) return;
      const onResize = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        const coords = getCaretCoordinates(ta, ta.selectionStart || 0);
        const taRect = ta.getBoundingClientRect();
        const containerRect = containerRef.current
          ? containerRef.current.getBoundingClientRect()
          : ta.getBoundingClientRect();
        const top = taRect.top - containerRect.top + coords.top - ta.scrollTop + coords.height;
        const left = taRect.left - containerRect.left + coords.left - ta.scrollLeft;
        setAutocompletePosition(clampAutocompletePosition({ top, left }, containerRect));
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, [showAutocomplete]);

    // Utility: clamp autocomplete within container and flip if near bottom
    const clampAutocompletePosition = (
      pos: { top: number; left: number },
      containerRect: DOMRect,
    ) => {
      // Heuristic menu size
      const menuWidth = 320;
      const menuHeight = 220;
      let { top, left } = pos;

      // Clamp horizontally
      const containerWidth = containerRect.width;
      if (left + menuWidth > containerWidth) left = Math.max(0, containerWidth - menuWidth - 8);
      if (left < 0) left = 0;

      // Flip above if overflowing bottom
      const containerHeight = containerRect.height;
      if (top + menuHeight > containerHeight) top = Math.max(0, top - menuHeight - 8);
      if (top < 0) top = 0;

      return { top, left };
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-xs font-medium tracking-wide text-[color:var(--color-foreground)] uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {/* Highlighted text overlay */}
          {enableVariableAutocomplete && (
            <div
              ref={overlayRef}
              className={`pointer-events-none absolute inset-0 z-0 overflow-hidden`}
              style={{ background: 'transparent' }}
            >
              <div
                ref={overlayContentRef}
                className={`px-3 py-2 font-mono text-sm whitespace-pre-wrap ${getTypographyClasses(className)}`}
                style={{ color: 'transparent', fontKerning: 'none', fontVariantLigatures: 'none' }}
              >
                {renderHighlightedText(typeof value === 'string' ? value : '')}
              </div>
            </div>
          )}

          {/* Actual textarea */}
          <textarea
            id={textareaId}
            className={`${classes} scrollbar-thin scrollbar-thumb-[color:var(--color-border)] scrollbar-track-transparent hover:scrollbar-thumb-[color:var(--color-accent)]/50 relative z-10 ${enableVariableAutocomplete ? 'bg-transparent text-transparent caret-[color:var(--color-foreground)]' : ''}`}
            maxLength={maxLength}
            value={value}
            onChange={handleTextareaChange}
            onSelect={handleSelect}
            onScroll={handleScroll}
            ref={textareaRef}
            style={{
              WebkitOverflowScrolling: 'touch',
              fontKerning: 'none',
              fontVariantLigatures: 'none',
            }}
            {...props}
          />
        </div>

        {/* Variable Autocomplete */}
        {enableVariableAutocomplete && showAutocomplete && (
          <VariableAutocomplete
            query={autocompleteQuery}
            position={autocompletePosition}
            onSelect={handleVariableSelect}
            onClose={handleAutocompleteClose}
          />
        )}

        <div className="mt-1 flex items-center justify-between">
          <div>
            {error && <p className="text-xs text-[color:var(--color-danger)]">{error}</p>}
            {hint && !error && (
              <p className="text-xs text-[color:var(--color-muted-foreground)]">{hint}</p>
            )}
          </div>
          {showCharCount && (
            <p className="text-xs text-[color:var(--color-muted-foreground)]">
              {charCount}
              {maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    );
  },
);

PromptTextarea.displayName = 'PromptTextarea';

export { PromptTextarea };
