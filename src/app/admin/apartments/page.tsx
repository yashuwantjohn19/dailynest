'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navigation'
import { getMockApartments, DEFAULT_APARTMENTS } from '../../../utils/mockDb'
import { Apartment } from '../../../types/database'
import { 
  MapPin, 
  Search, 
  Plus, 
  Building, 
  Compass, 
  CheckCircle,
  X,
  Loader2
} from 'lucide-react'

export default function ApartmentsPage() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [newAptName, setNewAptName] = useState('')
  const [newAptAddress, setNewAptAddress] = useState('')
  const [newAptCity, setNewAptCity] = useState('Chennai')
  const [newAptZip, setNewAptZip] = useState('')
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    // Load apartments
    const loadApts = () => {
      const stored = localStorage.getItem('dailynest_mock_apartments')
      if (stored) {
        setApartments(JSON.parse(stored))
      } else {
        setApartments(getMockApartments())
      }
      setLoading(false)
    }
    loadApts()
  }, [])

  const filteredApartments = apartments.filter(apt => 
    apt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.zip_code.includes(searchQuery)
  )

  const handleAddApartment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAptName || !newAptAddress || !newAptZip) return

    const newApt: Apartment = {
      id: `apt-${Date.now()}`,
      name: newAptName,
      address: newAptAddress,
      city: newAptCity,
      state: 'Tamil Nadu',
      zip_code: newAptZip,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updated = [...apartments, newApt]
    setApartments(updated)
    localStorage.setItem('dailynest_mock_apartments', JSON.stringify(updated))

    // Clear form
    setNewAptName('')
    setNewAptAddress('')
    setNewAptZip('')
    setIsOpen(false)
    
    setSuccessMsg(`Apartment "${newApt.name}" registered successfully!`)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this apartment?')) return
    const updated = apartments.filter(apt => apt.id !== id)
    setApartments(updated)
    localStorage.setItem('dailynest_mock_apartments', JSON.stringify(updated))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navigation />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                  Apartment Complexes
                </h1>
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                  Manage list of communities serviced by DailyNest across Chennai.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex-shrink-0">
                <button
                  onClick={() => setIsOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-sm transition-colors shadow-sm gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Apartment
                </button>
              </div>
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{successMsg}</span>
              </div>
            )}

            {/* Search filter block */}
            <div className="bg-white rounded-2xl border border-gray-150 shadow-md p-4 mb-8">
              <div className="relative rounded-lg shadow-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search apartment by name, address line or ZIP code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 sm:text-sm transition-shadow"
                />
              </div>
            </div>

            {/* Grid display */}
            {filteredApartments.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-150 rounded-2xl shadow-sm">
                <Building className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-900">No matching complexes</h3>
                <p className="text-sm text-gray-500 mt-1">Try modifying your search queries or add a new building.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredApartments.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-2xl border border-gray-150 shadow-md p-6 hover:shadow-lg transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Building className="h-6 w-6" />
                        </div>
                        <button
                          onClick={() => handleDelete(apt.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <h3 className="text-lg font-extrabold text-gray-900 mt-4">{apt.name}</h3>
                      <p className="text-sm text-gray-600 mt-2 flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-gray-450 mt-0.5 flex-shrink-0" />
                        {apt.address}, {apt.city}, {apt.state} - {apt.zip_code}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between items-center text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5 text-gray-400" /> Slot: 6:00 PM - 8:00 PM
                      </span>
                      <span>ID: {apt.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Dialog */}
            {isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="px-6 py-4 bg-indigo-650 text-white flex items-center justify-between">
                    <h3 className="text-lg font-bold">Register New Apartment</h3>
                    <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleAddApartment} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Complex Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Prestige Courtyards"
                        value={newAptName}
                        onChange={(e) => setNewAptName(e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Address Street Info</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. OMR Road, Karapakkam"
                        value={newAptAddress}
                        onChange={(e) => setNewAptAddress(e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">City</label>
                        <input
                          type="text"
                          required
                          disabled
                          value={newAptCity}
                          className="block w-full border border-gray-300 rounded-lg py-2.5 px-3.5 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Postal Code (ZIP)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 600097"
                          value={newAptZip}
                          onChange={(e) => setNewAptZip(e.target.value)}
                          className="block w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-sm transition-colors shadow-sm"
                      >
                        Confirm Register
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}