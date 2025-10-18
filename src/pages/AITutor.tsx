import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Child {
  id: string;
  name: string;
  age: number;
  mascot_id: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AITutor = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("general learning");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (childId) {
      fetchChildData();
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm your AI learning buddy! 🌟 I'm here to help you learn anything you'd like. What would you like to explore today?`
      }]);
    }
  }, [childId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChildData = async () => {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (error) throw error;
      setChild(data);
    } catch (error) {
      console.error("Error fetching child:", error);
      toast.error("Failed to load learner data");
    }
  };

  const getMascotEmoji = (mascotId: string) => {
    const mascots: { [key: string]: string } = {
      dragon: "🐉",
      unicorn: "🦄",
      robot: "🤖",
      panda: "🐼",
      fox: "🦊",
      owl: "🦉",
    };
    return mascots[mascotId] || "✨";
  };

  const streamChat = async (userMessage: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    setInput("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages,
            childAge: child?.age,
            subject: subject,
          }),
        }
      );

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          toast.error("Too many questions! Take a short break and try again. 😊");
        } else if (response.status === 402) {
          toast.error("AI tutor limit reached. Please contact support.");
        } else {
          toast.error("Failed to get response from AI tutor");
        }
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let textBuffer = "";

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage
                };
                return newMessages;
              });
            }
          } catch (e) {
            // Incomplete JSON, will be completed in next chunk
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error streaming chat:", error);
      toast.error("Something went wrong. Please try again!");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    streamChat(input);
  };

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-primary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(`/learn/${childId}`)}
          variant="secondary"
          className="mb-6 rounded-full hover:scale-105 transition-bounce"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="bg-white rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 gradient-primary text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-float">{getMascotEmoji(child.mascot_id)}</div>
              <div>
                <h1 className="text-3xl font-black mb-1">AI Tutor for {child.name}</h1>
                <p className="text-white/90">Ask me anything! I'm here to help you learn 🚀</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <label className="text-sm font-semibold text-foreground mb-2 block">
                What are we learning today?
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Math, Science, Reading..."
                className="rounded-2xl"
              />
            </div>

            <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-xs font-semibold">AI Tutor</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your question..."
                className="rounded-full flex-1"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-full gradient-primary text-white border-0 hover:shadow-glow transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AITutor;
