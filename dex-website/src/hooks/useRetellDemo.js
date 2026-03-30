import { useState, useRef, useCallback } from 'react'

const API_URL = 'https://test-black-ten-98.vercel.app'
const AGENT_ID = 'agent_c2a16349cb70a05a2bb208981a'

export function useRetellDemo() {
    const [status, setStatus] = useState('idle') // idle | connecting | connected | error
    const clientRef = useRef(null)

    const startCall = useCallback(async () => {
        setStatus('connecting')

        try {
            // 1. Create web call via our backend
            const res = await fetch(`${API_URL}/retell/create-web-call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent_id: AGENT_ID }),
            })

            if (!res.ok) throw new Error('Failed to create web call')
            const data = await res.json()

            if (!data.access_token) throw new Error('No access token received')

            // 2. Import Retell SDK dynamically
            const { RetellWebClient } = await import('retell-client-js-sdk')
            const client = new RetellWebClient()
            clientRef.current = client

            client.on('call_started', () => setStatus('connected'))
            client.on('call_ended', () => {
                setStatus('idle')
                clientRef.current = null
            })
            client.on('error', (err) => {
                console.error('Retell error:', err)
                setStatus('error')
                clientRef.current = null
            })

            // 3. Start the call
            await client.startCall({ accessToken: data.access_token })
        } catch (err) {
            console.error('Demo error:', err)
            setStatus('error')
            setTimeout(() => setStatus('idle'), 3000)
        }
    }, [])

    const stopCall = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.stopCall()
            clientRef.current = null
        }
        setStatus('idle')
    }, [])

    return { status, startCall, stopCall }
}
