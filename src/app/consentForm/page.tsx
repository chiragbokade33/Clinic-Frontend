'use client'
import React, { useState, useEffect } from 'react'
import DefaultLayout from '../components/DefaultLayout'
import { ConsentVerify } from '../services/ClinicServiceApi'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const page = () => {
  const [consentData, setConsentData] = useState({
    consentId: null,
    consentName: '',
    pdfUrl: ''
  }) as any;
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState(null)
      const router = useRouter();
  

  useEffect(() => {
    // Extract query parameters from URL
    const urlParams = new URLSearchParams(window.location.search)
    
    const consentIdParam = urlParams.get('ConsentId')
    const consentNameParam = urlParams.get('ConsentName')
    const pdfUrlParam = urlParams.get('pdf')

    if (consentIdParam && consentNameParam && pdfUrlParam) {
      const parsedConsentId = parseInt(consentIdParam)
      
      // Check if parsing was successful
      if (isNaN(parsedConsentId)) {
        console.error('Invalid ConsentId parameter:', consentIdParam)
        return
      }

      const decodedConsentName = decodeURIComponent(consentNameParam)
      const decodedPdfUrl = decodeURIComponent(pdfUrlParam)

      setConsentData({
        consentId: parsedConsentId,
        consentName: decodedConsentName,
        pdfUrl: decodedPdfUrl
      })

      console.log('Consent data set:', {
        consentId: parsedConsentId,
        consentName: decodedConsentName,
        pdfUrl: decodedPdfUrl
      })
    } else {
      console.error('Missing required URL parameters')
    }
  }, [])

  const handleVerifyConsent = async () => {
    if (!consentData.consentId || !consentData.consentName) {
      console.log('Early return - missing data')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await ConsentVerify(consentData.consentId, consentData.consentName)
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Verify successfully..')
      setIsVerified(true)
      router.push('/clinicpatient')
    } catch (err) {
      console.error('Error verifying consent:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Show error if missing consent data
  if (error && !consentData.consentId) {
    return (
      <DefaultLayout>
        <div className="container mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="font-bold text-lg">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">Consent Form</h1>
            {consentData.consentName && (
              <p className="text-blue-100 mt-1">{consentData.consentName}</p>
            )}
          </div>

          {/* PDF Viewer */}
          <div className="p-4">
            {consentData.pdfUrl ? (
              <div className="w-full">
                {/* Alternative PDF Viewer using Google Docs Viewer */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Alternative PDF Viewer</h3>
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(consentData.pdfUrl)}&embedded=true`}
                    className="w-full border border-gray-300 rounded shadow-sm"
                    title="Consent Form PDF - Google Viewer"
                    style={{ height: '700px' }}
                    onLoad={() => console.log('Google PDF viewer loaded')}
                    onError={() => console.log('Google PDF viewer failed')}
                  >
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <p className="text-gray-700">Google PDF viewer not available.</p>
                    </div>
                  </iframe>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading PDF...</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Verify Button Section */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="text-center">
              <button
                onClick={handleVerifyConsent}
                disabled={isLoading || isVerified || !consentData.consentId}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                  isVerified
                    ? 'bg-green-600 cursor-not-allowed shadow-lg'
                    : isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying Consent...
                  </span>
                ) : isVerified ? (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Consent Verified Successfully
                  </span>
                ) : (
                  'Verify Consent'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default page