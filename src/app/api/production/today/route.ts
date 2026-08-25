import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'
import { isSupabaseConfigured } from '../../../../lib/supabase/config'

export async function GET() {
  try {
    if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
    const { supabase } = await requireAdmin()

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        quantity,
        users!inner (
          apartments!inner (
            name
          )
        )
      `)
      .eq('status', 'scheduled')
      .eq('delivery_date', today)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data || !Array.isArray(data)) return NextResponse.json([])

    // Group by apartment and sum quantities (defensive checks for nested fields)
    type DeliveryRow = {
      quantity?: number | string | null
      users?: { apartments?: { name?: string | null } | null } | null
    }

    const groupedData = (data as unknown as DeliveryRow[]).reduce((acc: Record<string, number>, item) => {
      const apartmentName = item.users?.apartments?.name ?? 'Unknown'
      const qty = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity) || 0
      acc[apartmentName] = (acc[apartmentName] || 0) + qty
      return acc
    }, {})

    // Convert to array format
    const result = Object.entries(groupedData).map(([apartment_name, total_chapatis]) => ({
      apartment_name,
      total_chapatis
    }))

    return NextResponse.json(result)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
