'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, ChevronRight, Loader2, MapPin, WalletCards } from 'lucide-react'
import Navigation from '../../components/Navigation'
import { useUser } from '../../hooks/useUser'

type DashboardData={subscription:{status:string;quantity:number;start_date:string}|null;address:{label:string;city:string;postal_code:string}|null;wallet:{balance_paise:number;held_paise:number};next_delivery:{delivery_date:string;quantity:number;status:string}|null}
const money=(paise:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(paise/100)

export default function DashboardPage(){
 const {user,loading}=useUser();const router=useRouter();const [data,setData]=useState<DashboardData|null>(null);const [error,setError]=useState('')
 useEffect(()=>{if(!loading&&!user)router.replace('/login?next=/dashboard')},[loading,user,router])
 useEffect(()=>{if(!user)return;fetch('/api/dashboard').then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error||'Unable to load your dashboard.');return body as DashboardData}).then(setData).catch(issue=>setError(issue instanceof Error?issue.message:'Unable to load your dashboard.'))},[user])
 if(loading||!user)return <div className="app-surface flex items-center justify-center"><Loader2 className="animate-spin text-[#e56b35]"/></div>
 const available=(data?.wallet.balance_paise||0)-(data?.wallet.held_paise||0);const location=data?.address?`${data.address.label} · ${data.address.city} ${data.address.postal_code}`:'Add your delivery address'
 return <div className="app-surface"><Navigation/><div className="lg:pl-64"><main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
  <header className="border-b border-[#dfd0bd] pb-8"><p className="eyebrow text-[#bb4824]">Your DailyNest</p><h1 className="editorial-title mt-3 text-5xl font-black sm:text-6xl">Welcome, {user.name||'neighbour'}.</h1><p className="mt-4 flex items-center gap-2 text-sm text-[#6f625f]"><MapPin size={16}/>{location}</p></header>
  {error&&<div role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
  {!data&&!error?<Loader2 className="mx-auto mt-16 animate-spin text-[#e56b35]"/>:<><section className="mt-8 grid gap-6 md:grid-cols-[1.15fr_.85fr]"><article className="surface-card p-7 sm:p-9"><p className="eyebrow text-[#397354]">Delivery plan</p><h2 className="mt-3 text-3xl font-black">{data?.subscription?`${data.subscription.quantity} chapatis per delivery`:'Set your table rhythm.'}</h2><p className="mt-3 max-w-lg leading-7 text-[#6f625f]">{data?.subscription?`Status: ${data.subscription.status.replace('_',' ')} · starts ${data.subscription.start_date}`:'Choose bundles and delivery weekdays, then pay securely to activate the schedule.'}</p><Link href="/subscription" className="button button-coral mt-7">View or manage plan <ChevronRight size={18}/></Link></article><article className="plan-basic p-7 shadow-[8px_8px_0_#eadcc8]"><CalendarDays/><p className="eyebrow mt-8">Next delivery</p><p className="mt-2 text-3xl font-black">{data?.next_delivery?new Date(`${data.next_delivery.delivery_date}T00:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'long'}):'Nothing scheduled'}</p><p className="mt-3 text-sm leading-6 text-[#5f514e]">{data?.next_delivery?`${data.next_delivery.quantity} chapatis · ${data.next_delivery.status}`:'Paid delivery dates will appear after activation.'}</p><Link href="/calendar" className="mt-6 inline-flex items-center gap-1 text-sm font-black underline underline-offset-4">Open calendar <ChevronRight size={16}/></Link></article></section><section className="mt-10 border-y border-[#cdbca6] py-8"><div className="grid gap-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"><div className="bg-[#f1e4cf] p-4"><WalletCards/></div><div><p className="eyebrow text-[#bb4824]">Available wallet balance</p><h2 className="mt-2 text-2xl font-black">{money(available)}</h2><p className="mt-2 text-sm leading-6 text-[#6f625f]">Pay a subscription directly with Razorpay or use available wallet funds.</p></div><Link href="/wallet" className="button button-outline">Wallet details</Link></div></section></>}
 </main></div></div>
}
