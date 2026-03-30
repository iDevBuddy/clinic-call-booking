import { FadeIn } from './Animations'

export default function CTA() {
    return (
        <section id="contact" className="section-padding bg-dark-deeper border-t border-border">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <FadeIn>
                    <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-accent mb-4">Get Started</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to put AI agents to work?</h2>
                    <p className="text-gray-400 max-w-lg mx-auto mb-10">
                        Our experts help you identify where agentic AI can add the most value — no matter where you are in your AI journey.
                    </p>
                    <a
                        href="mailto:iakifsaeed@gmail.com"
                        className="inline-flex px-8 py-4 bg-accent text-white font-semibold text-[0.95rem] rounded-md hover:bg-accent-hover transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20"
                    >
                        Book a Free Consultation
                    </a>
                </FadeIn>
            </div>
        </section>
    )
}
