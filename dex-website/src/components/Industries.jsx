import { useState } from 'react'
import { FadeIn } from './Animations'
import { motion } from 'framer-motion'

const industries = [
    {
        id: 'clinics',
        label: 'Medical Clinics',
        title: 'Medical and Dental Clinics',
        desc: 'Reduce front-desk workload, eliminate missed calls, and provide patients with a seamless booking experience — 24 hours a day, 7 days a week.',
        items: [
            'AI receptionist handling appointment calls with natural conversation',
            'Smart scheduling with doctor availability and appointment limits',
            'Automatic WhatsApp and email confirmations to patients',
            'Patient record management through Airtable or CRM integration',
            'After-hours support and emergency triage routing',
        ],
    },
    {
        id: 'law',
        label: 'Law Firms',
        title: 'Law Firms',
        desc: 'Streamline client intake, automate scheduling, and handle consultations without adding staff — freeing attorneys to focus on case work.',
        items: [
            'Automated client intake and initial consultation screening',
            'Appointment scheduling with attorney calendar integration',
            'Document collection and case information gathering',
            'Follow-up reminders and case status updates',
            'After-hours lead capture and emergency routing',
        ],
    },
    {
        id: 'realestate',
        label: 'Real Estate',
        title: 'Real Estate Agencies',
        desc: 'Qualify leads instantly, schedule viewings, and maintain 24/7 availability for buyers and sellers without missing an opportunity.',
        items: [
            'Lead qualification through intelligent conversation',
            'Property viewing scheduling with agent calendar sync',
            'Property information and availability inquiries',
            'Follow-up sequences and nurture campaigns',
            'CRM integration for seamless lead tracking',
        ],
    },
    {
        id: 'restaurants',
        label: 'Restaurants',
        title: 'Restaurants and Hotels',
        desc: 'Handle reservations, answer inquiries, and manage guest communications automatically — delivering a premium experience at scale.',
        items: [
            'Table reservation and booking management',
            'Menu inquiries and dietary requirement handling',
            'Hotel room booking and availability checks',
            'Guest support and concierge services',
            'Review collection and feedback management',
        ],
    },
    {
        id: 'ecommerce',
        label: 'E-commerce',
        title: 'E-commerce',
        desc: 'Provide instant support, automate orders, and deliver personalized shopping experiences that increase conversion and reduce churn.',
        items: [
            'Order tracking and status updates via WhatsApp',
            'Product recommendations and upselling',
            'Returns and refund processing automation',
            'Customer support ticket handling',
            'Abandoned cart recovery and re-engagement',
        ],
    },
    {
        id: 'services',
        label: 'Professional Services',
        title: 'Professional Services',
        desc: 'Automate scheduling, client communication, and admin — enabling service professionals to focus on delivering value.',
        items: [
            'Appointment booking and calendar management',
            'Client intake forms and onboarding automation',
            'Invoice reminders and payment follow-ups',
            'Service inquiry handling and quote generation',
            'Multi-channel communication management',
        ],
    },
]

export default function Industries() {
    const [active, setActive] = useState(0)

    return (
        <section id="industries" className="section-padding bg-dark-deeper">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn>
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-accent mb-4">Industries</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">AI agent use cases across industries</h2>
                        <p className="text-gray-400">Our agents serve businesses across multiple industries, automating critical workflows and delivering measurable outcomes.</p>
                    </div>
                </FadeIn>

                <FadeIn>
                    <div className="flex flex-wrap gap-2 justify-center mb-10">
                        {industries.map((ind, i) => (
                            <button
                                key={ind.id}
                                onClick={() => setActive(i)}
                                className={`font-mono text-[0.78rem] font-medium px-5 py-2.5 rounded-md border transition-all ${active === i
                                        ? 'bg-accent border-accent text-white'
                                        : 'border-border text-gray-500 hover:border-border-hover hover:text-gray-300'
                                    }`}
                            >
                                {ind.label}
                            </button>
                        ))}
                    </div>
                </FadeIn>

                <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="p-8 sm:p-10 rounded-lg bg-dark-card border border-border">
                        <h3 className="text-xl font-bold text-white mb-3">{industries[active].title}</h3>
                        <p className="text-gray-400 mb-5 text-[0.95rem]">{industries[active].desc}</p>
                        <ul className="flex flex-col gap-2.5">
                            {industries[active].items.map((item, i) => (
                                <li key={i} className="text-gray-400 text-[0.88rem] pl-5 relative">
                                    <span className="absolute left-0 text-accent font-mono font-bold">&gt;</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
