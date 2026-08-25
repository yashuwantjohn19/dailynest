import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'
import { isSupabaseConfigured } from '../../../../lib/supabase/config'

const requestSchema = z.object({ subscriptionId: z.string().uuid() })

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
    }

    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'A valid subscription ID is required' }, { status: 400 })
    }

    const { supabase } = await requireUser()
    const { data, error } = await supabase.rpc('update_subscription_status', {
      p_subscription_id: parsed.data.subscriptionId,
      p_status: 'cancelled',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ subscription: data })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
