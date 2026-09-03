import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { assistantApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

// Safe markdown bold text parser
function FormattedMessage({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} style={{ fontWeight: 800, color: 'var(--fg)' }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </span>
  );
}

export default function AssistantPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `👋 Hello **${user?.name || 'there'}**! I am **FINORA Assistant**, your personal financial intelligence companion.\n\nI can analyze your transactions, monitor budget caps, track savings milestones, and suggest actionable ways to optimize your cash flow.`,
      suggestions: [
        'Where did I spend the most this month?',
        'Am I staying within my budget?',
        'How can I reduce my expenses?',
        'What are my biggest recurring expenses?',
        'How much did I save this month?',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await assistantApi.ask(textToSend);
      const data = res.data;

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || 'Here is your financial summary.',
        suggestions: data.suggestions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Assistant error:', err);
      addToast(err.message || 'Failed to get answer from assistant', 'error');

      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '⚠️ I encountered an issue analyzing your financial records. Please ensure your database is active and try again.',
        suggestions: ['Where did I spend the most this month?'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Chat cleared. How can I assist with your finances today?`,
        suggestions: [
          'Where did I spend the most this month?',
          'Am I staying within my budget?',
          'How can I reduce my expenses?',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <PageContainer className="max-w-4xl mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="FINORA AI Assistant"
        subtitle="Data-backed personal financial intelligence & recommendations."
        actions={
          <Button variant="secondary" size="md" icon={RefreshCw} onClick={handleClearChat}>
            Reset Chat
          </Button>
        }
      />

      {/* 2. Chat Container Box */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px 28px',
          minHeight: '520px',
          height: 'calc(100vh - 270px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '20px',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* Messages Feed */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingRight: '6px' }}>
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  flexDirection: isBot ? 'row' : 'row-reverse',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: isBot ? 'rgba(var(--accent-rgb), 0.15)' : '#3F3F46',
                    color: isBot ? 'var(--accent)' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {isBot ? <Bot size={18} /> : <User size={18} />}
                </div>

                {/* Message + Suggestions Container */}
                <div
                  style={{
                    maxWidth: isBot ? '680px' : '540px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                  }}
                >
                  {/* Speech Bubble */}
                  <div
                    style={{
                      padding: '16px 20px',
                      borderRadius: '18px',
                      borderTopLeftRadius: isBot ? '4px' : '18px',
                      borderTopRightRadius: isBot ? '18px' : '4px',
                      background: isBot ? 'var(--bg-surface)' : 'var(--accent)',
                      border: isBot ? '1px solid var(--border)' : 'none',
                      color: isBot ? 'var(--fg-secondary)' : '#FFFFFF',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <FormattedMessage text={m.text} />
                  </div>

                  {/* Suggestion Chips (Placed clearly underneath the bubble) */}
                  {isBot && m.suggestions?.length > 0 && (
                    <div style={{ marginTop: '14px', width: '100%' }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--fg-muted)',
                          marginBottom: '8px',
                        }}
                      >
                        Suggested Inquiries
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {m.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(s)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border)',
                              color: 'var(--fg)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              textAlign: 'left',
                            }}
                            className="hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.1)] shadow-xs"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--fg-muted)',
                      marginTop: '6px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* 3. Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <input
            type="text"
            placeholder="Ask anything about your finances, budgets, or savings goals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="input-field flex-1"
            style={{
              height: '48px',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              fontSize: '14px',
              padding: '0 16px',
              color: 'var(--fg)',
            }}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Send}
            loading={loading}
            disabled={!input.trim()}
            style={{ height: '48px', padding: '0 22px', borderRadius: '12px' }}
          >
            Send
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}
