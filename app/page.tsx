"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./page.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What hours are you open?",
  "How many items can I borrow at once?",
  "What are the late return fees?",
  "How do I get a library card?",
  "Can I reserve a meeting room?",
  "How does interlibrary loan work?",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const userMessage = text.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setError(null);
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setMessages(messages); // revert
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLogo}>
  <img src="/ycl-logo.png" alt="York County Library" height={48} />
</div>
          <div>
            <h1 className={styles.headerTitle}>YCL Chat Assistant</h1>
<p className={styles.headerSub}>Ask anything about our library</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className={styles.chatWrapper}>
        <div className={styles.chatScroll}>
          {isEmpty ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M8 6h20l8 8v28H8V6z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                  <path d="M28 6v8h8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <line x1="14" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="14" y1="26" x2="30" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="14" y1="32" x2="22" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>How can I help you today?</h2>
              <p className={styles.emptyText}>
                I can answer questions about borrowing, fines, library cards,
                computers, room reservations, and more.
              </p>
              <div className={styles.suggestions}>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    className={styles.suggestion}
                    onClick={() => sendMessage(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.message} ${
                    msg.role === "user" ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.avatar}>
                      <svg width="16" height="16" viewBox="0 0 28 28" fill="currentColor">
                        <rect x="3" y="4" width="6" height="20" rx="1" opacity="0.9"/>
                        <rect x="11" y="4" width="6" height="20" rx="1" opacity="0.7"/>
                        <rect x="19" y="4" width="6" height="20" rx="1" opacity="0.5"/>
                      </svg>
                    </div>
                  )}
                  <div className={styles.bubble}>
                    {msg.role === "assistant" ? (
                      <div className={styles.markdown}>
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} ${styles.assistantMessage}`}>
                  <div className={styles.avatar}>
                    <svg width="16" height="16" viewBox="0 0 28 28" fill="currentColor">
                      <rect x="3" y="4" width="6" height="20" rx="1" opacity="0.9"/>
                      <rect x="11" y="4" width="6" height="20" rx="1" opacity="0.7"/>
                      <rect x="19" y="4" width="6" height="20" rx="1" opacity="0.5"/>
                    </svg>
                  </div>
                  <div className={`${styles.bubble} ${styles.loadingBubble}`}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                </div>
              )}
              {error && (
                <div className={styles.errorBanner}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          {!isEmpty && (
            <div className={styles.suggestionRow}>
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  className={styles.suggestionChip}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about library policies…"
              rows={1}
              disabled={isLoading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className={styles.disclaimer}>
            Answers are based on library policy documents. For complex issues, please contact library staff.
          </p>
        </div>
      </div>
    </main>
  );
}
