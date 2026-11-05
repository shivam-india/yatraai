'use client';

// ==============================================================================
// YATRA AI - ASK YATRA FLOATING GUIDE PANEL
// Context-aware AI local guide with quick prompts and journey comprehension
// ==============================================================================

import React, { useState } from 'react';
import { Compass, Sparkles, Send, X, MessageSquare, Loader2, Info } from 'lucide-react';
import { Journey, JourneyStop, Place } from '@/types';

interface AskYatraProps {
  isOpen: boolean;
  onClose: () => void;
  journey?: Journey | null;
  activeStop?: JourneyStop | null;
}

interface Message {
  sender: 'user' | 'yatra';
  text: string;
  source?: string;
  isDemo?: boolean;
}

const QUICK_PROMPTS = [
  'Why is this place important?',
  'What should I eat nearby?',
  'What else can I see within 15 minutes?',
  'Is this detour worth the extra travel time?',
];

export default function AskYatraSheet({
  isOpen,
  onClose,
  journey,
  activeStop,
}: AskYatraProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'yatra',
      text: `Hello! I'm your Yatra AI guide. I'm following your journey along the corridor. Ask me anything about historical stories, authentic food stops, or transit timing along your route.`,
      source: 'Yatra Intelligence',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          currentPlaceName: activeStop?.title || journey?.origin.name,
          currentCity: activeStop?.place?.city || journey?.destination.name,
          journeyContext: journey ? {
            origin: journey.origin.name,
            destination: journey.destination.name,
            totalDurationMins: journey.totalDurationMins,
            budget: journey.totalBudgetEst,
          } : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'yatra',
            text: data.answer,
            source: data.source,
            isDemo: data.isDemo,
          },
        ]);
      } else {
        throw new Error(data.error);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'yatra',
          text: `I'm having a brief connection pause, but along this corridor, don't miss the authentic highway dhabas and historical stepwells within 20 mins of the transit terminals!`,
          source: 'Offline Safe Guide',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-yatra-500 text-white flex items-center justify-center shadow-soft">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Ask Yatra
              <span className="text-[10px] font-semibold uppercase bg-yatra-100 text-yatra-800 px-1.5 py-0.2 rounded">
                AI Guide
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {activeStop ? `Focusing on ${activeStop.title}` : 'Exploring transit route'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-yatra-500 text-white rounded-br-none shadow-soft'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/50'
              }`}
            >
              {msg.text}
            </div>

            {msg.source && (
              <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                <Info className="w-2.5 h-2.5" />
                {msg.source}
              </span>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-yatra-500" />
            <span>Consulting regional transit & cultural records...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="text-[11px] whitespace-nowrap bg-white border border-slate-200 hover:border-yatra-400 text-slate-700 px-2.5 py-1 rounded-full transition shadow-2xs hover:bg-yatra-50 active:scale-95"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Yatra about food, history, or timing..."
            className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs border border-transparent focus:border-yatra-400 rounded-xl px-3.5 py-2.5 outline-none transition text-slate-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-yatra-500 hover:bg-yatra-600 disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-soft active:scale-95"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

