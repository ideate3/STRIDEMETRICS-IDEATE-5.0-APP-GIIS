import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile, WorkoutRoutine } from '../types';
import { Send, Image as ImageIcon, Utensils, Zap, Trash2, Cloud, HardDrive, ShieldCheck, Key, CheckCircle2, AlertTriangle, Clock, RotateCcw, ExternalLink, HelpCircle, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sfx } from '../utils/sfx';
import { useDeferredLoading } from '../hooks/useDeferredLoading';
import { CoachMessageSkeleton } from './SkeletonLoader';

interface CoachChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, imageBase64?: string) => Promise<void>;
  userProfile: UserProfile;
  onStartWorkout: (workout: WorkoutRoutine) => void;
  onOpenMealScanner: () => void;
  onClearChatHistory?: () => void;
  onSaveKeySettings?: (option: 'default' | 'custom', customKey: string) => void;
}

export const CoachChat: React.FC<CoachChatProps> = ({
  messages,
  onSendMessage,
  userProfile,
  onStartWorkout,
  onOpenMealScanner,
  onClearChatHistory,
  onSaveKeySettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [inlineKey, setInlineKey] = useState('');
  const [inlineKeyNotice, setInlineKeyNotice] = useState('');
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number>(0);
  const [isCooldownActive, setIsCooldownActive] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deferred skeleton loading: only appears when AI response takes longer than 280ms
  const showSkeleton = useDeferredLoading(isLoading, { delay: 280, minDisplayTime: 400 });

  const isCloudStorage = (userProfile.storageMode || 'cloud') === 'cloud';

  // Countdown timer for rate limiting cooldown
  useEffect(() => {
    if (rateLimitCooldown <= 0) return;
    const timer = setInterval(() => {
      setRateLimitCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitCooldown]);

  const quickPrompts = [
    { label: 'Post-workout meal idea', prompt: 'What is an optimal post-workout meal for my target macros?' },
    { label: '15-min Core Burner', prompt: 'Give me an intense 15-minute home core workout requiring no equipment.' },
    { label: 'Form check tip', prompt: 'What are the top 3 common mistakes and form check tips for barbell squats?' },
    { label: 'Improve Sleep & Recovery', prompt: 'What science-backed recovery habits will optimize my muscle recovery tonight?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isLoading || isCooldownActive || rateLimitCooldown > 0) return;

    const textToSend = inputText;
    const imageToSend = selectedImage || undefined;

    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);
    setIsCooldownActive(true);

    try {
      await onSendMessage(textToSend, imageToSend);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      if (err?.message?.includes('Rate limit') || err?.isRateLimited) {
        setRateLimitCooldown(err.retryAfterSeconds || 20);
      }
    } finally {
      setIsLoading(false);
      // Brief 1.2s anti-spam client throttle
      setTimeout(() => setIsCooldownActive(false), 1200);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] max-w-5xl mx-auto px-2.5 sm:px-6 py-2 sm:py-4">
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3.5 sm:space-y-4 pr-1 sm:pr-2">
        
        {/* Welcome Coach Card */}
        {(() => {
          const rawCoachName = userProfile.coachName?.trim() || 'Coach Jason';
          const displayCoachName = rawCoachName.toLowerCase().startsWith('coach')
            ? rawCoachName
            : `Coach ${rawCoachName}`;
          const coachInitial = rawCoachName.replace(/^Coach\s+/i, '').trim().charAt(0).toUpperCase() || 'C';

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="squircle-card liquid-glass p-3.5 sm:p-6 relative overflow-hidden"
            >
              <div className="flex items-start gap-2.5 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black text-base sm:text-lg font-display">
                  {coachInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                      <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white font-display truncate">{displayCoachName}</h2>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                        {userProfile.coachingStyle.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Storage Mode Badge */}
                      {isCloudStorage ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400" title="Chats are saved to encrypted Firestore Cloud database">
                          <Cloud className="h-3 w-3 text-emerald-500" />
                          <span className="hidden sm:inline">Cloud</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400" title="Chats are saved in this browser">
                          <HardDrive className="h-3 w-3 text-amber-500" />
                          <span className="hidden sm:inline">Local</span>
                        </span>
                      )}

                      {/* Clear Chat Button */}
                      {onClearChatHistory && (
                        <button
                          onClick={() => setShowClearConfirm(true)}
                          className="flex items-center gap-1 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-rose-500/20 hover:text-rose-500 px-2 py-1 text-xs text-slate-700 dark:text-zinc-300 transition-colors"
                          title="Clear Chat History"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden md:inline font-medium">Clear</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-slate-800 dark:text-zinc-300 leading-relaxed">
                    I'm your dedicated health and performance coach. Ask me about custom training routines, macro breakdowns, or rapid recovery strategy.
                  </p>
                  
                  {/* Quick Prompt Chips */}
                  <div className="mt-2.5 sm:mt-3.5 flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                    {quickPrompts.map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputText(qp.prompt)}
                        className="shrink-0 flex items-center gap-1.5 squircle-btn border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.05] backdrop-blur-md px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-300 hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium active:scale-95 whitespace-nowrap"
                      >
                        <Zap className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                        <span>{qp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Message Stream */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isJason = msg.sender === 'jason';
            const rawCoachName = userProfile.coachName?.trim() || 'Coach Jason';
            const displayCoachName = rawCoachName.toLowerCase().startsWith('coach')
              ? rawCoachName
              : `Coach ${rawCoachName}`;
            const coachInitial = rawCoachName.replace(/^Coach\s+/i, '').trim().charAt(0).toUpperCase() || 'C';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex gap-2.5 sm:gap-3 ${isJason ? 'items-start' : 'items-end justify-end'}`}
              >
                {/* Jason Avatar */}
                {isJason && (
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm mt-1 font-display">
                    {coachInitial}
                  </div>
                )}

                <div className={`group relative max-w-[88%] sm:max-w-[78%] squircle-card p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                  isJason
                    ? 'liquid-glass rounded-tl-none border-l-2 border-l-emerald-500 dark:border-l-emerald-400 text-slate-900 dark:text-zinc-200'
                    : 'user-message-bubble bg-emerald-500 text-black font-bold rounded-br-none'
                }`}>
                  
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] sm:text-[11px]">
                    <span className={isJason ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-black font-bold'}>
                      {isJason ? displayCoachName : 'You'}
                    </span>
                    <span className={isJason ? 'text-slate-500 dark:text-zinc-400 font-mono' : 'msg-timestamp text-black/80 font-mono'}>{msg.timestamp}</span>
                  </div>

                  {/* Message Image if present */}
                  {msg.mealData?.imageUrl && (
                    <div className="my-2 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                      <img src={msg.mealData.imageUrl} alt="Uploaded meal" className="max-h-52 w-full object-cover" />
                    </div>
                  )}

                  {/* Body Text */}
                  <div className={`whitespace-pre-wrap ${isJason ? '' : 'text-black font-bold'}`}>
                    {isJason
                      ? msg.text
                          .replace(/Coach Jason's/g, `${displayCoachName}'s`)
                          .replace(/Coach Jason/g, displayCoachName)
                      : msg.text}
                  </div>

                  {/* Structured Error Diagnostics & Fix Guide */}
                  {msg.errorDetails && (
                    <div className="mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-[#19150d] p-3.5 text-xs space-y-2.5">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                        <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 font-display">
                          {msg.errorDetails.errorType === 'QUOTA_EXHAUSTED' && <Clock className="h-4 w-4 shrink-0 text-amber-500" />}
                          {msg.errorDetails.errorType === 'TRAFFIC_SPIKE' && <Zap className="h-4 w-4 shrink-0 text-amber-500" />}
                          {msg.errorDetails.errorType === 'MISSING_KEY' && <Key className="h-4 w-4 shrink-0 text-amber-500" />}
                          {msg.errorDetails.errorType === 'NETWORK_ERROR' && <WifiOff className="h-4 w-4 shrink-0 text-amber-500" />}
                          {(!msg.errorDetails.errorType || msg.errorDetails.errorType === 'SERVER_ERROR') && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />}
                          <span>{msg.errorDetails.title}</span>
                        </div>
                        {msg.errorDetails.retryAfterSeconds && isCooldownActive && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                            Reset in {rateLimitCooldown}s
                          </span>
                        )}
                      </div>

                      {/* What Happened */}
                      <div>
                        <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-zinc-400">
                          What is happening:
                        </div>
                        <p className="text-slate-800 dark:text-zinc-300 mt-0.5 leading-relaxed">
                          {msg.errorDetails.whatHappened}
                        </p>
                      </div>

                      {/* How to Fix It */}
                      {msg.errorDetails.howToFix && msg.errorDetails.howToFix.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <HelpCircle className="h-3 w-3" />
                            <span>How to fix this:</span>
                          </div>
                          <ul className="space-y-1 pl-1">
                            {msg.errorDetails.howToFix.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-zinc-300">
                                <span className="text-emerald-500 font-bold font-mono text-[10px] shrink-0 mt-0.5">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Key Input Box if Key is missing */}
                  {isJason && (msg.text.includes('Gemini API key') || msg.errorDetails?.errorType === 'MISSING_KEY') && onSaveKeySettings && (
                    <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <Key className="h-3.5 w-3.5" />
                        <span>Quick-Update Your Gemini API Key:</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={inlineKey}
                          onChange={(e) => setInlineKey(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = inlineKey.trim();
                              if (trimmed) {
                                onSaveKeySettings('custom', trimmed);
                                sfx.playLevelUp();
                                setInlineKeyNotice('✓ Key updated! You can now send your message.');
                                setTimeout(() => setInlineKeyNotice(''), 4000);
                              }
                            }
                          }}
                          placeholder="Paste AIzaSy... (Press Enter to update)"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = inlineKey.trim();
                            if (trimmed) {
                              onSaveKeySettings('custom', trimmed);
                              sfx.playLevelUp();
                              setInlineKeyNotice('✓ Key updated! You can now send your message.');
                              setTimeout(() => setInlineKeyNotice(''), 4000);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs active:scale-95 transition-all"
                        >
                          Save Key
                        </button>
                      </div>
                      {inlineKeyNotice ? (
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {inlineKeyNotice}
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-400">
                          Press <strong className="text-emerald-400">Enter</strong> to save key instantly.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Structured Meal Analysis Card embedded in chat */}
                  {msg.mealData && (
                    <div className="mt-3.5 rounded-2xl border border-slate-200 dark:border-emerald-500/30 bg-slate-100/90 dark:bg-[#0b0f17] p-3.5 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-2">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Utensils className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          {msg.mealData.foodName}
                        </span>
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          Score: {msg.mealData.healthScore}/100
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center py-0.5">
                        <div className="bg-white dark:bg-[#141a24] rounded-xl p-2 border border-slate-200 dark:border-white/[0.06]">
                          <div className="text-slate-600 dark:text-zinc-400 text-[9px] uppercase font-mono">Calories</div>
                          <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 text-xs sm:text-sm">{msg.mealData.calories}</div>
                        </div>
                        <div className="bg-white dark:bg-[#141a24] rounded-xl p-2 border border-slate-200 dark:border-white/[0.06]">
                          <div className="text-slate-600 dark:text-zinc-400 text-[9px] uppercase font-mono">Protein</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-xs sm:text-sm">{msg.mealData.proteinG}g</div>
                        </div>
                        <div className="bg-white dark:bg-[#141a24] rounded-xl p-2 border border-slate-200 dark:border-white/[0.06]">
                          <div className="text-slate-600 dark:text-zinc-400 text-[9px] uppercase font-mono">Carbs</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-zinc-300 mt-0.5 text-xs sm:text-sm">{msg.mealData.carbsG}g</div>
                        </div>
                        <div className="bg-white dark:bg-[#141a24] rounded-xl p-2 border border-slate-200 dark:border-white/[0.06]">
                          <div className="text-slate-600 dark:text-zinc-400 text-[9px] uppercase font-mono">Fat</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-zinc-300 mt-0.5 text-xs sm:text-sm">{msg.mealData.fatG}g</div>
                        </div>
                      </div>

                      <p className="text-slate-800 dark:text-zinc-300 italic">{msg.mealData.jasonAdvice}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Deferred Skeleton Loading for Coach Response */}
          {showSkeleton && (
            <CoachMessageSkeleton coachName={userProfile.coachName || 'Coach Jason'} />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="mt-2.5 pt-1">
        {/* Attached image preview */}
        {selectedImage && (
          <div className="mb-2 flex items-center gap-2 rounded-2xl bg-[#11151c] border border-emerald-500/40 p-2 text-xs text-emerald-400">
            <img src={selectedImage} alt="Selected food" className="h-10 w-10 rounded-lg object-cover" />
            <span className="flex-1 truncate">Attached meal photo</span>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-zinc-400 hover:text-white px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Rate limit cooldown indicator */}
        {rateLimitCooldown > 0 && (
          <div className="mb-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>
                <strong>Rate Limit Active:</strong> Next message ready in{' '}
                <span className="font-mono font-bold text-amber-300">{rateLimitCooldown}s</span>
              </span>
            </div>
            {onSaveKeySettings && (
              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                Add your Gemini API Key in Profile Settings to unlock 60 req/min
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          {/* File input for image attach */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#11151c] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-500 dark:hover:text-emerald-400 active:scale-95 transition-all"
            title="Attach Meal / Food Photo"
          >
            <ImageIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onOpenMealScanner}
            className="hidden sm:flex h-12 items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-[#11151c] border border-slate-200 dark:border-white/[0.08] px-3.5 text-xs text-slate-800 dark:text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            title="Open Meal Scanner Modal"
          >
            <Utensils className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>Scan Meal</span>
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask ${userProfile.coachName?.trim() || 'Coach Jason'}...`}
              className="w-full h-11 sm:h-12 bg-white dark:bg-[#080a0e] border border-slate-200 dark:border-white/[0.08] rounded-2xl py-2.5 px-4 sm:px-5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors pr-11 shadow-sm dark:shadow-none"
            />
            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImage) || isLoading}
              className="absolute right-1.5 top-1.5 h-8 w-8 sm:h-9 sm:w-9 squircle-btn bg-emerald-500 text-slate-950 flex items-center justify-center font-bold hover:bg-emerald-400 disabled:opacity-30 active:scale-95 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#11151c] p-6 text-center space-y-4 shadow-2xl"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clear Chat History?</h3>
              <p className="mt-1 text-xs text-zinc-400">
                This will reset your conversation with {userProfile.coachName?.trim() || 'Coach Jason'}. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onClearChatHistory) onClearChatHistory();
                  setShowClearConfirm(false);
                }}
                className="rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/20"
              >
                Yes, Clear Chat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

