"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookingHeader } from "@/components/booking-header"
import { AlertTriangle, HelpCircle, CheckCircle, XCircle } from "lucide-react"

export default function ReportPage() {
  const [issueType, setIssueType] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  const handleSubmit = async () => {
    // Validate all fields
    if (!issueType || !transactionId || !description) {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus(null), 3000)
      return
    }

    setLoading(true)
    setSubmitStatus(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify({
          userId: 2028, // TODO: Get from auth context
          transactionId: parseInt(transactionId),
          reportContent: issueType, // Issue Type -> reportContent
          reportDate: new Date().toISOString(),
          status: "", // Status mặc định là rỗng (hoặc backend sẽ set PENDING)
          description: description // Description -> description
        })
      })

      if (response.ok) {
        setSubmitStatus('success')
        // Reset form
        setIssueType("")
        setTransactionId("")
        setDescription("")
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        setSubmitStatus('error')
        setTimeout(() => setSubmitStatus(null), 3000)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  const faqs = [
    {
      question: "How do I report a technical issue?",
      answer: "Go to the Report section, describe the issue, and our support team will investigate it immediately.",
    },
    {
      question: "What should I report to support?",
      answer: "Report any technical problems, billing issues, safety concerns, or service quality problems.",
    },
    {
      question: "How long does it take to get a response?",
      answer: "We aim to respond to all reports within 24 hours. Urgent issues are prioritized.",
    },
    {
      question: "Can I track my report status?",
      answer: "Yes, you can view the status of all submitted reports in the Reports section.",
    },
  ]

  return (
    <>
      <BookingHeader title="Report" />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl">
          {/* Success/Error Message */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Report submitted successfully! We'll respond within 24 hours.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">Failed to submit report. Please fill in all fields and try again.</p>
            </div>
          )}

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Report an Issue</h3>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7241CE]"
                    disabled={loading}
                  >
                    <option value="">Select an issue type...</option>
                    <option value="Technical Problem">Technical Problem</option>
                    <option value="Billing Issue">Billing Issue</option>
                    <option value="Safety Concern">Safety Concern</option>
                    <option value="Service Quality">Service Quality</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID (e.g., 5)"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7241CE]"
                    disabled={loading}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the issue in detail..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7241CE]"
                    rows={4}
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-red-500 text-white hover:bg-red-600"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </Card>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <HelpCircle className="w-5 h-5 text-[#7241CE] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}