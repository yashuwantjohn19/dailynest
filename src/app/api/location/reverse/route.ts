import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'

type NominatimAddress = Record<string, string | undefined>

export async function GET(request: NextRequest) {
  try {
    await requireUser()
    const lat = Number(request.nextUrl.searchParams.get('lat'))
    const lon = Number(request.nextUrl.searchParams.get('lon'))

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Valid latitude and longitude are required.' }, { status: 400 })
    }

    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lon))
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('zoom', '18')

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'DailyNest/1.0 (delivery-location reverse geocoding)',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'The map service could not identify this address.' }, { status: 502 })
    }

    const result = await response.json() as { address?: NominatimAddress }
    const address = result.address
    if (!address) return NextResponse.json({ error: 'No address was found for this location.' }, { status: 404 })

    const houseAndRoad = [address.house_number, address.road || address.pedestrian].filter(Boolean).join(' ')
    return NextResponse.json({
      line1: houseAndRoad || address.building || address.amenity || '',
      line2: address.neighbourhood || address.suburb || address.quarter || '',
      landmark: address.amenity || address.building || '',
      city: address.city || address.town || address.village || address.municipality || address.county || '',
      state: address.state || address.state_district || '',
      postal_code: address.postcode || '',
      country_name: address.country || '',
      country_code: address.country_code?.toUpperCase() || '',
    })
  } catch (error) {
    const response = apiErrorResponse(error)
    if (response.status === 500) return NextResponse.json({ error: 'The map service is temporarily unavailable. Your pin is still ready.' }, { status: 502 })
    return response
  }
}
