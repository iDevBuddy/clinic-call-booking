import { FadeIn } from './Animations'

const agents = [
    {
        title: 'Voice and Call Agents',
        desc: 'Handle inbound and outbound calls with human-like conversation. Book appointments, answer questions, qualify leads, and provide 24/7 phone support.',
        apps: 'Clinic receptionist, lead qualification, appointment scheduling, customer support hotlines.',
    },
    {
        title: 'Conversational and Chat Agents',
        desc: 'Deliver natural communication through WhatsApp, website chat, and messaging platforms. Automate support, onboarding, and engagement across all channels.',
        apps: 'WhatsApp bots, website live chat, FAQ automation, order status updates.',
    },
    {
        title: 'Workflow Automation Agents',
        desc: 'Automate repetitive tasks across your business operations. From CRM updates to invoice processing, these agents eliminate manual work.',
        apps: 'CRM data entry, invoice validation, employee onboarding, scheduling coordination.',
    },
    {
        title: 'Decision Intelligence Agents',
        desc: 'Analyze real-time and historical data to forecast outcomes and recommend next steps. Enable data-driven decisions that improve efficiency.',
        apps: 'Sales forecasting, churn prediction, demand planning, risk assessment.',
    },
    {
        title: 'Multi-Agent Systems',
        desc: 'Coordinate multiple specialized agents to manage complex, cross-functional operations. A unified intelligence layer across your business.',
        apps: 'Supply chain coordination, customer lifecycle, cross-department automation.',
    },
    {
        title: 'Custom AI Solutions',
        desc: 'Every business is unique. We design custom AI agents tailored to your workflows, integrations, and objectives — from concept to production.',
        apps: 'Industry-specific bots, proprietary workflows, API integrations, enterprise systems.',
    },
]

export default function AgentTypes() {
    return (
        <section id="agents" className="section-padding bg-dark-deeper">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-accent mb-4">What We Build</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Types of AI agents we build</h2>
                        <p className="text-gray-400">From conversational voice agents to complex multi-agent orchestration — intelligent solutions tailored to your needs.</p>
                    </div>
                </FadeIn>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {agents.map((agent, i) => (
                        <FadeIn key={i} delay={i * 0.07}>
                            <div className="group h-full p-8 rounded-lg bg-dark-card border border-border hover:border-accent/25 hover:-translate-y-1 transition-all duration-300">
                                <h3 className="text-white font-semibold text-[1.05rem] mb-3">{agent.title}</h3>
                                <p className="text-gray-400 text-[0.88rem] leading-relaxed mb-4">{agent.desc}</p>
                                <p className="font-mono text-[0.75rem] text-gray-600 leading-relaxed">
                                    <span className="text-gray-500 font-medium">Applications: </span>
                                    {agent.apps}
                                </p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}
