'use client'

import React, { useEffect, useState } from 'react'
import { useClaimStore } from '@/stores/claim-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ChevronRightIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  CogIcon,
  PencilSquareIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid'
import DragDropZone from '@/components/upload/drag-drop-zone'
import AnalysisStepperComponent from '@/components/analysis/ai-analysis-stepper'
import LetterGenerator from '@/components/appeal/letter-generator'
import SuccessFeeModal from '@/components/payment/success-fee-modal'
import type { WorkflowStep } from '@/types/claim'

interface StepIndicatorStep {
  readonly id: WorkflowStep
  readonly name: string
  readonly icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const WORKFLOW_STEPS: readonly StepIndicatorStep[] = [
  { id: 'upload', name: 'Upload', icon: CloudArrowUpIcon },
  { id: 'analysis', name: 'Analysis', icon: CogIcon },
  { id: 'appeal', name: 'Appeal', icon: PencilSquareIcon },
  { id: 'payment', name: 'Payment', icon: CreditCardIcon }
] as const

export default function Dashboard() {
  const { 
    claims, 
    currentClaim,
    totalSaved, 
    isAnalyzing,
    initializeMockData, 
    createNewClaim,
    startAnalysis,
    getTotalClaimsWon,
    getActiveDisputesCount 
  } = useClaimStore()
  
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('dashboard')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    initializeMockData()
  }, [initializeMockData])

  // Auto-advance workflow based on claim state
  useEffect(() => {
    if (!currentClaim) {
      setCurrentStep('dashboard')
      return
    }

    switch (currentClaim.status) {
      case 'draft':
        setCurrentStep('upload')
        break
      case 'analyzing':
        setCurrentStep('analysis')
        break
      case 'appeal-ready':
        setCurrentStep('appeal')
        break
      case 'won':
      case 'submitted':
        setCurrentStep('dashboard')
        break
    }
  }, [currentClaim?.status])

  const totalClaims = claims.length
  const claimsWon = getTotalClaimsWon()
  const activeDisputes = getActiveDisputesCount()

  const handleStartNewDispute = useCallback(() => {
    createNewClaim()
    setCurrentStep('upload')
  }, [createNewClaim])

  const handleBackToDashboard = useCallback(() => {
    setCurrentStep('dashboard')
  }, [])

  const handleStartAnalysis = useCallback(() => {
    if (!currentClaim) return
    
    const hasRequiredDocs = currentClaim.documents.length >= 2 &&
      currentClaim.documents.some(doc => doc.type === 'policy') &&
      currentClaim.documents.some(doc => doc.type === 'denial')

    if (!hasRequiredDocs) {
      alert('Please upload both required documents before starting analysis.')
      return
    }

    startAnalysis()
  }, [currentClaim, startAnalysis])

  const handleAnalysisComplete = useCallback(() => {
    // Analysis completion is handled by the stepper component
    // State will automatically transition to appeal step
  }, [])

  const handleTriggerPayment = useCallback(() => {
    setShowPaymentModal(true)
  }, [])

  const handlePaymentSuccess = useCallback(() => {
    setShowPaymentModal(false)
    setCurrentStep('dashboard')
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircleIcon className="h-5 w-5 text-midnight-success" />
      case 'draft':
      case 'analyzing':
      case 'appeal-ready':
        return <ClockIcon className="h-5 w-5 text-midnight-warning" />
      case 'submitted':
        return <ExclamationTriangleIcon className="h-5 w-5 text-midnight-blue" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-midnight-textMuted" />
    }
  }, [])

  const getStatusText = useCallback((status: string): string => {
    const statusMap = {
      'won': 'Won',
      'draft': 'Draft', 
      'analyzing': 'Analyzing',
      'appeal-ready': 'Appeal Ready',
      'submitted': 'Submitted',
      'lost': 'Unsuccessful'
    } as const
    return statusMap[status as keyof typeof statusMap] || status
  }, [])

  const renderStepIndicator = useCallback(() => {
    if (currentStep === 'dashboard') return null

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {WORKFLOW_STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = WORKFLOW_STEPS.findIndex(s => s.id === currentStep) > index
          const IconComponent = step.icon

          return (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
                ${isActive 
                  ? 'bg-midnight-emerald/10 border border-midnight-emerald text-midnight-emerald' 
                  : isCompleted 
                    ? 'bg-midnight-success/10 border border-midnight-success text-midnight-success'
                    : 'bg-midnight-surface border border-midnight-border text-midnight-textMuted'
                }
              `}>
                <IconComponent className="h-5 w-5" />
                <span className="font-medium">{step.name}</span>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <ChevronRightIcon className="h-4 w-4 text-midnight-textMuted mx-2" />
              )}
            </div>
          )
        })}
      </div>
    )
  }, [currentStep])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-midnight-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-midnight-emerald" role="status" aria-label="Loading"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-midnight-bg">
      {/* Header */}
      <header className="border-b border-midnight-border bg-midnight-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">CD</span>
              </div>
              <h1 className="text-2xl font-bold text-midnight-text">ClaimDefender</h1>
              <div className="security-indicator ml-4">
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">Secure Platform</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentStep !== 'dashboard' && (
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center space-x-2 text-midnight-textMuted hover:text-midnight-emerald transition-colors"
                  type="button"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              )}
              <span className="text-midnight-textMuted">AI Insurance Advocate</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}

        {/* Dashboard View */}
        {currentStep === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-midnight-text mb-2">
                Welcome back to your Claims Dashboard
              </h2>
              <p className="text-midnight-textMuted text-lg">
                Monitor your active disputes and track your insurance claim victories
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="midnight-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-midnight-blue/10">
                    <ChartBarIcon className="h-6 w-6 text-midnight-blue" />
                  </div>
                  <span className="text-2xl font-bold text-midnight-text">{totalClaims}</span>
                </div>
                <h3 className="text-midnight-textMuted font-medium">Total Claims</h3>
              </div>

              <div className="midnight-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-midnight-success/10">
                    <CheckCircleIcon className="h-6 w-6 text-midnight-success" />
                  </div>
                  <span className="text-2xl font-bold text-midnight-text">{claimsWon}</span>
                </div>
                <h3 className="text-midnight-textMuted font-medium">Claims Won</h3>
              </div>

              <div className="midnight-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-midnight-emerald/10">
                    <CurrencyDollarIcon className="h-6 w-6 text-midnight-emerald" />
                  </div>
                  <span className="text-2xl font-bold text-midnight-text">
                    {formatCurrency(totalSaved)}
                  </span>
                </div>
                <h3 className="text-midnight-textMuted font-medium">Total Saved</h3>
              </div>

              <div className="midnight-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-midnight-warning/10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-midnight-warning" />
                  </div>
                  <span className="text-2xl font-bold text-midnight-text">{activeDisputes}</span>
                </div>
                <h3 className="text-midnight-textMuted font-medium">Active Disputes</h3>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <button
                onClick={handleStartNewDispute}
                className="midnight-button-primary text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-3 hover:scale-105 transition-transform duration-200"
                type="button"
              >
                <PlusIcon className="h-6 w-6" />
                <span>Start New Insurance Dispute</span>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Claims Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-midnight-text">Your Claims History</h3>
                <span className="text-midnight-textMuted">{claims.length} total claims</span>
              </div>

              {claims.length === 0 ? (
                <div className="midnight-card p-12 rounded-xl text-center">
                  <DocumentTextIcon className="h-16 w-16 text-midnight-textMuted mx-auto mb-4" />
                  <h4 className="text-xl font-medium text-midnight-text mb-2">No Claims Yet</h4>
                  <p className="text-midnight-textMuted mb-6">
                    Start your first insurance dispute to see your claims appear here.
                  </p>
                  <button
                    onClick={handleStartNewDispute}
                    className="midnight-button-primary text-white px-6 py-3 rounded-lg font-medium"
                    type="button"
                  >
                    Create Your First Claim
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {claims.map((claim) => (
                    <div key={claim.id} className="midnight-card p-6 rounded-xl group cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(claim.status)}
                          <div>
                            <h4 className="font-semibold text-midnight-text group-hover:text-midnight-emerald transition-colors">
                              {claim.title}
                            </h4>
                            <p className="text-sm text-midnight-textMuted capitalize">
                              {claim.type} • {getStatusText(claim.status)}
                            </p>
                          </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-midnight-textMuted group-hover:text-midnight-emerald transition-colors" />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-midnight-textMuted">Claim Value:</span>
                          <span className="font-medium text-midnight-text">
                            {formatCurrency(claim.claimValue)}
                          </span>
                        </div>
                        {claim.status === 'won' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-midnight-textMuted">Amount Saved:</span>
                            <span className="font-medium text-midnight-success">
                              {formatCurrency(claim.potentialSavings)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-midnight-textMuted">
                        <span>Created {formatDate(claim.createdAt)}</span>
                        {claim.completedAt && (
                          <span>Completed {formatDate(claim.completedAt)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-midnight-text">Upload Your Documents</h2>
              <p className="text-midnight-textMuted text-lg">
                Upload your insurance policy handbook and denial letter to begin analysis
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DragDropZone
                type="policy"
                label="Insurance Policy Handbook"
                description="Upload your complete insurance policy document (PDF format recommended)"
              />
              
              <DragDropZone
                type="denial"
                label="Denial Letter / EOB"
                description="Upload your claim denial letter or Explanation of Benefits"
              />
            </div>

            {currentClaim && currentClaim.documents.length >= 2 && (
              <div className="text-center">
                <button
                  onClick={handleStartAnalysis}
                  className="midnight-button-primary text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-3 mx-auto hover:scale-105 transition-transform duration-200"
                  type="button"
                >
                  <CogIcon className="h-6 w-6" />
                  <span>Start AI Analysis</span>
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analysis Step */}
        {currentStep === 'analysis' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-midnight-text">AI Analysis in Progress</h2>
              <p className="text-midnight-textMuted text-lg">
                Our AI is analyzing your documents and identifying policy violations
              </p>
            </div>

            <AnalysisStepperComponent onComplete={handleAnalysisComplete} />
          </div>
        )}

        {/* Appeal Step */}
        {currentStep === 'appeal' && (
          <LetterGenerator onTriggerPayment={handleTriggerPayment} />
        )}
      </main>

      {/* Payment Modal */}
      <SuccessFeeModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
