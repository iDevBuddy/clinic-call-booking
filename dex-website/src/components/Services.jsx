import { useState } from 'react'
import { FadeIn } from './Animations'
import { motion, AnimatePresence } from 'framer-motion'

const services = [
    {
        title: 'Custom AI Agent Development',
        desc: 'We build AI agents from the ground up, tailored to your business. Whether it\'s a voice receptionist, a WhatsApp support bot, or a multi-agent system — we design, develop, test, and deploy agents that integrate seamlessly with your workflows.',
    },
    {
        title: 'Voice and Call Automation',
        desc: 'Replace your phone system with intelligent voice AI that handles calls 24/7. Our voice agents book appointments, answer FAQs, route calls, and send automatic confirmations via WhatsApp and email — with natural, human-like conversation.',
    },
    {
        title: 'WhatsApp and Chat Automation',
        desc: 'Engage customers on the platforms they already use. We build intelligent chatbots for WhatsApp, web chat, and social media that handle support, qualify leads, process orders, and respond instantly around the clock.',
    },
    {
        title: 'Workflow and CRM Integration',
        desc: 'Connect your AI agents with your tools — Airtable, Google Sheets, HubSpot, Salesforce, Notion, and more. We automate data flows, eliminate manual entry, and keep your business data synchronized across all systems.',
    },
    {
        title: 'AI Consulting and Strategy',
        desc: 'Not sure where to start? We identify the highest-impact opportunities for AI automation in your business. From use-case discovery to ROI modeling, we build a roadmap that turns AI investments into measurable results.',
    },
]

export default function Services() {
    const [active, setActive] = useState(0)

    return (
        <section id="services" className="section-padding bg-dark">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-accent mb-4">Our Services</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">End-to-end AI agent services</h2>
                        <p className="text-gray-400">From initial discovery to full-scale deployment — comprehensive AI agent development that delivers measurable business impact.</p>
                    </div>
                </FadeIn>

                <div className="max-w-3xl mx-auto flex flex-col gap-3">
                    {services.map((s, i) => (
                        <FadeIn key={i} delay={i * 0.06}>
                            <div
                                onClick={() => setActive(active === i ? -1 : i)}
                                className={`p-6 rounded-lg border cursor-pointer transition-all duration-300 ${active === i
                                        ? 'border-accent bg-dark-card'
                                        : 'border-border bg-dark-card hover:border-border-hover'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-semibold text-[1.05rem]">{s.title}</h3>
                                    <span className={`font-mono w-7 h-7 flex items-center justify-center rounded text-sm transition-all border ${active === i
                                            ? 'bg-accent text-white border-accent'
                                            : 'text-gray-600 border-border'
                                        }`}>
                                        {active === i ? '−' : '+'}
                                    </span>
                                </div>
                                <AnimatePresence>
                                    {active === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-gray-400 text-[0.92rem] leading-relaxed pt-4">{s.desc}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}
