"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useRef, useEffect, useState, useCallback, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;
      setInput("");
      sendMessage({ text: trimmed });
    },
    [input, isLoading, sendMessage]
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      setInput("");
      sendMessage({ text: suggestion });
    },
    [sendMessage]
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot
                className="size-12 text-muted-foreground/40 mb-4"
                aria-hidden="true"
              />
              <h2 className="text-lg font-semibold">Intent AI Assistant</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Ask me to show your content updates, campaign metrics, or
                analytics summary. I can update your dashboard in real-time.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "Show me today's analytics",
                  "Show content updates",
                  "Show campaign metrics",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const text = getMessageText(message);
            if (!text) return null;

            return (
              <Card
                key={message.id}
                className={cn(
                  "max-w-[85%]",
                  message.role === "user" ? "ml-auto" : "mr-auto"
                )}
              >
                <CardContent className="flex gap-3 p-3">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="size-4" aria-hidden="true" />
                    ) : (
                      <Bot className="size-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {message.role === "user" ? "You" : "Intent"}
                    </p>
                    <div className="text-sm whitespace-pre-wrap">{text}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <Card className="mr-auto max-w-[85%]">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="size-4" aria-hidden="true" />
                </div>
                <div className="flex gap-1">
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border pt-4"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <Input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your marketing..."
          disabled={isLoading}
          autoComplete="off"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="size-4" aria-hidden="true" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
