'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ExternalLink, LocateFixed, Loader2, MapPin, RefreshCw, Save, ShieldCheck, UserRound, X } from 'lucide-react'
import Navigation from '../../components/Navigation'
import { supabase } from '../../lib/supabase'
import { useUser } from '../../hooks/useUser'

type AddressForm = {
  id?: string
  label: string
  line1: string
  line2: string
  landmark: string
  city: string
  state: string
  country_name: string
  country_code: string
  postal_code: string
  preferred_delivery_time: string
  latitude: number | null
  longitude: number | null
  location_accuracy_m: number | null
  location_captured_at: string | null
}

const emptyAddress: AddressForm = {
  label: 'Home', line1: '', line2: '', landmark: '', city: '', state: '', country_name: 'India', country_code: 'IN', postal_code: '', preferred_delivery_time: '19:00', latitude: null, longitude: null, location_accuracy_m: null, location_captured_at: null
}

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: userLoading, refresh } = useUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState<AddressForm>(emptyAddress)
  const [saving, setSaving] = useState(false)
  const [locating, setLocating] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [deliveryEligibility, setDeliveryEligibility] = useState<'checking' | 'available' | 'unavailable' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !user) router.replace('/login')
  }, [userLoading, user, router])

  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setEmail(user.email || '')
    setPhone(user.phone || '')

    setLoadingAddress(true)
    supabase.from('addresses').select('*').eq('user_id', user.id).eq('is_default', true).maybeSingle().then(({ data, error: loadError }: { data: AddressForm | null, error: { message: string } | null }) => {
      setLoadingAddress(false)
      if (loadError) {
        setError(`We couldn't load your saved delivery address: ${loadError.message}`)
        return
      }
      if (data) {
        setAddress({
          id: data.id,
          label: data.label || 'Home',
          line1: data.line1 || '',
          line2: data.line2 || '',
          landmark: data.landmark || '',
          city: data.city || '',
          state: data.state || '',
          country_name: data.country_name || 'India',
          country_code: data.country_code || 'IN',
          postal_code: data.postal_code || '',
          preferred_delivery_time: data.preferred_delivery_time?.slice(0, 5) || '19:00',
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          location_accuracy_m: data.location_accuracy_m ?? null,
          location_captured_at: data.location_captured_at ?? null,
        })
      }
    })
  }, [user])

  useEffect(() => {
    setDeliveryEligibility(user && address.postal_code.trim() ? 'available' : null)
  }, [address.postal_code, user])

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    setSaving(true); setError(null); setMessage(null)

    const { error: profileError } = await supabase.rpc('save_own_profile', {
      p_name: name.trim(),
      p_email: email.trim(),
      p_phone: phone.trim() || null,
    })

    if (profileError) {
      setSaving(false); setError(profileError.message); return
    }

    const addressPayload = {
      user_id: user.id,
      label: address.label.trim() || 'Home',
      line1: address.line1.trim(),
      line2: address.line2.trim() || null,
      landmark: address.landmark.trim() || null,
      city: address.city.trim(),
      state: address.state.trim(),
      country_name: address.country_name.trim(),
      country_code: address.country_code.trim().toUpperCase(),
      postal_code: address.postal_code.trim().toUpperCase(),
      preferred_delivery_time: address.preferred_delivery_time || null,
      latitude: address.latitude,
      longitude: address.longitude,
      location_accuracy_m: address.location_accuracy_m,
      location_captured_at: address.location_captured_at,
      is_default: true,
      updated_at: new Date().toISOString(),
    }

    const query = address.id
      ? supabase.from('addresses').update(addressPayload).eq('id', address.id).eq('user_id', user.id).select('id').single()
      : supabase.from('addresses').insert(addressPayload).select('id').single()

    const { data: savedAddress, error: addressError } = await query
    setSaving(false)
    if (addressError) { setError(addressError.message); return }

    if (savedAddress?.id) setAddress((current) => ({ ...current, id: savedAddress.id }))
    await refresh()
    setMessage('Account and delivery details saved.')
  }

  const captureLocation = () => {
    setError(null)
    setMessage(null)
    if (!navigator.geolocation) {
      setError('Current location is not supported by this browser. You can still enter your address manually.')
      return
    }

    setLocating(true)
    const locationSuccess = async ({ coords }: GeolocationPosition) => {
        const latitude = Number(coords.latitude.toFixed(6))
        const longitude = Number(coords.longitude.toFixed(6))
        setAddress((current) => ({
          ...current,
          latitude,
          longitude,
          location_accuracy_m: Math.round(coords.accuracy),
          location_captured_at: new Date().toISOString(),
        }))
        try {
          const response = await fetch(`/api/location/reverse?lat=${latitude}&lon=${longitude}`)
          const result = await response.json() as Partial<AddressForm> & { error?: string }
          if (!response.ok) throw new Error(result.error || 'We could not identify the street address.')
          setAddress((current) => ({
            ...current,
            line1: result.line1 || current.line1,
            line2: result.line2 || current.line2,
            landmark: result.landmark || current.landmark,
            city: result.city || current.city,
            state: result.state || current.state,
            postal_code: result.postal_code || current.postal_code,
            country_name: result.country_name || current.country_name,
            country_code: result.country_code || current.country_code,
          }))
          setMessage('Pin confirmed and address filled. Check the details below, then save.')
        } catch (reverseError) {
          setError(reverseError instanceof Error ? reverseError.message : 'Your pin is ready, but the address could not be filled.')
        } finally {
          setLocating(false)
        }
      }
    const locationFailure = (locationError: GeolocationPositionError, allowRetry = true) => {
      if (allowRetry && locationError.code !== locationError.PERMISSION_DENIED) {
        navigator.geolocation.getCurrentPosition(locationSuccess, (retryError) => locationFailure(retryError, false), {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 300000,
        })
        return
      }
        setLocating(false)
        setError(locationError.code === locationError.PERMISSION_DENIED
          ? 'Location permission was not allowed. Enter the address manually or enable location access and try again.'
          : 'Your device could not provide a location. Check that location services are enabled, or enter the address manually.')
      }
    navigator.geolocation.getCurrentPosition(locationSuccess, locationFailure, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 })
  }

  const clearPin = () => setAddress((current) => ({ ...current, latitude: null, longitude: null, location_accuracy_m: null, location_captured_at: null }))
  const hasPin = address.latitude !== null && address.longitude !== null
  const mapEmbedUrl = hasPin
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${address.longitude! - 0.003}%2C${address.latitude! - 0.002}%2C${address.longitude! + 0.003}%2C${address.latitude! + 0.002}&layer=mapnik&marker=${address.latitude}%2C${address.longitude}`
    : ''
  const fullMapUrl = hasPin ? `https://www.openstreetmap.org/?mlat=${address.latitude}&mlon=${address.longitude}#map=18/${address.latitude}/${address.longitude}` : ''
  const inputClass = 'mt-1.5 block min-h-11 w-full rounded-lg border border-[#cdbda9] bg-white px-3 py-2.5 text-[#321c31] shadow-sm transition focus:border-[#e56b35] focus:ring-2 focus:ring-[#e56b35]/15'

  if (userLoading || !user) return <div className="app-surface flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#e56b35]" /></div>

  return (
    <div className="app-surface">
      <Navigation />
      <div className="lg:pl-64">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <p className="eyebrow text-[#bb4824]">Resident profile</p><h1 className="editorial-title mt-3 text-5xl font-black">Account & delivery.</h1>
            <p className="mt-3 text-sm text-[#6f625f]">Keep your customer profile and default delivery address up to date.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div aria-live="polite" aria-atomic="true">
              {message && <div className="flex items-start gap-2 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>}
              {error && <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"><X className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
            </div>

            <section className="surface-card p-6">
              <h2 className="font-black text-xl flex items-center gap-2 mb-5"><UserRound className="h-5 w-5 text-[#e56b35]" /> Profile</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm font-medium">Name<input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium">Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium sm:col-span-2">Phone<input type="tel" autoComplete="tel" inputMode="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9+ ()-]/g, ''))} placeholder="+91 98765 43210" className={inputClass} /></label>
              </div>
            </section>

            <section className="surface-card overflow-hidden">
              <div className="border-b border-[#dfd0bd] px-5 py-5 sm:px-7"><p className="eyebrow text-[#397354]">Delivery details</p><h2 className="mt-2 font-black text-2xl flex items-center gap-2"><MapPin className="h-5 w-5 text-[#397354]" /> Default address</h2></div>

              <div className="grid border-b border-[#dfd0bd] lg:grid-cols-[.9fr_1.1fr]">
                <div className="flex flex-col justify-center bg-[#fff8ea] p-5 sm:p-7">
                  <span className="eyebrow text-[#bb4824]">1 · Locate</span>
                  <h3 className="mt-3 text-2xl font-black tracking-tight">Drop a precise delivery pin.</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6f625f]">Allow location when your browser asks. This works on HTTPS or localhost and captures your position once—DailyNest never tracks you in the background.</p>
                  <button type="button" onClick={captureLocation} disabled={locating} className="button button-coral mt-5 w-full sm:w-fit disabled:cursor-wait disabled:opacity-60">
                    {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : hasPin ? <RefreshCw className="h-4 w-4" /> : <LocateFixed className="h-4 w-4" />} {locating ? 'Finding address…' : hasPin ? 'Refresh my pin' : 'Use my location'}
                  </button>
                  <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#6f625f]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#397354]" /><span>Your browser controls permission. You can also enter everything manually.</span></div>
                </div>

                <div className="relative min-h-64 overflow-hidden bg-[#eadcc8]">
                  {hasPin ? <>
                    <iframe title="Map showing your delivery pin" src={mapEmbedUrl} loading="lazy" className="absolute inset-0 h-full w-full border-0" />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full drop-shadow-lg"><MapPin className="h-11 w-11 fill-[#e56b35] text-[#9f381a]" aria-hidden="true" /></div>
                    <div className="absolute left-4 top-4 flex items-center gap-2 border border-[#397354]/30 bg-[#f1f8ef] px-3 py-2 text-xs font-black text-[#285b40] shadow-md"><Check className="h-3.5 w-3.5" /> Pin confirmed</div>
                    <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 bg-[#fffdf8]/95 p-3 text-xs shadow-lg">
                      <span className="font-semibold text-[#397354]">Accuracy about {address.location_accuracy_m ?? '—'} metres</span>
                      <div className="flex gap-3"><a href={fullMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold underline underline-offset-4">Open map <ExternalLink className="h-3 w-3" /></a><button type="button" onClick={clearPin} className="font-bold text-red-700 underline underline-offset-4">Remove</button></div>
                    </div>
                  </> : <div className="absolute inset-0 grid place-items-center p-8 text-center"><div><MapPin className="mx-auto h-12 w-12 text-[#b9a68f]" /><p className="mt-3 font-black">Your map will appear here</p><p className="mt-1 text-xs text-[#6f625f]">Use your location or enter the address below.</p></div></div>}
                </div>
              </div>

              <div className="p-5 sm:p-7">
              <div className="mb-5"><span className="eyebrow text-[#bb4824]">2 · Confirm address</span><h3 className="mt-2 text-xl font-black">Check the delivery details</h3><p className="mt-1 text-sm text-[#6f625f]">Map results can be imperfect. Edit anything that needs correcting.</p></div>
              {loadingAddress ? <div role="status" className="grid gap-4 sm:grid-cols-2"><span className="h-11 animate-pulse bg-[#efe6d8]" /><span className="h-11 animate-pulse bg-[#efe6d8]" /><span className="h-11 animate-pulse bg-[#efe6d8] sm:col-span-2" /><span className="sr-only">Loading saved address…</span></div> : <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm font-medium">Label<input value={address.label} onChange={(e) => setAddress({ ...address, label: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" /></label>
                <label className="text-sm font-medium">Preferred delivery time<input type="time" value={address.preferred_delivery_time} onChange={(e) => setAddress({ ...address, preferred_delivery_time: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" /></label>
                <label className="text-sm font-medium sm:col-span-2">Address line 1<input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" /></label>
                <label className="text-sm font-medium sm:col-span-2">Address line 2<input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" /></label>
                <label className="text-sm font-medium sm:col-span-2">Landmark<input value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" /></label>
                <label className="text-sm font-medium">City<input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" /></label>
                <label className="text-sm font-medium">State<input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" /></label>
                <label className="text-sm font-medium">Country<input required autoComplete="country-name" value={address.country_name} onChange={(e) => setAddress({ ...address, country_name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" /></label>
                <label className="text-sm font-medium">Country code<input required autoComplete="country" maxLength={2} value={address.country_code} onChange={(e) => setAddress({ ...address, country_code: e.target.value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase() })} placeholder="IN" className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 uppercase" /></label>
                <label className="text-sm font-medium sm:col-span-2">Postal / ZIP code<input required autoComplete="postal-code" maxLength={16} value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value.replace(/[^a-z0-9 -]/gi, '').slice(0, 16).toUpperCase() })} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 uppercase" /></label>
              </div>}
              {deliveryEligibility && <div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">Delivery is available for this location.</div>}
              <p className="mt-3 text-xs text-gray-500">Your preferred time is a request. DailyNest can assign the final delivery time based on route and area.</p>
              </div>
            </section>

            <div className="sticky bottom-3 z-20 flex justify-end pt-1 sm:static sm:pt-2">
              <button disabled={saving || loadingAddress} className="button button-coral w-full shadow-[0_10px_28px_rgba(50,28,49,.2)] disabled:opacity-50 sm:w-auto sm:min-w-56">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saving ? 'Saving…' : 'Save account & delivery'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
