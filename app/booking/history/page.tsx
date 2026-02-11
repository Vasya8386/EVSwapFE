"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingHeader } from "@/components/booking-header"
import { Clock, Zap, Star, Send, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface Booking {
  bookingId: number
  stationId: number
  userId: number
  vehicleId: number
  timeDate: string
  batteryId: number | null
  status: string
  price: number
  packageId: number
}

interface Station {
  id: number
  stationName: string
  address: string
}

interface SwapHistory {
  id: number
  stationId: number
  station: string
  stationAddress: string // Add address field
  date: string
  time: string
  duration: string
  price: number
  status: string
  rating?: number
  feedback?: string
  feedbackId?: number
}

export default function HistoryPage() {
  const [editingFeedback, setEditingFeedback] = useState<number | null>(null)
  const [tempRating, setTempRating] = useState(0)
  const [tempFeedback, setTempFeedback] = useState("")
  const [swapHistory, setSwapHistory] = useState<SwapHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [stations, setStations] = useState<Map<number, Station>>(new Map())

  const userId = localStorage.getItem('userId') || '2027'

  // Fetch stations data
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/stations')
        if (response.ok) {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const stationsData: any[] = await response.json()
            const stationsMap = new Map<number, Station>()
            stationsData.forEach(station => {
              stationsMap.set(station.stationID, {
                id: station.stationID,
                stationName: station.stationName,
                address: station.address
              })
            })
            setStations(stationsMap)
            console.log('✅ Stations loaded:', stationsData)
          } else {
            console.warn('⚠️ Stations API did not return JSON')
          }
        } else {
          console.warn('⚠️ Failed to fetch stations, status:', response.status)
        }
      } catch (err) {
        console.error('❌ Error fetching stations:', err)
      }
    }

    fetchStations()
  }, [])

  // Fetch booking history from API
  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`http://localhost:8080/api/bookings/user/${userId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking history')
        }
        
        const bookings: Booking[] = await response.json()
        
        // Fetch feedbacks for this user
        const feedbackResponse = await fetch(`http://localhost:8080/api/feedbacks/user/${userId}`)
        const feedbacks = feedbackResponse.ok ? await feedbackResponse.json() : []
        
        // Create a map of feedbacks by bookingId
        const feedbackMap = new Map()
        feedbacks.forEach((fb: any) => {
          feedbackMap.set(fb.bookingId, {
            feedbackId: fb.feedbackId,
            rating: fb.rating,
            comment: fb.comment
          })
        })
        
        // Transform API data to match SwapHistory interface
        const transformedHistory: SwapHistory[] = bookings.map((booking) => {
          const dateTime = new Date(booking.timeDate)
          const feedback = feedbackMap.get(booking.bookingId)
          
          // Get station info from stations map (if available)
          const station = stations.get(booking.stationId)
          const stationName = station?.stationName || `Station ${booking.stationId}`
          const stationAddress = station?.address || ""
          
          return {
            id: booking.bookingId,
            stationId: booking.stationId,
            station: stationName,
            stationAddress: stationAddress, // Add address field
            date: dateTime.toISOString().split('T')[0],
            time: dateTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            duration: "5 min",
            price: booking.price,
            status: booking.status,
            rating: feedback?.rating,
            feedback: feedback?.comment,
            feedbackId: feedback?.feedbackId
          }
        })
        
        setSwapHistory(transformedHistory)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    // Fetch bookings immediately, don't wait for stations
    fetchBookingHistory()
  }, [userId, stations])

  const handleAddFeedback = (swapId: number) => {
    const swap = swapHistory.find((s) => s.id === swapId)
    setEditingFeedback(swapId)
    setTempRating(swap?.rating || 0)
    setTempFeedback(swap?.feedback || "")
  }

  const handleSaveFeedback = async (swapId: number) => {
    try {
      setSavingFeedback(true)
      
      const swap = swapHistory.find((s) => s.id === swapId)
      if (!swap) return
      
      const feedbackData = {
        feedbackId: swap.feedbackId || null,
        userId: parseInt(userId),
        stationId: swap.stationId,
        bookingId: swap.id,
        rating: tempRating,
        comment: tempFeedback || ""
      }
      
      console.log('Sending feedback data:', feedbackData)
      
      const response = await fetch('http://localhost:8080/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error:', errorText)
        throw new Error(`Failed to save feedback: ${errorText}`)
      }
      
      const savedFeedback = await response.json()
      console.log('Saved feedback:', savedFeedback)
      
      // Update local state
      setSwapHistory((prev) =>
        prev.map((s) => 
          s.id === swapId 
            ? { 
                ...s, 
                rating: tempRating, 
                feedback: tempFeedback,
                feedbackId: savedFeedback.feedbackId 
              } 
            : s
        )
      )
      
      setEditingFeedback(null)
      setTempRating(0)
      setTempFeedback("")
      
      alert('Feedback saved successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save feedback'
      alert(errorMessage)
      console.error('Error saving feedback:', err)
    } finally {
      setSavingFeedback(false)
    }
  }

  return (
    <>
      <BookingHeader title="History" />

      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Swap History</h3>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7241CE]"></div>
            </div>
          )}

          {error && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </Card>
          )}

          {!loading && !error && swapHistory.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-gray-500">No booking history found</p>
            </Card>
          )}

          {!loading && !error && swapHistory.length > 0 && (
            <div className="space-y-4">
              {swapHistory.map((swap) => (
                <Card key={swap.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{swap.station}</h4>
                          {swap.stationAddress && (
                            <p className="text-sm text-gray-600 mt-1">{swap.stationAddress}</p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            swap.status === "BOOKED"
                              ? "bg-green-100 text-green-800"
                              : swap.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {swap.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {swap.date} at {swap.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Zap className="w-4 h-4" />
                          <span>Duration: {swap.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <span>Price: ${swap.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {editingFeedback === swap.id ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rate Your Experience</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setTempRating(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-6 h-6 ${star <= tempRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                        <textarea
                          value={tempFeedback}
                          onChange={(e) => setTempFeedback(e.target.value)}
                          placeholder="Tell us what you think..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7241CE]"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveFeedback(swap.id)}
                          disabled={tempRating === 0 || !tempFeedback.trim() || savingFeedback}
                          className="bg-[#7241CE] text-white hover:bg-[#5a2fa0] gap-2 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          {savingFeedback ? 'Saving...' : 'Save Feedback'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingFeedback(null)
                            setTempRating(0)
                            setTempFeedback("")
                          }}
                          disabled={savingFeedback}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : swap.rating && swap.feedback ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Your Rating</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < swap.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{swap.feedback}</p>
                      <Button variant="outline" size="sm" onClick={() => handleAddFeedback(swap.id)}>
                        Edit Feedback
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button variant="outline" size="sm" onClick={() => handleAddFeedback(swap.id)} className="gap-2">
                        <Star className="w-4 h-4" />
                        Add Feedback
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}