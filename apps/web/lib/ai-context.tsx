'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export type AIModule = 'dashboard' | 'announcements' | 'awards' | 'finance' | 'assets' | 'grade' | 'students' | 'unknown';

export interface AIFieldContext {
  module: AIModule;
  pageTitle?: string;
}

interface AIContextValue {
  context: AIFieldContext | null;
  activeFieldLabel: string;
  registerField: (el: HTMLInputElement | HTMLTextAreaElement | null, label: string) => void;
  unregisterField: () => void;
  insertIntoField: (content: string) => void;
  setContext: (ctx: AIFieldContext | null) => void;
}

const AIContext = createContext<AIContextValue>({
  context: null,
  activeFieldLabel: '',
  registerField: () => {},
  unregisterField: () => {},
  insertIntoField: () => {},
  setContext: () => {},
});

export function useAIContext() {
  return useContext(AIContext);
}

export function useAIGlobal(module: AIModule, pageTitle?: string) {
  const { setContext } = useContext(AIContext);
  useEffect(() => {
    setContext({ module, pageTitle });
    return () => setContext(null);
  }, [module, pageTitle, setContext]);
}

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [context, setContextState] = useState<AIFieldContext | null>(null);
  const [activeFieldLabel, setActiveFieldLabel] = useState('');
  const activeFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const labelRef = useRef('');

  const registerField = useCallback((el: HTMLInputElement | HTMLTextAreaElement | null, label: string) => {
    activeFieldRef.current = el;
    labelRef.current = label;
    setActiveFieldLabel(label);
  }, []);

  const unregisterField = useCallback(() => {
    activeFieldRef.current = null;
    labelRef.current = '';
    setActiveFieldLabel('');
  }, []);

  const insertIntoField = useCallback((content: string) => {
    const el = activeFieldRef.current;
    if (!el) {
      console.warn('[AI] No active field registered. Click on a text field first, then use AI.');
      return;
    }
    if (!document.body.contains(el)) {
      console.warn('[AI] Active field is no longer in the DOM.');
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      ?? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    const newValue = el.value.substring(0, start) + content + el.value.substring(end);
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, newValue);
    } else {
      el.value = newValue;
    }
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: content }));
    el.focus();
    const newCursorPos = start + content.length;
    el.setSelectionRange(newCursorPos, newCursorPos);
  }, []);

  // Auto-register focused input/textarea elements (skipping AI popover internals)
  useEffect(() => {
    let lastFocused: HTMLElement | null = null;

    const isInsideAIPanel = (el: HTMLElement): boolean => {
      return !!el.closest('[data-ai-panel="true"]');
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (isInsideAIPanel(target)) return;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        const type = (target as HTMLInputElement).type;
        if (!type || !['checkbox', 'radio', 'file', 'hidden', 'submit', 'button', 'reset', 'image', 'range', 'color'].includes(type)) {
          lastFocused = target;
          activeFieldRef.current = target;
          labelRef.current = target.name || target.id || target.placeholder || target.getAttribute('aria-label') || '輸入框';
          setActiveFieldLabel(labelRef.current);
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  return (
    <AIContext.Provider value={{ context, activeFieldLabel, registerField, unregisterField, insertIntoField, setContext: setContextState }}>
      {children}
    </AIContext.Provider>
  );
}
