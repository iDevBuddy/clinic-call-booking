import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    const openChatbot = () => window.dispatchEvent(new CustomEvent('open-dex-chatbot'))

    const links = [
        { label: 'Agents', href: '#agents' },
        { label: 'Services', href: '#services' },
        { label: 'Industries', href: '#industries' },
        { label: 'Process', href: '#process' },
    ]

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-dark-deeper/92 backdrop-blur-xl border-b border-border py-3.5'
                    : 'py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <a href="#" className="font-mono text-lg font-semibold text-gray-400 tracking-tight">
                    DEX <span className="text-accent">by Akif Saeed</span>
                </a>

                {/* Desktop */}
                <div className="hidden lg:flex items-center gap-8">
                    {links.map(l => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="text-[0.85rem] font-medium text-gray-500 hover:text-gray-200 transition-colors"
                        >
                            {l.label}
                        </a>
                    ))}
                    <button
                        onClick={openChatbot}
                        className="text-[0.85rem] font-medium text-gray-500 hover:text-gray-200 transition-colors"
                    >
                        Live Demo
                    </button>
                    <a
                        href="#contact"
                        className="ml-2 px-5 py-2.5 bg-accent text-white text-[0.82rem] font-semibold rounded-md hover:bg-accent-hover transition-all hover:-translate-y-0.5"
                    >
                        Get Started
                    </a>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden text-gray-300 text-2xl"
                    aria-label="Menu"
                >
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:hidden absolute top-full left-0 right-0 bg-dark-deeper/98 backdrop-blur-xl border-b border-border p-6 flex flex-col gap-4"
                >
                    {links.map(l => (
                        <a
                            key={l.href}
                            href={l.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {l.label}
                        </a>
                    ))}
                    <button
                        onClick={() => { openChatbot(); setMobileOpen(false) }}
                        className="text-sm text-gray-400 hover:text-white transition-colors text-left"
                    >
                        Live Demo
                    </button>
                    <a
                        href="#contact"
                        onClick={() => setMobileOpen(false)}
                        className="mt-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-md text-center"
                    >
                        Get Started
                    </a>
                </motion.div>
            )}
        </motion.nav>
    )
}
