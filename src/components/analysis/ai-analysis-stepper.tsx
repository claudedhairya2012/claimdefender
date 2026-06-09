'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useClaimStore } from '@/stores/claim-store'
import { 
  CheckCircleIcon, 
  CogIcon,
  DocumentMagnifyingGlassIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid'
import type { AnalysisStep, AnalysisStepperProps } from '@/types/claim'

const ANALYSIS_STEPS: readonly AnalysisStep[] = [
  {
    id: 1,
    title: 'Scanning Documents & Extracting Text (OCR)',
    description: 'Processing uploaded documents with advanced OCR technology',
    icon: DocumentMagnifyingGlassIcon,
    duration: 2500,
  },
  {
    id: 2, 
    title: 'Analyzing Insurance Policy Limitations',
    description: 'Cross-referencing policy terms with claim denial reasons',
    icon: DocumentTextIcon,
    duration: 3000,
  },
  {
    id: 3,
    title: 'Identifying Insurance Regulatory Violations', 
    description: 'Checking compliance with state insurance regulations',
    icon: ExclamationTriangleIcon,
    duration: 2800,
  },
  {
    id: 4,
    title: 'Drafting Legal Appeal Arguments',
    description: 'Generating evidence-based legal arguments for your appeal',
    icon: ScaleIcon,
    duration: 2700,
  }
] as const

type StepStatus = 'pending' | 'active' | 'completed'

export default function AnalysisStepperComponent({ onComplete }: AnalysisStepperProps) {
  const { currentClaim, updateAnalysisStep, completeAnalysis } = useClaimStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const getStepStatus = useCallback((stepId: number): StepStatus => {
    if (isComplete) return 'completed'
    if (stepId <= currentStep) return 'completed'
    if (stepId === currentStep + 1) return 'active'
    return 'pending'
  }, [currentStep, isComplete])

  const getStepIcon = useCallback((step: AnalysisStep, status: StepStatus) => {
    const IconComponent = step.icon
    
    if (status === 'completed') {
      return <CheckCircleIcon className="h-6 w-6 text-midnight-success" />
    }
    
    if (status === 'active') {
      return (
        <div className="relative">
          <CogIcon className="h-6 w-6 text-midnight-emerald animate-spin" />
        </div>
      )
    }
    
    return <IconComponent className="h-6 w-6 text-midnight-textMuted" />
  }, [])

  useEffect(() => {
    if (!currentClaim?.analysis || isComplete) return

    let stepTimeouts: NodeJS.Timeout[] = []
    let progressInterval: NodeJS.Timeout | null = null

    const runAnalysis = async () => {
      // Start progress animation
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (ANALYSIS_STEPS.length * 50))
          return Math.min(newProgress, 100)
        })
      }, 50)

      // Execute each step with realistic timing
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        const timeout = setTimeout(() => {
          setCurrentStep(i + 1)
          updateAnalysisStep(i + 1)
          
          // If this is the last step, complete the analysis
          if (i === ANALYSIS_STEPS.length - 1) {
            setTimeout(() => {
              setIsComplete(true)
              completeAnalysis()
              if (progressInterval) clearInterval(progressInterval)
              onComplete?.()
            }, 1000)
          }
        }, ANALYSIS_STEPS.slice(0, i + 1).reduce((sum, step) => sum + step.duration, 0))

        stepTimeouts.push(timeout)
      }
    }

    runAnalysis()

    return () => {
      stepTimeouts.forEach(timeout => clearTimeout(timeout))
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [currentClaim?.analysis, updateAnalysisStep, completeAnalysis, onComplete, isComplete])

  if (!currentClaim) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-midnight-textMuted mx-auto mb-4" />
        <p className="text-midnight-textMuted">No active claim found for analysis</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Security Notice */}
      <div className="security-indicator">
        <ShieldCheckIcon className="h-5 w-5 mr-2" />
        <span>Analysis performed using secure, encrypted processing</span>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-midnight-text">Analysis Progress</span>
          <span className="text-midnight-emerald">{Math.round(progress)}%</span>
        </div>
        <div className="midnight-progress h-3 rounded-full">
          <div 
            className="midnight-progress-bar rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step-by-Step Progress */}
      <div className="space-y-6">
        {ANALYSIS_STEPS.map((step, index) => {
          const status = getStepStatus(step.id)
          
          return (
            <div key={step.id} className="flex items-start space-x-4">
              {/* Step Icon */}
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300
                ${status === 'completed' 
                  ? 'midnight-stepper-completed' 
                  : status === 'active' 
                    ? 'midnight-stepper-active border-midnight-emerald bg-midnight-emerald/10' 
                    : 'border-midnight-border bg-midnight-surface'
                }
              `}>
                {getStepIcon(step, status)}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className={`
                  text-lg font-semibold transition-colors duration-300
                  ${status === 'completed' 
                    ? 'text-midnight-success' 
                    : status === 'active' 
                      ? 'text-midnight-emerald' 
                      : 'text-midnight-textMuted'
                  }
                `}>
                  {step.title}
                </div>
                <div className="text-midnight-textMuted mt-1">
                  {step.description}
                </div>
                
                {/* Active Step Animation */}
                {status === 'active' && (
                  <div className="mt-3 flex items-center space-x-2 text-midnight-emerald">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-midnight-emerald rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-midnight-emerald rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-midnight-emerald rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm font-medium">Processing...</span>
                  </div>
                )}

                {/* Completed Step Checkmark */}
                {status === 'completed' && index < ANALYSIS_STEPS.length - 1 && (
                  <div className="mt-3 flex items-center space-x-2 text-midnight-success">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Complete</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Final Results */}
      {isComplete && currentClaim?.analysis?.completed && (
        <div className="mt-8 midnight-card p-8 rounded-xl border border-midnight-success/30 bg-midnight-success/5 animate-fade-in">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <CheckCircleIcon className="h-16 w-16 text-midnight-success animate-pulse-emerald" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-midnight-text mb-2">
                Analysis Complete!
              </h3>
              <p className="text-midnight-textMuted">
                AI analysis has identified strong grounds for appeal
              </p>
            </div>

            {/* Confidence Score */}
            <div className="bg-midnight-surface rounded-xl p-6 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-midnight-emerald mb-2">
                  {currentClaim.analysis.confidenceScore}%
                </div>
                <div className="text-midnight-text font-medium">
                  AI Confidence Score
                </div>
                <div className="text-sm text-midnight-textMuted">
                  High probability of successful appeal
                </div>
              </div>
            </div>

            {/* Policy Red Flags */}
            <div className="bg-midnight-surface rounded-xl p-6 text-left">
              <h4 className="font-semibold text-midnight-text mb-4 flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-midnight-warning" />
                <span>Policy Red Flags Found</span>
              </h4>
              <div className="space-y-3">
                {currentClaim.analysis.redFlags.map((flag, index) => (
                  <div key={index} className="border-l-4 border-midnight-emerald pl-4 py-2">
                    <div className="font-medium text-midnight-text">
                      {flag.section}: {flag.violation}
                    </div>
                    <div className="text-sm text-midnight-textMuted mt-1">
                      {flag.impact}
                    </div>
                    <div className="text-xs text-midnight-warning mt-1 flex items-center space-x-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-midnight-warning"></span>
                      <span>Severity: {flag.severity}</span>
                      {flag.regulatoryCode && <span>• Code: {flag.regulatoryCode}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Confirmation */}
            <div className="security-indicator">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              <span>Analysis ID: {currentClaim.analysis.analysisId} • Securely processed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
