'use client'

import dynamic from 'next/dynamic'

const AIChatWidget = dynamic(() => import('@/components/ai/AIChatWidget'), {
  ssr: false,
  loading: () => null,
})

export default function ChatWidgetWrapper() {
  return (
    <AIChatWidget
      enableProactive={true}
      enableVoice={true}
      proactiveDelay={30000}
    />
  )
}
