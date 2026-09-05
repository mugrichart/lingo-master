import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'

export async function POST(req: Request) {
  const token = (await cookies()).get('sessionToken')?.value
  const body = await req.json()
  const res = await fetch(`${API}/stories/start`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
