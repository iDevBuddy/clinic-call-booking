import { motion } from 'framer-motion'
import { useRetellDemo } from '../hooks/useRetellDemo'

export default function FloatingDemo() {
    const { status, startCall, stopCall } = useRetellDemo()

    const handleClick = () => {
        if (status === 'connected') {
            stopCall()
        } else if (status !== 'connecting') {
            startCall()
        }
    }

    const isActive = status === 'connected'

    return (
        <motion.button
            onClick={handleClick}
            disabled={status === 'connecting'}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-4
        pl-6 pr-2 py-2 sm:pl-7 sm:pr-2.5 sm:py-2.5
        rounded-[20px]
        border border-white/[0.06]
        shadow-xl shadow-black/30
        backdrop-blur-xl
        cursor-pointer
        transition-all duration-300
        disabled:opacity-60 disabled:cursor-not-allowed
        group
        ${isActive
                    ? 'bg-dark-card/95 hover:shadow-red-600/15'
                    : 'bg-dark-card/95 hover:shadow-accent/15'
                }
      `}
            aria-label="Try AI Agent Live Demo"
        >
            {/* Left: Text */}
            <div className="text-left select-none">
                <p className="text-white font-semibold text-[0.85rem] sm:text-[0.95rem] leading-tight tracking-tight">
                    {isActive ? 'End' : 'Try Our Live'}
                </p>
                <p className="text-white font-semibold text-[0.85rem] sm:text-[0.95rem] leading-tight tracking-tight">
                    {isActive ? 'Conversation' : 'Demo'}
                </p>
            </div>

            {/* Right: Orb Icon Box */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-dark-deeper flex items-center justify-center overflow-hidden">
                {/* Animated AI Orb */}
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden">

                    {/* Layer 1: Deep base gradient — slow rotation */}
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'conic-gradient(from 0deg, #e05132, #ff6b4a, #c9432a, #a0321e, #e05132)',
                        }}
                    />

                    {/* Layer 2: Warm nebula swirl — counter-rotate */}
                    <motion.div
                        animate={{ rotate: [0, -360], scale: [1, 1.15, 0.95, 1] }}
                        transition={{
                            rotate: { duration: 14, repeat: Infinity, ease: 'linear' },
                            scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                        }}
                        className="absolute inset-0 rounded-full opacity-70"
                        style={{
                            background: 'radial-gradient(ellipse at 30% 70%, rgba(255,140,80,0.8), transparent 55%), radial-gradient(ellipse at 75% 25%, rgba(200,60,30,0.6), transparent 50%)',
                        }}
                    />

                    {/* Layer 3: AI plasma blobs — organic breathing */}
                    <motion.div
                        animate={{
                            scale: [0.85, 1.1, 0.9, 1.05, 0.85],
                            x: [-2, 3, -1, 2, -2],
                            y: [1, -3, 2, -1, 1],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full opacity-60"
                        style={{
                            background: 'radial-gradient(circle at 55% 40%, rgba(255,200,160,0.7), transparent 40%), radial-gradient(circle at 30% 65%, rgba(255,100,50,0.5), transparent 35%)',
                        }}
                    />

                    {/* Layer 4: Neural spark — fast moving highlight */}
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        }}
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'conic-gradient(from 180deg, transparent 0%, rgba(255,220,180,0.5) 10%, transparent 20%)',
                        }}
                    />

                    {/* Layer 5: Hot center glow — breathing */}
                    <motion.div
                        animate={{
                            opacity: [0.5, 0.9, 0.5],
                            scale: [0.7, 1, 0.7],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-[20%] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,180,130,0.9), rgba(224,81,50,0.4) 60%, transparent 100%)',
                            filter: 'blur(2px)',
                        }}
                    />

                    {/* Layer 6: Glass sheen — fixed highlight */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.25), transparent 40%)',
                        }}
                    />

                    {/* Layer 7: Outer ring shimmer */}
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full opacity-30"
                        style={{
                            background: 'conic-gradient(from 90deg, transparent, rgba(255,160,100,0.4) 25%, transparent 50%, rgba(255,100,50,0.3) 75%, transparent)',
                        }}
                    />
                </div>

                {/* Pulse ring when active */}
                {isActive && (
                    <motion.div
                        animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-accent/40"
                    />
                )}
            </div>

            {/* Connecting spinner overlay */}
            {status === 'connecting' && (
                <div className="absolute inset-0 rounded-[20px] bg-dark-card/80 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full"
                    />
                </div>
            )}
        </motion.button>
    )
}
