import { FadeIn } from './Animations'
import { useRef, useEffect, useState } from 'react'

function Counter({ target, suffix = '' }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const started = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true
                    let current = 0
                    const increment = target / 40
                    const timer = setInterval(() => {
                        current += increment
                        if (current >= target) {
                            setCount(target)
                            clearInterval(timer)
                        } else {
                            setCount(Math.floor(current))
                        }
                    }, 30)
                }
            },
            { threshold: 0.3 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [target])

    return <span ref={ref}>{count}{suffix}</span>
}

const stats = [
    { number: 50, suffix: '%', text: 'of business decisions will be augmented or automated by AI Agents by 2027.', source: 'Gartner', url: 'https://www.gartner.com' },
    { number: 86, suffix: '%', text: 'of executives say AI agents will make workflow automation more effective by 2027.', source: 'IBM', url: 'https://www.ibm.com' },
    { number: 66, suffix: '%', text: 'of businesses using AI agents report higher productivity, 57% see cost savings, and 54% improve customer experience.', source: 'PwC', url: 'https://www.pwc.com' },
]

export default function Stats() {
    return (
        <section className="py-20 bg-dark border-y border-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <div className="group text-center p-10 rounded-lg border border-border bg-dark-card hover:border-border-hover hover:-translate-y-1 transition-all duration-300">
                                <div className="font-mono text-5xl font-bold text-accent mb-3">
                                    <Counter target={stat.number} suffix={stat.suffix} />
                                </div>
                                <p className="text-[0.92rem] text-gray-400 leading-relaxed">{stat.text}</p>
                                <p className="font-mono text-[0.72rem] text-gray-600 mt-3">
                                    <a href={stat.url} target="_blank" rel="noopener" className="border-b border-border hover:text-accent transition-colors">
                                        {stat.source}
                                    </a>
                                </p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}
