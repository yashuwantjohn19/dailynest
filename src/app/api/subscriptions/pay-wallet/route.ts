import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'

const schema = z.object({ subscriptionId: z.string().uuid() })

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'A valid subscription is required.' }, { status: 400 })
    const { supabase } = await requireUser()
    const { data, error } = await supabase.rpc('pay_subscription_from_wallet', {
      p_subscription_id: parsed.data.subscriptionId,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ subscription: data })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
