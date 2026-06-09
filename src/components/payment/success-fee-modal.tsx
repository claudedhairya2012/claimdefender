'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useClaimStore } from '@/stores/claim-store'
import { 
  XMarkIcon,
  CheckCircleIcon,
  CreditCardIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { 
  formatCurrency, 
  validateAndMaskCardNumber, 
  isValidCvv, 
  isValidExpiryDate 
} from '@/lib/utils'
import type { PaymentModalProps, PaymentFormData, PaymentValidation } from '@/types/claim'

export default function SuccessFeeModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { currentClaim, completeClaim } = useClaimStore()
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvcCode: '',
    cardName: '',
    billingZip: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<PaymentValidation>({
    cardNumber: { isValid: true },
    expiryDate: { isValid: true },
    cvcCode: { isValid: true },
    cardName: { isValid: true },
    billingZip: { isValid: true }
  })

  // Calculate amounts with security validation
  const calculatedAmounts = useMemo(() => {
    const claimValue = currentClaim?.claimValue || 1500
    const safeClaimValue = Math.max(0, Math.min(1000000, claimValue)) // Cap at $1M
    const contingencyFeeRate = 0.20 // 20%
    const contingencyFee = Math.round(safeClaimValue * contingencyFeeRate)
    const netSavings = safeClaimValue - contingencyFee
    
    return {
      claimValue: safeClaimValue,
      contingencyFee,
      netSavings
    }
  }, [currentClaim?.claimValue])

  // Reset modal state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false)
      setIsSuccess(false)
      setValidationErrors({
        cardNumber: { isValid: true },
        expiryDate: { isValid: true },
        cvcCode: { isValid: true },
        cardName: { isValid: true },
        billingZip: { isValid: true }
      })
      setPaymentForm({
        cardNumber: '',
        expiryDate: '',
        cvcCode: '',
        cardName: '',
        billingZip: ''
      })
    }
  }, [isOpen])

  const formatCardNumber = useCallback((value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }, [])

  const formatExpiryDate = useCallback((value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }, [])

  const validateField = useCallback((field: keyof PaymentFormData, value: string): { isValid: boolean; error?: string } => {
    switch (field) {
      case 'cardNumber': {
        const validation = validateAndMaskCardNumber(value)
        if (!validation.isValid) {
          return { isValid: false, error: 'Please enter a valid card number' }
        }
        return { isValid: true }
      }
      case 'expiryDate': {
        if (!isValidExpiryDate(value)) {
          return { isValid: false, error: 'Please enter a valid expiry date (MM/YY)' }
        }
        return { isValid: true }
      }
      case 'cvcCode': {
        const cardValidation = validateAndMaskCardNumber(paymentForm.cardNumber)
        if (!isValidCvv(value, cardValidation.cardType)) {
          const expectedLength = cardValidation.cardType === 'amex' ? 4 : 3
          return { isValid: false, error: `Please enter a valid ${expectedLength}-digit CVC code` }
        }
        return { isValid: true }
      }
      case 'cardName': {
        if (!value.trim() || value.trim().length < 2) {
          return { isValid: false, error: 'Please enter the name on card' }
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          return { isValid: false, error: 'Name contains invalid characters' }
        }
        return { isValid: true }
      }
      case 'billingZip': {
        const cleanZip = value.replace(/\D/g, '')
        if (cleanZip.length !== 5) {
          return { isValid: false, error: 'Please enter a valid 5-digit ZIP code' }
        }
        return { isValid: true }
      }
      default:
        return { isValid: false, error: 'Unknown field' }
    }
  }, [paymentForm.cardNumber])

  const validateAllFields = useCallback(): boolean => {
    const newValidation: PaymentValidation = {
      cardNumber: validateField('cardNumber', paymentForm.cardNumber),
      expiryDate: validateField('expiryDate', paymentForm.expiryDate),
      cvcCode: validateField('cvcCode', paymentForm.cvcCode),
      cardName: validateField('cardName', paymentForm.cardName),
      billingZip: validateField('billingZip', paymentForm.billingZip)
    }

    setValidationErrors(newValidation)

    return Object.values(newValidation).every(field => field.isValid)
  }, [paymentForm, validateField])

  const handleInputChange = useCallback((field: keyof PaymentFormData, value: string) => {
    let formattedValue = value

    // Apply formatting and security filtering
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
      if (formattedValue.replace(/\s/g, '').length > 16) return // Prevent overly long card numbers
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
      if (formattedValue.length > 5) return // MM/YY format only
    } else if (field === 'cvcCode') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4) // Max 4 digits for AMEX
    } else if (field === 'billingZip') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 5) // 5 digit ZIP only
    } else if (field === 'cardName') {
      formattedValue = value.replace(/[^a-zA-Z\s'-]/g, '').substring(0, 50) // Letters, spaces, hyphens, apostrophes only
    }

    setPaymentForm(prev => ({ ...prev, [field]: formattedValue }))
    
    // Clear field-specific error when user starts typing
    if (validationErrors[field] && !validationErrors[field].isValid) {
      setValidationErrors(prev => ({ 
        ...prev, 
        [field]: { isValid: true } 
      }))
    }
  }, [formatCardNumber, formatExpiryDate, validationErrors])

  const handleSubmitPayment = useCallback(async () => {
    if (!validateAllFields()) return

    setIsProcessing(true)

    try {
      // Simulate secure payment processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      setIsProcessing(false)
      setIsSuccess(true)

      // Complete the claim in store
      if (currentClaim) {
        completeClaim(calculatedAmounts.contingencyFee)
      }

      // Show success for 2.5 seconds then close
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2500)
    } catch (error) {
      console.error('Payment processing error:', error)
      setIsProcessing(false)
      setValidationErrors(prev => ({
        ...prev,
        cardNumber: { isValid: false, error: 'Payment processing failed. Please try again.' }
      }))
    }
  }, [validateAllFields, currentClaim, completeClaim, calculatedAmounts.contingencyFee, onSuccess, onClose])

  const maskedCardNumber = useMemo(() => {
    if (!paymentForm.cardNumber) return ''
    const cleaned = paymentForm.cardNumber.replace(/\s/g, '')
    return cleaned.length > 4 ? `•••• •••• •••• ${cleaned.slice(-4)}` : cleaned
  }, [paymentForm.cardNumber])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-midnight-bg/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg midnight-card border border-midnight-border rounded-2xl p-6 shadow-2xl">
        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-midnight-emerald/10">
                  <CreditCardIcon className="h-6 w-6 text-midnight-emerald" />
                </div>
                <h3 className="text-xl font-bold text-midnight-text">
                  Success Fee Authorization
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-midnight-textMuted hover:text-midnight-text transition-colors"
                disabled={isProcessing}
                type="button"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Security Notice */}
            <div className="security-indicator mb-6">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              <span>Secure payment processing with end-to-end encryption</span>
            </div>

            {/* Invoice Breakdown */}
            <div className="midnight-card bg-midnight-bg/50 p-4 rounded-xl mb-6 space-y-3">
              <h4 className="font-semibold text-midnight-text flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-midnight-emerald" />
                <span>Fee Breakdown</span>
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-midnight-textMuted">Total Claim Value:</span>
                  <span className="font-medium text-midnight-text">{formatCurrency(calculatedAmounts.claimValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-midnight-textMuted">Our Contingency Fee (20%):</span>
                  <span className="font-medium text-midnight-warning">{formatCurrency(calculatedAmounts.contingencyFee)}</span>
                </div>
                <div className="border-t border-midnight-border pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-midnight-text">Net Savings to You:</span>
                    <span className="font-bold text-midnight-success text-lg">{formatCurrency(calculatedAmounts.netSavings)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-midnight-textMuted bg-midnight-success/10 p-2 rounded border border-midnight-success/20">
                <span className="text-midnight-success font-medium">✓ You are only charged if your claim denial is successfully overturned.</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <h4 className="font-semibold text-midnight-text">Payment Authorization</h4>
              
              {/* Card Number */}
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-midnight-text mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    id="card-number"
                    type="text"
                    value={paymentForm.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className={`
                      secure-input w-full p-3 pl-10 rounded-lg transition-all
                      ${!validationErrors.cardNumber.isValid ? 'error' : ''}
                    `}
                    maxLength={19}
                    disabled={isProcessing}
                    autoComplete="cc-number"
                  />
                  <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-midnight-textMuted" />
                </div>
                {!validationErrors.cardNumber.isValid && (
                  <p className="text-midnight-error text-xs mt-1 flex items-center">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    {validationErrors.cardNumber.error}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div>
                  <label htmlFor="expiry-date" className="block text-sm font-medium text-midnight-text mb-2">
                    Expiry Date
                  </label>
                  <input
                    id="expiry-date"
                    type="text"
                    value={paymentForm.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    className={`
                      secure-input w-full p-3 rounded-lg transition-all
                      ${!validationErrors.expiryDate.isValid ? 'error' : ''}
                    `}
                    maxLength={5}
                    disabled={isProcessing}
                    autoComplete="cc-exp"
                  />
                  {!validationErrors.expiryDate.isValid && (
                    <p className="text-midnight-error text-xs mt-1">{validationErrors.expiryDate.error}</p>
                  )}
                </div>

                {/* CVC */}
                <div>
                  <label htmlFor="cvc-code" className="block text-sm font-medium text-midnight-text mb-2">
                    CVC Code
                  </label>
                  <input
                    id="cvc-code"
                    type="password"
                    value={paymentForm.cvcCode}
                    onChange={(e) => handleInputChange('cvcCode', e.target.value)}
                    placeholder="123"
                    className={`
                      secure-input w-full p-3 rounded-lg transition-all
                      ${!validationErrors.cvcCode.isValid ? 'error' : ''}
                    `}
                    maxLength={4}
                    disabled={isProcessing}
                    autoComplete="cc-csc"
                  />
                  {!validationErrors.cvcCode.isValid && (
                    <p className="text-midnight-error text-xs mt-1">{validationErrors.cvcCode.error}</p>
                  )}
                </div>
              </div>

              {/* Card Name */}
              <div>
                <label htmlFor="card-name" className="block text-sm font-medium text-midnight-text mb-2">
                  Name on Card
                </label>
                <input
                  id="card-name"
                  type="text"
                  value={paymentForm.cardName}
                  onChange={(e) => handleInputChange('cardName', e.target.value)}
                  placeholder="John Smith"
                  className={`
                    secure-input w-full p-3 rounded-lg transition-all
                    ${!validationErrors.cardName.isValid ? 'error' : ''}
                  `}
                  disabled={isProcessing}
                  autoComplete="cc-name"
                />
                {!validationErrors.cardName.isValid && (
                  <p className="text-midnight-error text-xs mt-1">{validationErrors.cardName.error}</p>
                )}
              </div>

              {/* Billing ZIP */}
              <div>
                <label htmlFor="billing-zip" className="block text-sm font-medium text-midnight-text mb-2">
                  Billing ZIP Code
                </label>
                <input
                  id="billing-zip"
                  type="text"
                  value={paymentForm.billingZip}
                  onChange={(e) => handleInputChange('billingZip', e.target.value)}
                  placeholder="90210"
                  className={`
                    secure-input w-full p-3 rounded-lg transition-all
                    ${!validationErrors.billingZip.isValid ? 'error' : ''}
                  `}
                  maxLength={5}
                  disabled={isProcessing}
                  autoComplete="postal-code"
                />
                {!validationErrors.billingZip.isValid && (
                  <p className="text-midnight-error text-xs mt-1">{validationErrors.billingZip.error}</p>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center space-x-3 p-3 bg-midnight-surface rounded-lg mt-4">
              <LockClosedIcon className="h-5 w-5 text-midnight-emerald flex-shrink-0" />
              <div className="text-xs text-midnight-textMuted">
                <span className="text-midnight-emerald font-medium">Secure Payment:</span> Your payment information is encrypted using industry-standard SSL encryption and validated with Luhn algorithm.
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitPayment}
              disabled={isProcessing}
              className={`
                w-full mt-6 midnight-button-primary text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-3
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `}
              type="button"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Authorization Ledger...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Submit Payment Authorization</span>
                </>
              )}
            </button>
          </>
        ) : (
          /* Success State */
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <CheckCircleIcon className="h-20 w-20 text-midnight-success animate-pulse-emerald" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-midnight-text mb-2">
                Payment Authorization Successful!
              </h3>
              <p className="text-midnight-textMuted">
                Your success fee has been authorized. We'll only charge your card if we successfully overturn your claim denial.
              </p>
            </div>

            <div className="midnight-card bg-midnight-success/10 border border-midnight-success/30 p-4 rounded-xl">
              <div className="text-midnight-success font-medium mb-2">
                Authorization Details:
              </div>
              <div className="text-sm space-y-1 text-midnight-text">
                <div>Amount: {formatCurrency(calculatedAmounts.contingencyFee)}</div>
                <div>Authorization ID: AUTH-{Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
                <div>Card: {maskedCardNumber}</div>
              </div>
            </div>

            <div className="text-xs text-midnight-textMuted">
              You will receive a confirmation email with your authorization details and next steps for your appeal submission.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
