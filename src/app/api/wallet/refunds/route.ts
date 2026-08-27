import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'

const schema = z.object({ amount_paise: z.number().int().min(100), reason: z.string().trim().min(5).max(500) })

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid amount and a reason of at least five characters.' }, { status: 400 })
    const { supabase } = await requireUser()
    const { data, error } = await supabase.rpc('request_wallet_refund', parsed.data)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ refund: data }, { status: 201 })
  } catch (error) { return apiErrorResponse(error) }
}
