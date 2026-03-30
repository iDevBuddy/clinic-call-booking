import { FadeIn } from './Animations'

const steps = [
    { num: '01', title: 'Discover', desc: 'Understand your business, map workflows, identify high-impact AI opportunities, and define measurable goals.', duration: '1 — 2 weeks' },
    { num: '02', title: 'Build', desc: 'Design and develop a focused proof of concept — a working AI agent integrated with your core business system.', duration: '2 — 4 weeks' },
    { num: '03', title: 'Launch', desc: 'Deploy to production with monitoring, logging, and human-in-the-loop workflows to ensure reliability.', duration: '1 — 2 weeks' },
    { num: '04', title: 'Scale', desc: 'Expand adoption across business functions. Optimize performance, add capabilities, roll out to more teams.', duration: 'Ongoing' },
]

export default function Process() {
    return (
        <section id="process" className="section-padding bg-dark">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-accent mb-4">Our Process</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How we build your AI agent</h2>
                        <p className="text-gray-400">A proven four-step process from idea to fully deployed, production-ready AI agent.</p>
                    </div>
                </FadeIn>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {steps.map((step, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <div className="group text-center p-8 rounded-lg border border-border bg-dark-card hover:border-accent/25 hover:-translate-y-1 transition-all duration-300">
                                <div className="font-mono text-4xl font-bold text-border group-hover:text-accent transition-colors mb-4">
                                    {step.num}
                                </div>
                                <h3 className="text-white font-semibold text-[1.05rem] mb-2">{step.title}</h3>
                                <p className="text-gray-400 text-[0.85rem] leading-relaxed">{step.desc}</p>
                                <p className="font-mono text-[0.75rem] font-medium text-accent mt-4">{step.duration}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}
