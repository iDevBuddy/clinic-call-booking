import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function FadeIn({ children, className = '', delay = 0 }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function SlideIn({ children, className = '', direction = 'left', delay = 0 }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })
    const x = direction === 'left' ? -40 : 40

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function ScaleIn({ children, className = '', delay = 0 }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
