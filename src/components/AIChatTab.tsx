import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { callAI } from '@/lib/deepseek';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHIPS = ['Safety Tips', 'Cost Savings', 'Stress Advice', 'Weekly Plan'];

export function AIChatTab({ context }: { context: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    const res = await callAI({ prompt: text, context });
    setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
    setLoading(false);
  };

  return (
    <Card className="border-commute-border shadow-commute flex flex-col" style={{ height: '420px' }}>
      <CardContent className="flex flex-col flex-1 min-h-0 p-6 gap-4">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {CHIPS.map(chip => (
              <Button key={chip} variant="outline" size="sm" onClick={() => sendMessage(`Give me ${chip.toLowerCase()} for my commute`)} className="text-xs uppercase tracking-widest">
                {chip}
              </Button>
            ))}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-3 text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                ) : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Thinking...</span>
            </div>
          )}
        </div>

        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2 shrink-0">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your commute..." className="flex-1 bg-background border-border" disabled={loading} />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} className="h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
