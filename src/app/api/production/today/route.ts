import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Group by apartment and sum quantities
    const groupedData = data.reduce((acc: { [key: string]: number }, item: any) => {
      const apartmentName = item.users.apartments.name
      acc[apartmentName] = (acc[apartmentName] || 0) + item.quantity
      return acc
    }, {})

    // Convert to array format
    const result = Object.entries(groupedData).map(([apartment_name, total_chapatis]) => ({
      apartment_name,
      total_chapatis
    }))

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}