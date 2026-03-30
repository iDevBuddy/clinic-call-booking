import { FadeIn } from './Animations'
import { useRetellDemo } from '../hooks/useRetellDemo'

export default function Demo() {
    const { status, startCall, stopCall } = useRetellDemo()

    const handleClick = () => {
        if (status === 'connected') {
            stopCall()
        } else {
            startCall()
        }
    }

    const buttonText = {
        idle: 'Talk to Our AI Agent',
        connecting: 'Connecting...',
        connected: 'End Conversation',
        error: 'Try Again',
    }

    return (
        <section id="demo" className="section-padding bg-accent">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <FadeIn>
                    <p className="font-mono text-xs font-medium tracking-[2px] uppercase text-white/50 mb-4">Live Demo</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Experience it yourself</h2>
                    <p className="text-white/70 max-w-xl mx-auto mb-10 text-[1rem] leading-relaxed">
                        Talk to Maya — our AI clinic receptionist. She handles appointments, recommends
                        doctors, checks availability, and sends WhatsApp and email confirmations.
                        All in a natural voice conversation.
                    </p>
                    <button
                        onClick={handleClick}
                        disabled={status === 'connecting'}
                        className={`inline-flex items-center gap-3 px-10 py-4 rounded-md text-[1rem] font-semibold transition-all hover:-translate-y-0.5 ${status === 'connected'
                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                : 'bg-dark text-white hover:shadow-xl hover:shadow-black/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {status === 'connected' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                        {buttonText[status]}
                    </button>
                    <p className="font-mono text-[0.75rem] text-white/35 mt-5">
                        This is a live demo of our clinic booking agent. No sign-up required.
                    </p>
                </FadeIn>
            </div>
        </section>
    )
}
