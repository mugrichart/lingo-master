'use client'
import { useEffect } from 'react'

export default function KeepServerUp() {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!url) return

    // ping every 60s (3s is way too frequent)
    const id = setInterval(() => {
      fetch(url, { method: 'GET', keepalive: true }).catch(() => {})
    }, 300_000)

    return () => clearInterval(id)
  }, [])

  return null
}