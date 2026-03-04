"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useRef, useEffect, useState, useCallback, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  connectionStatus: "connected" | "disconnected" | "connecting";
  onClose?: () => void;
  isMobile?: boolean;
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatPanel({ connectionStatus, onClose, isMobile = false }: ChatPanelProps) {
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
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-sm font-semibold">AI Assistant</h2>
        </div>
        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close chat"
            className="size-7"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bot
                className="size-12 text-muted-foreground/40 mb-4"
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold">Intent AI Assistant</h3>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Ask me to show your content updates, campaign metrics, or
                analytics summary. I can update your dashboard in real-time.
              </p>
              <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
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
                    className="w-full text-xs"
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
                  "max-w-[90%]",
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
                    <div className="text-sm whitespace-pre-wrap break-words">{text}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <Card className="mr-auto max-w-[90%]">
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

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border bg-background p-4"
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
