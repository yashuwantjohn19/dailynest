import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '../../../lib/auth'
import { apiErrorResponse } from '../../../lib/api/errors'

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser()
    const month = request.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
    if (!/^\d{4}-\d{2}$/.test(month)) return NextResponse.json({ error: 'Invalid month.' }, { status: 400 })
    const start = `${month}-01`
    const endDate = new Date(`${start}T00:00:00Z`)
    endDate.setUTCMonth(endDate.getUTCMonth() + 1)
    const end = endDate.toISOString().slice(0, 10)
    const { data, error } = await supabase.from('deliveries').select('id,delivery_date,quantity,status,amount_paise').eq('user_id', user.id).gte('delivery_date', start).lt('delivery_date', end).order('delivery_date')
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ deliveries: data || [] })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
