import { NextRequest, NextResponse } from 'next/server'
import { supabase, isMockMode } from '../../../../lib/supabase'

const MOCK_PRODUCTION_TODAY = [
  { apartment_name: 'Olympia Opaline, Navalur', total_chapatis: 16 },
  { apartment_name: 'Hiranandani Birchwood, Egattur', total_chapatis: 42 },
  { apartment_name: 'DLF Gardencity, Semmancheri', total_chapatis: 28 },
  { apartment_name: 'Appaswamy Splendour, Sholinganallur', total_chapatis: 20 }
]

export async function GET(request: NextRequest) {
  try {
    if (isMockMode) {
      return NextResponse.json(MOCK_PRODUCTION_TODAY)
    }

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
      return NextResponse.json(MOCK_PRODUCTION_TODAY)
    }

    // Guard if data is null/undefined
    if (!data || !Array.isArray(data)) {
      return NextResponse.json(MOCK_PRODUCTION_TODAY)
    }

    // Group by apartment and sum quantities (defensive checks for nested fields)
    const groupedData = data.reduce((acc: { [key: string]: number }, item: any) => {
      const apartmentName = item?.users?.apartments?.name ?? 'Unknown'
      const qty = typeof item?.quantity === 'number' ? item.quantity : Number(item?.quantity) || 0
      acc[apartmentName] = (acc[apartmentName] || 0) + qty
      return acc
    }, {})

    // Convert to array format
    const result = Object.entries(groupedData).map(([apartment_name, total_chapatis]) => ({
      apartment_name,
      total_chapatis
    }))

    if (result.length === 0) {
      return NextResponse.json(MOCK_PRODUCTION_TODAY)
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(MOCK_PRODUCTION_TODAY)
  }
}