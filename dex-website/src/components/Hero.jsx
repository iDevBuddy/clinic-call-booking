import { motion } from 'framer-motion'

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center bg-dark-deeper overflow-hidden">
            {/* Grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                }}
            />
            {/* Glow */}
            <div className="absolute -top-1/3 -right-1/4 w-[700px] h-[700px] bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-xl"
                >
                    <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-accent mb-6">
                        AI Agent Development Services
                    </p>
                    <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                        Build agents and copilots{' '}
                        <span className="text-accent">that move the needle</span>
                    </h1>
                    <p className="text-[1.05rem] text-gray-400 leading-relaxed mb-10">
                        We design, build, and deploy intelligent AI agents that automate customer calls,
                        schedule appointments, handle support, and streamline operations — so your team
                        can focus on what matters most.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))}
                            className="px-7 py-3.5 bg-accent text-white font-semibold text-[0.9rem] rounded-md hover:bg-accent-hover transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20"
                        >
                            Try Live Demo
                        </button>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))}
                            className="px-7 py-3.5 border border-border text-gray-300 font-semibold text-[0.9rem] rounded-md hover:border-gray-500 hover:bg-white/[0.02] transition-all"
                        >
                            Book a Consultation
                        </button>
                    </div>
                </motion.div>

                {/* Visual — animated rings */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="hidden lg:flex justify-center items-center"
                >
                    <div className="relative w-[400px] h-[400px] flex items-center justify-center">
                        {/* Outer ring */}
                        <motion.div
                            animate={{ scale: [1, 1.03, 1], opacity: [1, 0.4, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute w-full h-full rounded-full border border-border"
                        />
                        {/* Middle ring */}
                        <motion.div
                            animate={{ scale: [1, 1.04, 1], opacity: [1, 0.3, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                            className="absolute w-3/4 h-3/4 rounded-full border border-accent/10"
                        />
                        {/* Inner ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-1/2 h-1/2 rounded-full border border-border/50"
                            style={{ borderTopColor: 'rgba(224,81,50,0.2)' }}
                        />
                        {/* Center */}
                        <div className="w-40 h-40 rounded-full bg-dark-card border border-border flex items-center justify-center">
                            <div className="text-center">
                                <p className="font-mono text-accent text-sm font-semibold tracking-[3px]">AGENTIC</p>
                                <p className="font-mono text-gray-500 text-[0.7rem] tracking-[2px] mt-1">AI</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
