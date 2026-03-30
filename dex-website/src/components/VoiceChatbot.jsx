import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VoiceChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [chatState, setChatState] = useState('idle') // idle | listening | processing | speaking
    const [subtitle, setSubtitle] = useState('')
    const [showEmailInput, setShowEmailInput] = useState(false)
    const [emailValue, setEmailValue] = useState('')
    const [emailError, setEmailError] = useState('')
    const [error, setError] = useState('')
    const [greeted, setGreeted] = useState(false)

    const recognitionRef = useRef(null)
    const audioRef = useRef(null)
    const hasGreetedRef = useRef(false)
    const finalTranscriptRef = useRef('')
    const messagesRef = useRef([])
    const subtitleTimerRef = useRef(null)

    // Listen for open event from any button on the page
    useEffect(() => {
        const handler = () => setIsOpen(true)
        window.addEventListener('open-dex-chatbot', handler)
        return () => window.removeEventListener('open-dex-chatbot', handler)
    }, [])

    const showError = useCallback((msg) => {
        setError(msg)
        setTimeout(() => setError(''), 4000)
    }, [])

    const showSubtitle = useCallback((text) => {
        setSubtitle(text)
        clearTimeout(subtitleTimerRef.current)
        subtitleTimerRef.current = setTimeout(() => setSubtitle(''), 5000)
    }, [])

    // Browser TTS fallback
    const browserSpeak = (text) =>
        new Promise((resolve) => {
            if (!window.speechSynthesis) return resolve()
            window.speechSynthesis.cancel()
            const u = new SpeechSynthesisUtterance(text)
            u.lang = 'en-US'
            u.rate = 1.0
            const voices = window.speechSynthesis.getVoices()
            const v = voices.find((v) => v.lang.startsWith('en'))
            if (v) u.voice = v
            u.onend = resolve
            u.onerror = resolve
            window.speechSynthesis.speak(u)
        })

    const base64ToBlob = (base64, mimeType) => {
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return new Blob([bytes], { type: mimeType })
    }

    const speakText = useCallback(async (text) => {
        setChatState('speaking')
        showSubtitle(text)
        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })
            const data = await res.json()
            if (data.fallback) {
                await browserSpeak(data.text || text)
            } else {
                const blob = base64ToBlob(data.audio, 'audio/mpeg')
                const url = URL.createObjectURL(blob)
                const audio = new Audio(url)
                audioRef.current = audio
                await new Promise((resolve) => {
                    audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; resolve() }
                    audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; browserSpeak(text).then(resolve) }
                    audio.play().catch(() => { URL.revokeObjectURL(url); audioRef.current = null; browserSpeak(text).then(resolve) })
                })
            }
        } catch {
            await browserSpeak(text)
        }
        setChatState('idle')
    }, [showSubtitle])

    const sendToAI = useCallback(async (msgs) => {
        setChatState('processing')
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: msgs }),
            })
            const data = await res.json()
            const aiText = data.response || "I'm having trouble responding right now. Please try again."
            messagesRef.current = [...msgs, { role: 'assistant', content: aiText }]
            if (
                aiText.toLowerCase().includes('type your email') ||
                aiText.toLowerCase().includes('email address below')
            ) {
                setShowEmailInput(true)
            }
            await speakText(aiText)
        } catch {
            showError('Connection error. Please try again.')
            setChatState('idle')
        }
    }, [speakText, showError])

    // Auto-greet when overlay opens
    useEffect(() => {
        if (isOpen && !hasGreetedRef.current) {
            hasGreetedRef.current = true
            setTimeout(() => {
                sendToAI([]).then(() => setGreeted(true))
            }, 600)
        }
    }, [isOpen, sendToAI])

    const startListening = useCallback(() => {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRec) { showError('Voice not supported. Please use Chrome.'); return }
        const recognition = new SpeechRec()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognitionRef.current = recognition
        finalTranscriptRef.current = ''
        setChatState('listening')

        recognition.onresult = (e) => {
            let text = ''
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) text += e.results[i][0].transcript
            }
            finalTranscriptRef.current = text
        }

        recognition.onend = () => {
            const text = finalTranscriptRef.current.trim()
            finalTranscriptRef.current = ''
            if (text) {
                const updated = [...messagesRef.current, { role: 'user', content: text }]
                messagesRef.current = updated
                sendToAI(updated)
            } else {
                setChatState('idle')
            }
        }

        recognition.onerror = (e) => {
            const errMap = {
                'not-allowed': 'Microphone access denied.',
                'no-speech': 'No speech detected. Try again.',
                'network': 'Network error with microphone.',
            }
            showError(errMap[e.error] || 'Voice error. Try again.')
            setChatState('idle')
        }

        recognition.start()
    }, [sendToAI, showError])

    const handleMicClick = () => {
        if (chatState === 'idle') startListening()
        else if (chatState === 'listening') recognitionRef.current?.stop()
    }

    const handleEmailSubmit = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            setEmailError('Please enter a valid email address.')
            return
        }
        setEmailError('')
        const summary = messagesRef.current
            .map((m) => `${m.role === 'user' ? 'Visitor' : 'DEX'}: ${m.content}`)
            .join('\n')
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientEmail: emailValue, conversationSummary: summary }),
            })
        } catch { /* silent */ }
        setShowEmailInput(false)
        setEmailValue('')
        const thankYou = "Awesome, thank you! Our team will reach out to you very soon. Is there anything else you'd like to know about how AI can help your business?"
        messagesRef.current = [...messagesRef.current, { role: 'assistant', content: thankYou }]
        await speakText(thankYou)
    }

    const handleClose = () => {
        setIsOpen(false)
        recognitionRef.current?.stop()
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
        window.speechSynthesis?.cancel()
        setChatState('idle')
        setSubtitle('')
        setShowEmailInput(false)
        setEmailValue('')
        setGreeted(false)
        clearTimeout(subtitleTimerRef.current)
        // Reset so greeting plays again on reopen
        hasGreetedRef.current = false
        messagesRef.current = []
    }

    const micDisabled = chatState === 'processing' || chatState === 'speaking'

    const statusText =
        chatState === 'listening' ? 'Listening...' :
        chatState === 'processing' ? 'DEX is thinking...' :
        chatState === 'speaking' ? 'DEX is speaking...' :
        greeted ? 'Tap to respond' : 'Tap to start conversation'

    return (
        <>
            {/* ── Floating trigger button ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        key="trigger"
                        onClick={() => setIsOpen(true)}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-4 pl-6 pr-2 py-2 sm:pl-7 sm:pr-2.5 sm:py-2.5 rounded-[20px] border border-white/[0.06] shadow-xl shadow-black/30 backdrop-blur-xl bg-dark-card/95 hover:shadow-accent/15 transition-all duration-300 cursor-pointer"
                        aria-label="Open DEX AI Chatbot"
                    >
                        <div className="text-left select-none">
                            <p className="text-white font-semibold text-[0.85rem] sm:text-[0.95rem] leading-tight tracking-tight">
                                Talk with Our
                            </p>
                            <p className="text-white font-semibold text-[0.85rem] sm:text-[0.95rem] leading-tight tracking-tight">
                                Consultant
                            </p>
                        </div>

                        {/* Orb + voice wave bars stacked */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-dark-deeper flex flex-col items-center justify-center gap-1.5 overflow-hidden">
                            {/* Animated orb */}
                            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full"
                                    style={{ background: 'conic-gradient(from 0deg, #e05132, #ff6b4a, #c9432a, #a0321e, #e05132)' }}
                                />
                                <motion.div
                                    animate={{ rotate: [0, -360], scale: [1, 1.15, 0.95, 1] }}
                                    transition={{ rotate: { duration: 14, repeat: Infinity, ease: 'linear' }, scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
                                    className="absolute inset-0 rounded-full opacity-70"
                                    style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(255,140,80,0.8), transparent 55%), radial-gradient(ellipse at 75% 25%, rgba(200,60,30,0.6), transparent 50%)' }}
                                />
                                <motion.div
                                    animate={{ scale: [0.85, 1.1, 0.9, 1.05, 0.85], x: [-2, 3, -1, 2, -2], y: [1, -3, 2, -1, 1] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute inset-0 rounded-full opacity-60"
                                    style={{ background: 'radial-gradient(circle at 55% 40%, rgba(255,200,160,0.7), transparent 40%), radial-gradient(circle at 30% 65%, rgba(255,100,50,0.5), transparent 35%)' }}
                                />
                                <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.25), transparent 40%)' }} />
                            </div>

                            {/* Small voice wave bars */}
                            <div className="flex items-end gap-[3px]" style={{ height: '10px' }}>
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="w-[3px] rounded-full trigger-wave-bar"
                                        style={{ backgroundColor: '#e05132', animationDelay: `${i * 0.2}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Full-screen voice overlay ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
                        style={{
                            background: 'radial-gradient(ellipse at 50% 45%, rgba(229,93,62,0.06) 0%, rgba(0,0,0,0) 60%), rgba(0,0,0,0.95)',
                        }}
                    >
                        {/* Top label */}
                        <p className="absolute top-7 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] tracking-[3px] uppercase text-gray-600 select-none">
                            DEX AI Consultant
                        </p>

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-5 right-6 w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-white hover:bg-white/[0.08] transition-all"
                            aria-label="Close"
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Center: mic + status */}
                        <div className="flex flex-col items-center gap-10">

                            {/* Mic button with pulse rings */}
                            <div className="relative flex items-center justify-center">
                                {/* Listening pulse rings */}
                                {chatState === 'listening' && [0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="listening-ring absolute"
                                        style={{ width: '80px', height: '80px', animationDelay: `${i * 0.5}s` }}
                                    />
                                ))}

                                {/* Speaking glow */}
                                {chatState === 'speaking' && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
                                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute rounded-full"
                                        style={{
                                            width: '120px', height: '120px',
                                            background: 'rgba(229,93,62,0.18)',
                                            filter: 'blur(10px)',
                                        }}
                                    />
                                )}

                                <button
                                    onClick={handleMicClick}
                                    disabled={micDisabled}
                                    aria-label={chatState === 'listening' ? 'Stop' : 'Speak'}
                                    className="relative z-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundColor: chatState === 'listening' ? '#ef4444' : '#e55d3e',
                                        transform: chatState === 'listening' ? 'scale(1.08)' : 'scale(1)',
                                        boxShadow: chatState === 'listening'
                                            ? '0 0 0 14px rgba(239,68,68,0.1), 0 8px 36px rgba(239,68,68,0.35)'
                                            : '0 0 0 10px rgba(229,93,62,0.1), 0 8px 36px rgba(229,93,62,0.4)',
                                        opacity: micDisabled ? 0.45 : 1,
                                    }}
                                >
                                    {chatState === 'listening' ? (
                                        <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                        </svg>
                                    ) : (
                                        <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                            <rect x="9" y="2" width="6" height="12" rx="3" />
                                            <path d="M5 10a7 7 0 0014 0" />
                                            <path d="M12 19v3M8 22h8" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Status text + animations */}
                            <div className="flex flex-col items-center gap-4 min-h-[56px]">
                                {chatState === 'processing' && (
                                    <div className="flex items-center gap-2">
                                        {[0, 1, 2].map((i) => (
                                            <span
                                                key={i}
                                                className="w-2 h-2 rounded-full bounce-dot"
                                                style={{ backgroundColor: '#e55d3e', animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </div>
                                )}
                                {chatState === 'speaking' && (
                                    <div className="flex items-end gap-1.5" style={{ height: '28px' }}>
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <span
                                                key={i}
                                                className="w-1.5 rounded-full equalizer-bar"
                                                style={{ backgroundColor: '#e55d3e', animationDelay: `${i * 0.1}s` }}
                                            />
                                        ))}
                                    </div>
                                )}
                                <p className="text-gray-400 text-sm tracking-wide">{statusText}</p>
                                {error && <p className="text-red-400 text-xs">{error}</p>}
                            </div>

                            {/* Subtitle — last AI message, fades after 5s */}
                            <div className="min-h-[40px] flex items-center justify-center px-8 max-w-sm">
                                <AnimatePresence>
                                    {subtitle && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 0.55, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.35 }}
                                            className="text-gray-300 text-sm text-center leading-relaxed line-clamp-2"
                                        >
                                            {subtitle}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Email input — slides up from bottom center */}
                        <AnimatePresence>
                            {showEmailInput && (
                                <motion.div
                                    initial={{ opacity: 0, y: 32 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 32 }}
                                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[360px] px-6"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="email"
                                                value={emailValue}
                                                onChange={(e) => { setEmailValue(e.target.value); setEmailError('') }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                                                placeholder="Enter your email"
                                                autoFocus
                                                className="w-full text-white text-sm px-5 py-3 outline-none placeholder-gray-600 rounded-full"
                                                style={{
                                                    background: '#1a1a1a',
                                                    border: emailError ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.15)',
                                                }}
                                            />
                                            {emailError && (
                                                <p className="text-red-400 text-xs mt-1.5 pl-4">{emailError}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleEmailSubmit}
                                            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center"
                                            style={{ background: '#e55d3e' }}
                                            aria-label="Submit email"
                                        >
                                            <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path d="M22 2L11 13" />
                                                <path d="M22 2L15 22l-4-9-9-4 20-7z" />
                                            </svg>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
