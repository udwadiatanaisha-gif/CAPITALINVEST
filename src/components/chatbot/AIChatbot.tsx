import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User as UserIcon, 
  ShieldAlert, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  PieChart,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isError?: boolean;
}

export const AIChatbot: React.FC = () => {
  const { currentUser, firmSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [missingKeyError, setMissingKeyError] = useState<string | null>(null);

  const isClientRole = currentUser?.role?.toLowerCase() === 'client';
  const isAdvisorRole = currentUser && !isClientRole;

  // Determine initial role welcome
  const getInitialWelcome = (): string => {
    if (isClientRole) {
      return `Welcome to your private wealth portal, ${currentUser?.name || 'Client'}. I am your CapitalVest AI Assistant. I can explain your portfolio allocation, goal progress, and investment terminology. How can I assist you today?`;
    }
    if (isAdvisorRole) {
      return `Welcome, ${currentUser?.name}. I am your CapitalVest AI Assistant. I can assist with portfolio rebalancing concepts, asset allocation drift, SEBI concentration rules, and platform workflows.`;
    }
    return `Welcome to CapitalVest Wealth Management. I am your AI Assistant. I can answer questions about our wealth command centre, asset allocation frameworks, financial health metrics, and Indian wealth management conventions (INR, Lakhs, Crores). How can I assist you?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      role: 'model',
      text: getInitialWelcome(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update initial message when user session changes
  useEffect(() => {
    setMessages([
      {
        id: `msg-welcome-${currentUser?.id || 'guest'}`,
        role: 'model',
        text: getInitialWelcome(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [currentUser?.id]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, messages, isLoading]);

  // Suggested prompt pills based on role
  const suggestedPrompts = isClientRole
    ? [
        'Summarize my current asset allocation',
        'How is my Financial Health score calculated?',
        'What does asset allocation drift mean?',
        'Explain Equity vs Debt risk'
      ]
    : isAdvisorRole
    ? [
        'Explain SEBI single-asset concentration thresholds',
        'How does spreadsheet synchronization handle rebalances?',
        'What are the key weights in Financial Health scoring?',
        'Explain portfolio standard deviation & beta'
      ]
    : [
        'What features does CapitalVest offer?',
        'How does CapitalVest protect client privacy?',
        'Explain the Financial Health scoring methodology',
        'How do I log in to the Client Portal?'
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setMissingKeyError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('capitalvest_auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Convert conversation history for context (exclude errors)
      const validHistory = messages
        .filter(m => !m.isError)
        .map(m => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          history: validHistory
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.configured === false || res.status === 503) {
          setMissingKeyError(
            data.error ||
            'Gemini API key is not configured. Please add your GEMINI_API_KEY in the Settings > Secrets panel to activate live AI responses.'
          );
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `msg-err-${Date.now()}`,
              role: 'model',
              text: data.error || 'The AI service encountered an issue. Please try again.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isError: true
            }
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-resp-${Date.now()}`,
            role: 'model',
            text: data.reply || 'I am ready to assist with your wealth management inquiries.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'model',
          text: 'Unable to reach the CapitalVest AI service. Please check your network connection and retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-welcome-reset-${Date.now()}`,
        role: 'model',
        text: getInitialWelcome(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setMissingKeyError(null);
  };

  return (
    <>
      {/* Floating Trigger Button (when chat window is closed) */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-6 right-6 z-40 group flex items-center space-x-2 px-4 py-3 bg-[#101C2C] hover:bg-[#172B46] text-white rounded-full shadow-2xl border border-[#C6A76A]/50 transition-all duration-200 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
          title="Open CapitalVest AI Wealth Assistant"
          aria-label="Open CapitalVest AI Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#C6A76A] flex items-center justify-center text-[#101C2C] shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#101C2C] animate-pulse" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-xs font-bold tracking-tight text-white flex items-center">
              AI Assistant
            </div>
            <div className="text-[10px] text-[#C6A76A] font-medium leading-none">
              CapitalVest Intelligence
            </div>
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 transition-all duration-200 overflow-hidden ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-96 max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6rem)]'
          }`}
          style={{ boxShadow: '0 20px 40px -10px rgba(16, 28, 44, 0.35)' }}
        >
          {/* Header */}
          <div className="bg-[#101C2C] text-white px-4 py-3 flex items-center justify-between border-b border-[#172B46] flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C6A76A] flex items-center justify-center text-[#101C2C] font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center space-x-1.5">
                  <span>CapitalVest AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-300">
                  {isClientRole ? (
                    <span className="text-emerald-300 font-medium">Client Portal • {currentUser?.name}</span>
                  ) : isAdvisorRole ? (
                    <span className="text-[#C6A76A] font-medium">Advisor Command • {currentUser?.name}</span>
                  ) : (
                    <span className="text-slate-400 font-medium">Public Information Mode</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-300">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when expanded */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
              {/* Disclaimer Ribbon */}
              <div className="bg-[#F7F5F0] border-b border-slate-200 px-3 py-1.5 text-[10px] text-slate-500 flex items-center justify-between flex-shrink-0">
                <span className="truncate">Informative AI intelligence. Not fiduciary investment advice.</span>
                <button
                  onClick={handleClearHistory}
                  className="text-slate-400 hover:text-slate-700 ml-2 font-medium flex-shrink-0 cursor-pointer"
                  title="Clear conversation history"
                >
                  Clear
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-end space-x-1.5 max-w-[85%]">
                      {msg.role === 'model' && (
                        <div className="w-6 h-6 rounded-full bg-[#101C2C] text-[#C6A76A] flex-shrink-0 flex items-center justify-center mb-1 text-[10px]">
                          <Sparkles className="w-3 h-3" />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#101C2C] text-white rounded-br-xs'
                            : msg.isError
                            ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-xs'
                            : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                        <div
                          className={`text-[9px] mt-1 text-right ${
                            msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center space-x-2 text-slate-400 py-1">
                    <div className="w-6 h-6 rounded-full bg-[#101C2C] text-[#C6A76A] flex items-center justify-center text-[10px]">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 flex items-center space-x-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C6A76A] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C6A76A] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C6A76A] animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[11px] text-slate-500 font-medium ml-1">Analyzing...</span>
                    </div>
                  </div>
                )}

                {/* Missing Key Setup Notice */}
                {missingKeyError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[11px]">Gemini Integration Setup Required</div>
                        <p className="text-[10px] text-amber-800 mt-0.5 leading-relaxed">
                          {missingKeyError}
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-800 bg-white/70 p-2 rounded border border-amber-200/60">
                      <strong>To activate live AI responses:</strong>
                      <ol className="list-decimal list-inside mt-0.5 space-y-0.5">
                        <li>Open the AI Studio left menu and select <strong>Settings &gt; Secrets</strong></li>
                        <li>Add your <code>GEMINI_API_KEY</code></li>
                        <li>Return here and ask any question</li>
                      </ol>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggested Prompt Pills */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex space-x-1.5 scrollbar-none flex-shrink-0">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#F7F5F0] hover:bg-[#C6A76A]/20 text-slate-700 hover:text-[#101C2C] border border-slate-200 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
                <form
                  onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center space-x-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about portfolios, goals, risk metrics..."
                    className="flex-1 py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C6A76A] bg-slate-50 focus:bg-white text-slate-800"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-2 rounded-xl bg-[#101C2C] hover:bg-[#172B46] text-[#C6A76A] disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
