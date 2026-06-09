'use client'

import React, { useState, useMemo } from 'react'
import { formatCurrency } from '@/lib/utils'

interface LoanParameters {
  readonly principal: number
  readonly annualRate: number
  readonly tenureYears: number
}

interface EMICalculation {
  readonly monthlyEMI: number
  readonly totalInterest: number
  readonly totalPayable: number
  readonly totalMonths: number
}

export default function EMICalculator() {
  const [loanParams, setLoanParams] = useState<LoanParameters>({
    principal: 1000000,
    annualRate: 8.5,
    tenureYears: 20
  })

  const emiCalculation = useMemo((): EMICalculation => {
    const { principal, annualRate, tenureYears } = loanParams
    
    // Convert annual rate to monthly and percentage to decimal
    const monthlyRate = annualRate / 12 / 100
    const totalMonths = tenureYears * 12
    
    // EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
    let monthlyEMI = 0
    if (monthlyRate > 0) {
      const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)
      const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1
      monthlyEMI = numerator / denominator
    } else {
      // If interest rate is 0
      monthlyEMI = principal / totalMonths
    }
    
    const totalPayable = monthlyEMI * totalMonths
    const totalInterest = totalPayable - principal
    
    return {
      monthlyEMI: Math.round(monthlyEMI),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
      totalMonths
    }
  }, [loanParams])

  const handlePrincipalChange = (value: string): void => {
    const numValue = parseFloat(value) || 0
    setLoanParams(prev => ({ ...prev, principal: Math.max(0, Math.min(100000000, numValue)) }))
  }

  const handleRateChange = (value: string): void => {
    const numValue = parseFloat(value) || 0
    setLoanParams(prev => ({ ...prev, annualRate: Math.max(0, Math.min(30, numValue)) }))
  }

  const handleTenureChange = (value: string): void => {
    const numValue = parseFloat(value) || 0
    setLoanParams(prev => ({ ...prev, tenureYears: Math.max(1, Math.min(40, numValue)) }))
  }

  const formatNumber = (value: number): string => {
    return value.toLocaleString('en-IN')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Panel */}
      <div className="midnight-card p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-midnight-text mb-6">
          Loan Parameters
        </h3>
        
        <div className="space-y-6">
          {/* Principal Amount */}
          <div>
            <label className="block text-sm font-medium text-midnight-text mb-3">
              Principal Loan Amount (P)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                value={loanParams.principal}
                onChange={(e) => handlePrincipalChange(e.target.value)}
                className="w-full p-3 bg-midnight-bg border border-midnight-border rounded-lg text-midnight-text focus:ring-2 focus:ring-midnight-emerald focus:border-transparent"
                min="0"
                max="100000000"
                step="10000"
              />
              <input
                type="range"
                value={loanParams.principal}
                onChange={(e) => handlePrincipalChange(e.target.value)}
                className="w-full h-2 bg-midnight-border rounded-lg appearance-none slider-thumb"
                min="100000"
                max="10000000"
                step="10000"
              />
              <div className="flex justify-between text-xs text-midnight-textMuted">
                <span>₹1L</span>
                <span className="font-medium text-midnight-emerald">
                  ₹{formatNumber(loanParams.principal)}
                </span>
                <span>₹1Cr</span>
              </div>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-midnight-text mb-3">
              Annual Interest Rate (R)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                value={loanParams.annualRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="w-full p-3 bg-midnight-bg border border-midnight-border rounded-lg text-midnight-text focus:ring-2 focus:ring-midnight-emerald focus:border-transparent"
                min="0"
                max="30"
                step="0.1"
              />
              <input
                type="range"
                value={loanParams.annualRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="w-full h-2 bg-midnight-border rounded-lg appearance-none slider-thumb"
                min="1"
                max="20"
                step="0.1"
              />
              <div className="flex justify-between text-xs text-midnight-textMuted">
                <span>1%</span>
                <span className="font-medium text-midnight-blue">
                  {loanParams.annualRate}% p.a.
                </span>
                <span>20%</span>
              </div>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-sm font-medium text-midnight-text mb-3">
              Loan Tenure in Years (N)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                value={loanParams.tenureYears}
                onChange={(e) => handleTenureChange(e.target.value)}
                className="w-full p-3 bg-midnight-bg border border-midnight-border rounded-lg text-midnight-text focus:ring-2 focus:ring-midnight-emerald focus:border-transparent"
                min="1"
                max="40"
                step="1"
              />
              <input
                type="range"
                value={loanParams.tenureYears}
                onChange={(e) => handleTenureChange(e.target.value)}
                className="w-full h-2 bg-midnight-border rounded-lg appearance-none slider-thumb"
                min="1"
                max="30"
                step="1"
              />
              <div className="flex justify-between text-xs text-midnight-textMuted">
                <span>1 Year</span>
                <span className="font-medium text-midnight-warning">
                  {loanParams.tenureYears} Years
                </span>
                <span>30 Years</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="midnight-card p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-midnight-text mb-6">
          EMI Calculation Results
        </h3>
        
        <div className="space-y-4">
          {/* Monthly EMI */}
          <div className="p-4 bg-midnight-emerald/10 border border-midnight-emerald/30 rounded-lg">
            <div className="text-sm text-midnight-emerald font-medium mb-1">
              Monthly EMI Amount
            </div>
            <div className="text-2xl font-bold text-midnight-emerald">
              {formatCurrency(emiCalculation.monthlyEMI)}
            </div>
            <div className="text-xs text-midnight-emerald/80 mt-1">
              for {emiCalculation.totalMonths} months
            </div>
          </div>

          {/* Total Interest */}
          <div className="p-4 bg-midnight-warning/10 border border-midnight-warning/30 rounded-lg">
            <div className="text-sm text-midnight-warning font-medium mb-1">
              Total Interest Payable
            </div>
            <div className="text-xl font-bold text-midnight-warning">
              {formatCurrency(emiCalculation.totalInterest)}
            </div>
            <div className="text-xs text-midnight-warning/80 mt-1">
              over entire tenure
            </div>
          </div>

          {/* Total Amount */}
          <div className="p-4 bg-midnight-blue/10 border border-midnight-blue/30 rounded-lg">
            <div className="text-sm text-midnight-blue font-medium mb-1">
              Total Amount Payable
            </div>
            <div className="text-xl font-bold text-midnight-blue">
              {formatCurrency(emiCalculation.totalPayable)}
            </div>
            <div className="text-xs text-midnight-blue/80 mt-1">
              principal + interest
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="mt-6 p-4 bg-midnight-bg rounded-lg border border-midnight-border">
            <h4 className="text-sm font-medium text-midnight-text mb-3">
              Payment Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-midnight-textMuted">Principal Amount:</span>
                <span className="text-midnight-text font-medium">
                  {formatCurrency(loanParams.principal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-midnight-textMuted">Interest Component:</span>
                <span className="text-midnight-text font-medium">
                  {formatCurrency(emiCalculation.totalInterest)}
                </span>
              </div>
              <div className="border-t border-midnight-border pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-midnight-text">Total Payable:</span>
                  <span className="text-midnight-text">
                    {formatCurrency(emiCalculation.totalPayable)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
