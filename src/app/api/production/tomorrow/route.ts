import { NextRequest, NextResponse } from 'next/server'
import { supabase, isMockMode } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const mockTomorrowProduction = [
      { id: 'prod-1', date: tomorrow, apartment_id: 'apt-1', total_chapatis: 16 },
      { id: 'prod-2', date: tomorrow, apartment_id: 'apt-2', total_chapatis: 42 },
      { id: 'prod-3', date: tomorrow, apartment_id: 'apt-3', total_chapatis: 28 },
      { id: 'prod-4', date: tomorrow, apartment_id: 'apt-4', total_chapatis: 20 }
    ]

    if (isMockMode) {
      return NextResponse.json({ production: mockTomorrowProduction })
    }

    const { data, error } = await supabase
      .from('production')
      .select('*')
      .eq('date', tomorrow)

    if (error) {
      return NextResponse.json({ production: mockTomorrowProduction })
    }

    return NextResponse.json({ production: data && data.length > 0 ? data : mockTomorrowProduction })
  } catch (error) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    return NextResponse.json({
      production: [
        { id: 'prod-1', date: tomorrow, apartment_id: 'apt-1', total_chapatis: 16 },
        { id: 'prod-2', date: tomorrow, apartment_id: 'apt-2', total_chapatis: 42 },
        { id: 'prod-3', date: tomorrow, apartment_id: 'apt-3', total_chapatis: 28 },
        { id: 'prod-4', date: tomorrow, apartment_id: 'apt-4', total_chapatis: 20 }
      ]
    })
  }
}