'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navigation'
import { getMockApartments } from '../../../utils/mockDb'
import { Apartment } from '../../../types/database'
import { 
  ChefHat, 
  Printer, 
  Scale, 
  Sparkles, 
  TrendingUp, 
  CheckSquare, 
  Layers,
  Clock,
  Loader2
} from 'lucide-react'

interface TomorrowProduction {
  id: string
  date: string
  apartment_id: string
  total_chapatis: number
}

export default function ProductionPage() {
  const [production, setProduction] = useState<TomorrowProduction[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)

  // Cooking Stages state
  const [stages, setStages] = useState({
    kneading: false,
    rolling: false,
    baking: false,
    packaging: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/production/tomorrow')
        const data = await response.json()
        setProduction(data.production || [])
      } catch (err) {
        console.warn('Production API failed, using defaults:', err)
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        setProduction([
          { id: 'prod-1', date: tomorrow, apartment_id: 'apt-1', total_chapatis: 16 },
          { id: 'prod-2', date: tomorrow, apartment_id: 'apt-2', total_chapatis: 42 },
          { id: 'prod-3', date: tomorrow, apartment_id: 'apt-3', total_chapatis: 28 },
          { id: 'prod-4', date: tomorrow, apartment_id: 'apt-4', total_chapatis: 20 }
        ])
      } finally {
        setApartments(getMockApartments())
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleStageToggle = (stage: keyof typeof stages) => {
    setStages(prev => ({ ...prev, [stage]: !prev[stage] }))
  }

  const handlePrint = () => {
    window.print()
  }

  const totalChapatisTomorrow = production.reduce((sum, item) => sum + item.total_chapatis, 0)
  
  // Standard kitchen metrics: approx 35g wheat flour + 15ml water per chapati + pinch of salt/oil
  const flourNeededKg = ((totalChapatisTomorrow * 35) / 1000).toFixed(1)
  const waterNeededLtr = ((totalChapatisTomorrow * 15) / 1000).toFixed(1)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans print:bg-white print:text-black">
      {/* Hide navigation on print */}
      <div className="print:hidden">
        <Navigation />
      </div>
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8 print:border-none print:pb-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate print:text-2xl">
                  Kitchen Production Planner
                </h1>
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1 print:hidden">
                  <Clock className="h-4 w-4" /> Calculate dough scale and review tomorrow's packaging lists.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex-shrink-0 print:hidden">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors shadow-sm gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Print Kitchen Copy
                </button>
              </div>
            </div>

            {/* Layout Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 Cols: Tomorrow's Forecast & Cooking Checklist */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Tomorrow's Forecast Table */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-md p-6 print:border-none print:shadow-none print:p-0">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6 print:text-base">
                    Tomorrow's Apartment Deliveries
                  </h3>
                  
                  {production.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-6">No scheduled deliveries for tomorrow.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-700">
                        <thead className="text-xs font-semibold text-gray-400 uppercase border-b border-gray-150 bg-gray-50/50">
                          <tr>
                            <th className="py-3 px-4">Apartment Complex</th>
                            <th className="py-3 px-4 text-center">Standard Route Time</th>
                            <th className="py-3 px-4 text-right">Required Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                          {production.map((item) => {
                            const apt = apartments.find(a => a.id === item.apartment_id)
                            return (
                              <tr key={item.id} className="hover:bg-gray-55 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-gray-900">{apt?.name || 'Chennai Complex'}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                                    6:00 PM - 8:00 PM
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-extrabold text-green-650">{item.total_chapatis} chapatis</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Operations baking checklist */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-md p-6 print:hidden">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
                    Cooking Operations Checklist
                  </h3>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        id="stage-kneading"
                        checked={stages.kneading}
                        onChange={() => handleStageToggle('kneading')}
                        className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="stage-kneading" className="cursor-pointer">
                        <div className="font-bold text-gray-950 text-sm">Dough Kneading & Rest</div>
                        <div className="text-xs text-gray-500 mt-0.5">Scale flour ({flourNeededKg} kg) and mix water ({waterNeededLtr} L). Rest dough for 30 minutes.</div>
                      </label>
                    </li>

                    <li className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        id="stage-rolling"
                        checked={stages.rolling}
                        onChange={() => handleStageToggle('rolling')}
                        className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="stage-rolling" className="cursor-pointer">
                        <div className="font-bold text-gray-950 text-sm">Portioning & Rolling</div>
                        <div className="text-xs text-gray-500 mt-0.5">Separate dough into individual 50g balls and roll into flat circles. Keep covered.</div>
                      </label>
                    </li>

                    <li className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-gray-55 transition-colors">
                      <input
                        type="checkbox"
                        id="stage-baking"
                        checked={stages.baking}
                        onChange={() => handleStageToggle('baking')}
                        className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="stage-baking" className="cursor-pointer">
                        <div className="font-bold text-gray-950 text-sm">Baking & Butter Brush</div>
                        <div className="text-xs text-gray-500 mt-0.5">Bake flatbreads on high heat griddle. Brush light ghee/butter as requested.</div>
                      </label>
                    </li>

                    <li className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-gray-55 transition-colors">
                      <input
                        type="checkbox"
                        id="stage-packaging"
                        checked={stages.packaging}
                        onChange={() => handleStageToggle('packaging')}
                        className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="stage-packaging" className="cursor-pointer">
                        <div className="font-bold text-gray-950 text-sm">Packaging & Sorting</div>
                        <div className="text-xs text-gray-500 mt-0.5">Let cool briefly, then pack into insulated bags grouped by target apartment routes.</div>
                      </label>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Right 1 Col: Ingredient scale & visual metrics */}
              <div className="space-y-6">
                
                {/* Scale measurements */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-md p-6">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-4 border-b border-gray-100 pb-2">
                    <Scale className="h-4 w-4 text-indigo-500" /> Dough Ingredient Calculator
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase">Total Baking Target</div>
                        <div className="text-lg font-black text-indigo-750 mt-0.5">{totalChapatisTomorrow} Chapatis</div>
                      </div>
                      <ChefHat className="h-10 w-10 text-indigo-150" />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>Atta Wheat Flour</span>
                        <span className="font-bold text-gray-900">{flourNeededKg} kg</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>Water (Warm)</span>
                        <span className="font-bold text-gray-900">{waterNeededLtr} Litres</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] text-gray-400 leading-relaxed border-t border-gray-100">
                      * Calculation details are configured dynamically using standard recipe ratios of 35 grams of wheat flour per single chapati.
                    </div>
                  </div>
                </div>

                {/* Operations banner */}
                <div className="bg-gradient-to-tr from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 print:hidden">
                  <h4 className="text-sm font-bold text-green-950 flex items-center gap-1 mb-2">
                    <Sparkles className="h-4 w-4 text-green-600" /> Kitchen Standards
                  </h4>
                  <p className="text-xs text-green-800 leading-relaxed">
                    Always maintain sterile gloves during rolling and packaging stages. All chapatis must be sealed inside thermal sheets before 5:00 PM.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}