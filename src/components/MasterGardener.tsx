import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sprout, 
  RefreshCw, 
  User, 
  Bot, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { GardenDesign } from '../types/garden';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface MasterGardenerProps {
  garden: GardenDesign;
}

/**
 * Lightweight markdown parser for rich gardening advice formatting
 */
function renderMarkdownText(text: string) {
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    // Heading 3: ###
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-serif font-bold text-emerald-300 text-sm mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }

    // Heading 2: ##
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} className="font-serif font-bold text-white text-base mt-2.5 mb-1.5 border-b border-emerald-900/60 pb-1">
          {line.replace('## ', '')}
        </h3>
      );
    }

    // Bullet point: * or -
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const content = line.trim().substring(2);
      return (
        <div key={idx} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
          <span>{parseInlineStyles(content)}</span>
        </div>
      );
    }

    // Numbered list: 1. , 2.
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 my-1 pl-1">
          <span className="font-mono text-emerald-400 font-semibold text-[10px] shrink-0 mt-0.5">
            {numberedMatch[1]}.
          </span>
          <span>{parseInlineStyles(numberedMatch[2])}</span>
        </div>
      );
    }

    // Empty line spacer
    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }

    // Normal paragraph
    return (
      <p key={idx} className="my-1">
        {parseInlineStyles(line)}
      </p>
    );
  });
}

function parseInlineStyles(text: string) {
  // Bold: **word**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-emerald-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const MasterGardener: React.FC<MasterGardenerProps> = ({ garden }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your AI Master Horticulturist and Ecological Landscape Consultant. 
I have reviewed your active garden plan **"${garden.title}"** (${garden.style}, ${garden.dimensions.totalSqFt.toLocaleString()} sq ft). 

How can I help you today? Ask about seasonal pruning, organic pest management, soil testing, companion planting adjustments, or microclimate optimization!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    `How do I set up a drip irrigation schedule for the ${garden.zones[0]?.name || 'vegetable'} zone?`,
    'What organic remedies work best to deter aphids and hornworms without harming bees?',
    'When is the ideal time to prune climbing roses and perennials in this layout?',
    'What nitrogen-rich organic amendments should I add to my soil in early spring?',
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputQuestion;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/garden/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          gardenContext: {
            title: garden.title,
            style: garden.style,
            dimensions: garden.dimensions,
            zones: garden.zones,
            plants: garden.plants,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get advice from Master Gardener');
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I apologize, but I could not connect to the gardening knowledge base at this moment. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Consultation session refreshed for **"${garden.title}"**. What horticultural topic would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-[#121c15] rounded-3xl border border-emerald-900/60 shadow-xl overflow-hidden flex flex-col h-[700px] max-h-[85vh]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-emerald-900/80 bg-[#0c130e]/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <span>Master Gardener AI</span>
              <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/60">
                Online
              </span>
            </h3>
            <p className="text-[11px] text-emerald-300/70 truncate">
              Ecological & horticultural advisory for {garden.title}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Clear Conversation"
          className="p-2 rounded-xl text-emerald-400/70 hover:text-emerald-200 hover:bg-emerald-950 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow-md ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white font-medium rounded-tr-sm shadow-md'
                  : 'bg-[#0c130e] border border-emerald-900/80 text-emerald-100 rounded-tl-sm shadow-lg'
              }`}
            >
              {msg.sender === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <div className="space-y-1">{renderMarkdownText(msg.text)}</div>
              )}
              <div
                className={`text-[9px] font-mono mt-2.5 text-right ${
                  msg.sender === 'user' ? 'text-emerald-200/80' : 'text-emerald-500/70'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-mono p-3.5 bg-[#0c130e] rounded-2xl border border-emerald-950 w-fit animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
            <span>Consulting botanical database & seasonal care almanac...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Question Chips */}
      <div className="px-4 py-2.5 bg-[#0c130e]/90 border-t border-emerald-950 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[10px] font-mono text-emerald-400/70 uppercase whitespace-nowrap pl-1">
          Suggestions:
        </span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] bg-[#121c15] hover:bg-emerald-950 text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl border border-emerald-900/60 whitespace-nowrap transition-colors min-h-[30px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-4 bg-[#0c130e] border-t border-emerald-900/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask about companion plants, pests, pruning, soil or layout..."
            className="flex-1 bg-[#121c15] border border-emerald-900/80 rounded-xl px-4 py-3 text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
