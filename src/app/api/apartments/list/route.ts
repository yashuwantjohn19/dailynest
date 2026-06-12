import { NextRequest, NextResponse } from 'next/server'
import { supabase, isMockMode } from '../../../../lib/supabase'
import { DEFAULT_APARTMENTS } from '../../../../utils/mockDb'

export async function GET(request: NextRequest) {
  try {
    if (isMockMode) {
      return NextResponse.json({ apartments: DEFAULT_APARTMENTS })
    }

    const { data, error } = await supabase
      .from('apartments')
      .select('*')

    if (error) {
      // Graceful fallback to mock data on supabase error in local dev
      return NextResponse.json({ apartments: DEFAULT_APARTMENTS })
    }

    return NextResponse.json({ apartments: data })
  } catch (error) {
    return NextResponse.json({ apartments: DEFAULT_APARTMENTS })
  }
}