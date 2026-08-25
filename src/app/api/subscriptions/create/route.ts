import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'
import { isSupabaseConfigured } from '../../../../lib/supabase/config'

const requestSchema = z.object({
  plan: z.enum(['basic', 'standard', 'family']),
  mealsPerWeek: z.number().int().min(1).max(7),
  startDate: z.string().date().optional(),
  apartmentId: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  daysSelected: z.array(z.string()).min(1).max(7).optional(),
  bundles: z.object({
    basic: z.number().int().min(0).max(20),
    standard: z.number().int().min(0).max(20),
    family: z.number().int().min(0).max(20),
  }),
})

const weekdayNumber: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid subscription details', details: parsed.error.flatten() }, { status: 400 })
    }
    const { plan, mealsPerWeek, startDate, apartmentId, quantity, daysSelected, bundles } = parsed.data
    const selectedDays = daysSelected || []
    const weekdays = selectedDays.map((day) => weekdayNumber[day]).filter((day) => day !== undefined)
    if (weekdays.length !== selectedDays.length || weekdays.length !== mealsPerWeek) {
      return NextResponse.json({ error: 'Invalid delivery days' }, { status: 400 })
    }

    const calculatedQuantity = bundles.basic * 10 + bundles.standard * 20 + bundles.family * 32
    if (!calculatedQuantity || calculatedQuantity !== quantity) {
      return NextResponse.json({ error: 'Bundle quantity does not match the selected combination' }, { status: 400 })
    }

    const { supabase } = await requireUser()
    const { data: subscriptionId, error } = await supabase.rpc('create_subscription', {
      p_apartment_id: apartmentId || null,
      p_start_date: startDate || new Date().toISOString().split('T')[0],
      p_bundle_units: bundles,
      p_weekdays: weekdays,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      subscription: {
        id: subscriptionId,
        plan,
        quantity: calculatedQuantity,
        days_selected: selectedDays,
        start_date: startDate || new Date().toISOString().split('T')[0],
        status: 'pending_payment',
      },
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
