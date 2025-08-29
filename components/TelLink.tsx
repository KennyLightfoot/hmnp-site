"use client"

import { getBusinessPhoneFormatted, getBusinessTel } from '@/lib/phone'
import { track } from '@/app/lib/analytics'
import React from 'react'

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode
  location?: string
}

export default function TelLink({ children, className = '', location, ...rest }: Props) {
  const tel = getBusinessTel()
  const label = children || getBusinessPhoneFormatted()
  return (
    <a
      href={`tel:${tel}`}
      className={className}
      onClick={(e) => {
        try { track('call_click', { location: location || 'tel_link', phone: getBusinessPhoneFormatted() }) } catch {}
        rest.onClick?.(e as any)
      }}
      {...rest}
    >
      {label}
    </a>
  )
}







