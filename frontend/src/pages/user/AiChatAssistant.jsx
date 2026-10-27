import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { SendIcon, MicIcon } from '../../components/Icons';
import { speakText } from '../../i18n';
import { apiFetch } from '../../api';
import DiyGuideModal from '../../components/DiyGuideModal';

const EXAMPLE_SUGGESTION_CHIPS = [
  { label: '🚰 Tap is leaking', query: 'Tap is leaking and water is dripping continuously' },
  { label: '⚡ Fan not working', query: 'Ceiling fan is not rotating and humming' },
  { label: '🛵 Bike tyre puncture', query: 'bike tyre punchar' },
  { label: '📶 WiFi not connecting', query: 'WiFi router internet not connecting' }
];

export default function AiChatAssistant({ setActivePage, onFileTicket }) {
  const { user, lang, t, addToast } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I am your FixLink AI Smart Maintenance Assistant. I can help troubleshoot maintenance and repair problems (plumbing, electrical, home appliances, vehicles, cleaning, and campus infrastructure) in English, தமிழ், हिन्दी, తెలుగు, മലയാളம், or ಕನ್ನಡ. How can I help with your repair today?",
      lang: 'en'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeDiyGuide, setActiveDiyGuide] = useState(null);
  const [showDiyModal, setShowDiyModal] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const histRes = await apiFetch('/api/chat/history');
        if (histRes.ok) {
          const histData = await histRes.json();
          if (Array.isArray(histData) && histData.length > 0) {
            const formatted = histData.map((m, idx) => ({
              id: m._id || m.id || `hist-${idx}-${Date.now()}`,
              role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
              content: m.content || m.text || '',
              lang: m.lang || 'en',
              offTopic: m.offTopic,
              structuredTicket: m.structuredTicket,
              diyGuide: m.diyGuide
            }));
            setMessages(formatted);
          }
        }
      } catch (err) {
        console.warn('Could not load chat history:', err);
      }
    };

    loadHistory();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice speech-to-text listener
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Speech recognition is not supported in this browser.', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langMap = {
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        kn: 'kn-IN',
        en: 'en-US'
      };
      recognition.lang = langMap[lang] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        addToast('Listening... Speak your maintenance problem now.', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
        addToast('Voice input error. Please try again or type.', 'warning');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  // Send message handler
  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || inputText.trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: textToSend,
      lang
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textOverride) setInputText('');
    setIsLoading(true);

    const historyPayload = newHistory.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          message: textToSend,
          language: lang
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Service unavailable');
      }

      const data = await res.json();
      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        lang,
        offTopic: data.offTopic,
        structuredTicket: data.structuredTicket,
        diyGuide: data.diyGuide
      };

      setMessages(prev => [...prev, botMsg]);

      // Speak in background if available
      try {
        const cleanSpeak = (data.reply || '').replace(/[\*\#\_\`]/g, '').slice(0, 160);
        speakText(cleanSpeak, lang);
      } catch (audioErr) {
        console.warn('Audio speak error:', audioErr);
      }

    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        isError: true,
        failedText: textToSend,
        content: `⚠️ **AI assistant is temporarily unavailable.** (${err.message || 'Please try again later or raise a complaint directly'}).`,
        lang
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear your AI chat history?')) {
      try {
        await apiFetch('/api/chat/history', { method: 'DELETE' });
        setMessages([
          {
            id: Date.now(),
            role: 'assistant',
            content: "Chat cleared. How can I help with your maintenance or repair problem today?",
            lang: 'en'
          }
        ]);
        addToast('Chat history cleared successfully', 'success');
      } catch (err) {
        console.error('Failed to clear chat:', err);
      }
    }
  };

  // File official ticket action
  const handleTriggerFileTicket = (msg) => {
    let ticketData = msg?.structuredTicket;
    if (!ticketData) {
      ticketData = {
        category: 'Other',
        description: msg?.content ? msg.content.substring(0, 180) : 'Maintenance issue reported via FixLink AI Assistant',
        urgency: 'Medium'
      };
    }

    if (onFileTicket) {
      onFileTicket(ticketData);
    } else if (setActivePage) {
      setActivePage('raise');
    }
    addToast('Prefilled ticket details for submission!', 'success');
  };

  // Open interactive DIY modal
  const handleOpenDiyGuide = (guide) => {
    if (guide) {
      setActiveDiyGuide(guide);
      setShowDiyModal(true);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '2rem' }}>
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '78vh', padding: '1.25rem' }}>
        
        {/* Chat Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: 12
        }}>
          {/* Bot Title & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
            }}>
              🤖
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                FixLink Multilingual AI Troubleshooter
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
                <span style={{ fontSize: '0.75rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  Assistant Online
                </span>
                <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                  (Tamil • English • Hindi • Telugu • Malayalam • Kannada)
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearChat}
              style={{ padding: '5px 10px', fontSize: '0.76rem' }}
              title="Clear Chat History"
            >
              🗑️ Clear
            </button>

            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '5px 12px', fontSize: '0.8rem', fontWeight: 600 }}
              onClick={() => {
                const latestAiMsg = [...messages].reverse().find(m => m.role === 'assistant' && !m.isError && !m.offTopic);
                handleTriggerFileTicket(latestAiMsg);
              }}
            >
              ⚡ File Ticket
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 6 }}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isOffTopic = msg.offTopic;

            return (
              <div
                key={msg.id || index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: isUser ? '75%' : '85%',
                  background: isUser
                    ? 'var(--primary)'
                    : msg.isError
                    ? '#fef2f2'
                    : isOffTopic
                    ? '#f1f5f9'
                    : '#f8fafc',
                  color: isUser ? '#ffffff' : msg.isError ? '#b91c1c' : '#1f2937',
                  padding: '12px 16px',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  border: isUser
                    ? 'none'
                    : msg.isError
                    ? '1px solid #fecaca'
                    : isOffTopic
                    ? '1px solid #cbd5e1'
                    : '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  fontSize: '0.92rem',
                  lineHeight: 1.55,
                  position: 'relative'
                }}>

                  {/* Off-topic notice tag */}
                  {!isUser && isOffTopic && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: '0.7rem', color: '#b45309', background: '#fffbeb', padding: '2px 8px', borderRadius: 6, fontWeight: 700, border: '1px solid #fde68a' }}>
                        🔧 Maintenance Scope Only
                      </span>
                    </div>
                  )}

                  {/* Markdown Formatted Content */}
                  <div className="markdown-content" style={{ overflowWrap: 'break-word' }}>
                    {isUser ? (
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>

                  {/* Error Retry Button */}
                  {msg.isError && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.76rem', background: '#ef4444', color: '#fff', borderColor: '#ef4444' }}
                        onClick={() => handleSendMessage(null, msg.failedText)}
                      >
                        🔄 Retry Message
                      </button>
                    </div>
                  )}

                  {/* Assistant Action Footers */}
                  {!isUser && !msg.isError && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: '1px solid #e2e8f0',
                      flexWrap: 'wrap',
                      gap: 8
                    }}>
                      {/* Left helper actions */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {!isOffTopic && msg.diyGuide && (
                          <button
                            type="button"
                            onClick={() => handleOpenDiyGuide(msg.diyGuide)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              borderRadius: 6,
                              padding: '3px 8px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            🔧 Interactive DIY Guide ({msg.diyGuide.steps?.length || 0} Steps)
                          </button>
                        )}

                        {!isOffTopic && (
                          <button
                            type="button"
                            onClick={() => handleTriggerFileTicket(msg)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              borderRadius: 6,
                              padding: '3px 8px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            📋 File Ticket
                          </button>
                        )}
                      </div>

                      {/* Right: TTS Listen Button */}
                      <button
                        type="button"
                        onClick={() => {
                          speakText(msg.content.replace(/[\*\#\_\`]/g, ''), msg.lang);
                          addToast('Playing audio response...', 'info');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer',
                          fontSize: '0.74rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 6px'
                        }}
                        title="Speak Message in localized voice"
                      >
                        🔊 Listen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#6b7280', fontSize: '0.84rem', padding: '6px 10px' }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem'
              }}>
                🤖
              </div>
              <span style={{ fontStyle: 'italic' }}>
                AI is checking maintenance steps...
              </span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 1 && (
          <div style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 10,
            marginBottom: 4,
            padding: '4px 2px'
          }}>
            <span style={{ fontSize: '0.76rem', color: '#6b7280', alignSelf: 'center', marginRight: 4 }}>
              Try:
            </span>
            {EXAMPLE_SUGGESTION_CHIPS.map(chip => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleSendMessage(null, chip.query)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#374151',
                  borderRadius: 16,
                  padding: '4px 10px',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                  e.currentTarget.style.color = '#1d4ed8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Voice Listening Banner */}
        {isListening && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            padding: '6px 12px',
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#b91c1c'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
              Listening ({lang.toUpperCase()})... Speak your maintenance problem.
            </span>
            <button
              type="button"
              onClick={() => setIsListening(false)}
              style={{ background: 'transparent', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600 }}
            >
              Stop ⏹️
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            display: 'flex',
            gap: 8,
            marginTop: '0.85rem',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '0.85rem'
          }}
        >
          {/* Voice Input Mic Button */}
          <button
            type="button"
            id="chat-mic-btn"
            onClick={startSpeechRecognition}
            className="btn btn-secondary"
            style={{
              padding: '0 12px',
              borderRadius: 8,
              background: isListening ? '#ef4444' : '#ffffff',
              borderColor: isListening ? '#ef4444' : '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Speak message by voice"
          >
            <MicIcon size={17} color={isListening ? '#fff' : '#4b5563'} />
          </button>

          {/* Text Input Box */}
          <input
            id="chat-query-input"
            type="text"
            className="form-input"
            value={inputText}
            disabled={isLoading}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your issue (e.g. 'tap leaking', 'bike tyre punchar', 'AC cooling illa')..."
            style={{
              flex: 1,
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.9rem'
            }}
          />

          {/* Send Button */}
          <button
            id="chat-send-btn"
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="btn btn-primary"
            style={{
              padding: '0 18px',
              borderRadius: 8,
              opacity: isLoading || !inputText.trim() ? 0.6 : 1,
              cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            <SendIcon size={16} color="#fff" />
          </button>
        </form>
      </div>

      {/* Interactive Step-by-Step DIY Guide Modal */}
      {showDiyModal && activeDiyGuide && (
        <DiyGuideModal
          guide={activeDiyGuide}
          lang={lang}
          onClose={() => setShowDiyModal(false)}
          onComplete={() => {
            setShowDiyModal(false);
            addToast('🎉 Great job! DIY repair completed successfully!', 'success');
          }}
          onEscalate={() => {
            setShowDiyModal(false);
            if (setActivePage) setActivePage('raise');
          }}
        />
      )}
    </div>
  );
}
