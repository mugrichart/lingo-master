import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = (await cookies()).get('sessionToken')?.value
  const res = await fetch(`${API}/characters/${id}`, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = (await cookies()).get('sessionToken')?.value
  const res = await fetch(`${API}/characters/${id}`, {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
