import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'

export async function GET(req: Request) {
  const token = (await cookies()).get('sessionToken')?.value
  const { searchParams } = new URL(req.url)
  const topicId = searchParams.get('topicId')
  const res = await fetch(`${API}/stories?topicId=${topicId}`, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
