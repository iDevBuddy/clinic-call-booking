export default function Footer() {
    return (
        <footer className="pt-14 pb-8 bg-dark-deeper border-t border-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div>
                        <a className="font-mono text-lg font-semibold text-gray-400 tracking-tight mb-4 block">
                            DEX <span className="text-accent">by Akif Saeed</span>
                        </a>
                        <p className="text-gray-600 text-[0.85rem] leading-relaxed max-w-[260px]">
                            We build intelligent AI agents that automate operations, handle customer interactions, and drive results — 24/7.
                        </p>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-mono text-[0.78rem] text-gray-400 uppercase tracking-[2px] mb-5">Services</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#agents" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">Voice Agents</a>
                            <a href="#agents" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">Chat Agents</a>
                            <a href="#services" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">Workflow Automation</a>
                            <a href="#services" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">AI Consulting</a>
                        </div>
                    </div>

                    {/* Industries */}
                    <div>
                        <h4 className="font-mono text-[0.78rem] text-gray-400 uppercase tracking-[2px] mb-5">Industries</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#industries" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">Medical Clinics</a>
                            <a href="#industries" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">Law Firms</a>
                            <a href="#industries" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">Real Estate</a>
                            <a href="#industries" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">E-commerce</a>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-mono text-[0.78rem] text-gray-400 uppercase tracking-[2px] mb-5">Company</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#demo" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">Live Demo</a>
                            <a href="#process" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">Our Process</a>
                            <a href="#contact" className="text-[0.85rem] text-gray-600 hover:text-accent transition-colors">Contact Us</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="font-mono text-[0.72rem] text-gray-600">&copy; 2026 DEX by Akif Saeed. All rights reserved.</p>
                    <p className="font-mono text-[0.72rem] text-gray-600">AI Automation Agency</p>
                </div>
            </div>
        </footer>
    )
}
