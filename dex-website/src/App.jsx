import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import AgentTypes from './components/AgentTypes'
import Services from './components/Services'
import Industries from './components/Industries'
import Demo from './components/Demo'
import Process from './components/Process'
import CTA from './components/CTA'
import Footer from './components/Footer'
import VoiceChatbot from './components/VoiceChatbot'

export default function App() {
    return (
        <div className="min-h-screen bg-dark font-sans">
            <Navbar />
            <Hero />
            <Stats />
            <AgentTypes />
            <Services />
            <Industries />
            <Demo />
            <Process />
            <CTA />
            <Footer />
            <VoiceChatbot />
        </div>
    )
}
