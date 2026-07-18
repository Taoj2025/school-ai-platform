'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type AIModule = 'dashboard' | 'announcements' | 'awards' | 'finance' | 'assets' | 'grade' | 'students' | 'unknown';

export interface AIFieldContext {
  module: AIModule;
  pageTitle?: string;
  fieldLabel?: string;
  fieldValue?: string;
  suggestions?: string[];
}

interface AIContextValue {
  context: AIFieldContext | null;
  focusedField: React.RefObject<HTMLInputElement | HTMLTextAreaElement> | null;
  setContext: (ctx: AIFieldContext | null) => void;
  registerField: (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>, label: string) => void;
  unregisterField: () => void;
  insertIntoField: (content: string) => void;
}

const AIContext = createContext<AIContextValue>({
  context: null,
  focusedField: null,
  setContext: () => {},
  registerField: () => {},
  unregisterField: () => {},
  insertIntoField: () => {},
});

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [context, setContextState] = useState<AIFieldContext | null>(null);
  const [fieldRef, setFieldRef] = useState<React.RefObject<HTMLInputElement | HTMLTextAreaElement> | null>(null);
  const [fieldLabel, setFieldLabel] = useState<string>('');

  const setContext = useCallback((ctx: AIFieldContext | null) => {
    setContextState(ctx);
  }, []);

  const registerField = useCallback((ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>, label: string) => {
    setFieldRef(ref);
    setFieldLabel(label);
  }, []);

  const unregisterField = useCallback(() => {
    setFieldRef(null);
    setFieldLabel('');
  }, []);

  const insertIntoField = useCallback((content: string) => {
    if (fieldRef?.current) {
      const el = fieldRef.current;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const newValue = el.value.substring(0, start) + content + el.value.substring(end);
      const event = new Event('input', { bubbles: true });
      el.value = newValue;
      el.dispatchEvent(event);
      el.focus();
      el.setSelectionRange(start + content.length, start + content.length);
    }
  }, [fieldRef]);

  return (
    <AIContext.Provider value={{ context, focusedField: fieldRef, setContext, registerField, unregisterField, insertIntoField }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  return useContext(AIContext);
}

export function useAIGlobal(module: AIModule, pageTitle?: string) {
  const { setContext } = useAIContext();
  React.useEffect(() => {
    setContext({ module, pageTitle });
    return () => setContext(null);
  }, [module, pageTitle, setContext]);
}
