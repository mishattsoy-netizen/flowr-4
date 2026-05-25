import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('beta_invite_token')?.value
  return NextResponse.json({ hasInvite: !!token })
}
