'use client'

import React, { useState, useMemo } from 'react'
import { formatCurrency } from '@/lib/utils'

type WealthPlanningTab = 'sip' | 'retirement'

interface SIPParameters {
  readonly monthlyContribution: number
  readonly expectedReturn: number
  readonly investmentYears: number
}

interface SIPCalculation {
  readonly futureValue: number
  readonly totalInvested: number
  readonly wealthGained: number
}

interface RetirementParameters {
  readonly currentAge: number
  readonly retirementAge: number
  readonly monthlyLivingCosts: number
}

interface RetirementCalculation {
  readonly yearsToRetirement: number
  readonly inflatedMonthlyCost: number
  readonly requiredCorpus: number
  readonly monthlyInvestmentRequired: number
}

export default function WealthPlanner() {
  const [activeTab, setActiveTab] = useState<WealthPlanningTab>('sip')
  
  // SIP State
  const [sipParams, setSipParams] = useState<SIPParameters>({
    monthlyContribution: 10000,
    expectedReturn: 12,
    investmentYears: 20
  })

  // Retirement State
  const [retirementParams, setRetirementParams] = useState<RetirementParameters>({
    currentAge: 30,
    retirementAge: 60,
    monthlyLivingCosts: 50000
  })

  // SIP Calculations
  const sipCalculation = useMemo((): SIPCalculation => {
    const { monthlyContribution, expectedReturn, investmentYears } = sipParams
    const monthlyRate = expectedReturn / 12 / 100
    const totalMonths = investmentYears * 12
    
    // SIP Future Value Formula: P * [((1 + i)^n - 1) / i] * (1 + i)
    let futureValue = 0
    if (monthlyRate > 0) {
      const compound = Math.pow(1 + monthlyRate, totalMonths)
      futureValue = monthlyContribution * ((compound - 1) / monthlyRate) * (1 + monthlyRate)
    } else {
      futureValue = monthlyContribution * totalMonths
    }
    
    const totalInvested = monthlyContribution * totalMonths
    const wealthGained = futureValue - totalInvested
    
    return {
      futureValue: Math.round(futureValue),
      totalInvested: Math.round(totalInvested),
      wealthGained: Math.round(wealthGained)
    }
  }, [sipParams])

  // Retirement Calculations
  const retirementCalculation = useMemo((): RetirementCalculation => {
    const { currentAge, retirementAge, monthlyLivingCosts } = retirementParams
    const yearsToRetirement = retirementAge - currentAge
    const inflationRate = 0.06 // 6% annual inflation
    
    // Calculate inflated monthly cost at retirement
    const inflatedMonthlyCost = monthlyLivingCosts * Math.pow(1 + inflationRate, yearsToRetirement)
    
    // Assuming 25 years post-retirement and 4% post-retirement return
    const postRetirementYears = 25
    const postRetirementReturn = 0.04
    const monthlyPostRetirementRate = postRetirementReturn / 12
    
    // Calculate required corpus using present value of annuity formula
    const requiredCorpus = inflatedMonthlyCost * 12 * 
      (1 - Math.pow(1 + postRetirementReturn, -postRetirementYears)) / postRetirementReturn
    
    // Calculate monthly investment required
    const preRetirementReturn = 0.12 // Assuming 12% return during accumulation
    const monthlyPreRetirementRate = preRetirementReturn / 12
    const totalAccumulationMonths = yearsToRetirement * 12
    
    let monthlyInvestmentRequired = 0
    if (monthlyPreRetirementRate > 0) {
      const compound = Math.pow(1 + monthlyPreRetirementRate, totalAccumulationMonths)
      monthlyInvestmentRequired = requiredCorpus * monthlyPreRetirementRate / 
        ((compound - 1) * (1 + monthlyPreRetirementRate))
    } else {
      monthlyInvestmentRequired = requiredCorpus / totalAccumulationMonths
    }
    
    return {
      yearsToRetirement: Math.max(0, yearsToRetirement),
      inflatedMonthlyCost: Math.round(inflatedMonthlyCost),
      requiredCorpus: Math.round(requiredCorpus),
      monthlyInvestmentRequired: Math.round(monthlyInvestmentRequired)
    }
  }, [retirementParams])

  const handleSipChange = (field: keyof SIPParameters, value: string): void => {
    const numValue = parseFloat(value) || 0
    setSipParams(prev => ({ ...prev, [field]: numValue }))
  }

  const handleRetirementChange = (field: keyof RetirementParameters, value: string): void => {
    const numValue = parseFloat(value) || 0
    setRetirementParams(prev => ({ ...prev, [field]: numValue }))
  }

  const renderSIPTab = (): React.ReactNode => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* SIP Inputs */}
      <div className="midnight-card p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-midnight-text mb-6">
          SIP Investment Parameters
        </h4>
        
        <div className="space-y-6">
          {/* Monthly Contribution */}
          <div>
            <label className="block text-sm font-medium text-midnight-text mb-3">
              Monthly SIP Contribution
            </label>
            <input
              type="number"
              value={sipParams.monthlyContribution}
              onChange={(e) => handleSipChange('monthlyContribution', e.target.value)}
              className="w-full p-3 bg-midnight-bg border border-midnight-border rounded-lg text-midnight-text focus:ring-2 focus:ring-midnight-emerald focus:border-transparent"
              min="500"
              max="500000"
              step="500"
            />
            <input
              type="range"
              value={sipParams.monthlyContribution}
              onChange={(e) => handleSipChange('monthlyContribution', e.target.value)}
              className="w-full h-2 bg-midnight-border rounded-lg appearance-none slider-thumb mt-3"
              min="1000"
              max="100000"
              step="1000"
            />
          </div>

          {/* Expected Return */}
          <div>
            <label className="block text-sm font-medium text-midnight-text mb-3">
              Expected Annual Return (%)
            </label>
            <input
              type="number"
              value={sipParams.expectedReturn}
              onChange={(e) => handleSipChange('expectedReturn', e.target.value)}
              className="w-full p-3 bg-midnight-bg border border-midnight-border rounded-lg text-midnight-text focus:ring-2 focus:ring-midnight-emerald focus:border-transparent"
              min="1"
              max="25"
              step="0.5"
            />
            <input
              type="range"
              value={sipParams.expectedReturn}
              onChange={(e) => handleSipChange('expectedReturn', e.target.value)}
              className="w-full h-2 bg-midnight-border rounded-lg appearance-none slider-thumb mt-3"
              min="8"
              max="18"
              step="0.5"
            />
          </div>

          {/* Investment Years */}
          <div>
            <label className="block text-sm font-medium text-midnight-text mb-3">
              Investment Period (Years)
            </label>
            <input
              type="number"
              value={sipParams.investmentYears}
              onChange={(e) => handleSipChange('investmentYears', e.target.value)}
              className="w-full p-3 bg-midnight-bg border border-midnight-border rounded-lg text-midnight-text focus:ring-2 focus:ring-midnight-emerald focus:border-transparent"
              min="1"
              max="40"
              step="1"
            />
            <input
              type="range"
              value={sipParams.investmentYears}
              onChange={(e) => handleSipChange('investmentYears', e.target.value)}
              className="w-full h-2 bg-midnight-border rounded-lg appearance-none slider-thumb mt-3"
              min="5"
              max="30"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* SIP Results */}
      <div className="midnight-card p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-midnight-text mb-6">
          Wealth Projection Results
        </h4>
        
        <div className="space-y-4">
          {/* Future Value */}
          <div className="p-4 bg-midnight-emerald/10 border border-midnight-emerald/30 rounded-lg">
            <div className="text-sm text-midnight-emerald font-medium mb-1">
              Accumulated Final Wealth
            </div>
            <div className="text-2xl font-bold text-midnight-emerald">
              {formatCurrency(sipCalculation.futureValue)}
            </div>
          </div>

          {/* Total Invested */}
          <div className="p-4 bg-midnight-blue/10 border border-midnight-blue/30 rounded-lg">
            <div className="text-sm text-midnight-blue font-medium mb-1">
              Total Invested Capital
            </div>
            <div className="text-xl font-bold text-midnight-blue">
              {formatCurrency(sipCalculation.totalInvested)}
            </div>
          </div>

          {/* Wealth Gained */}
          <div className="p-4 bg-midnight-success/10 border border-midnight-success/30 rounded-lg">
            <div className="text-sm text-midnight-success font-medium mb-1">
              Wealth Generated
            </div>
            <div className="text-xl font-bold text-midnight-success">
              {formatCurrency(sipCalculation.wealthGained)}
            </div>
          </div>

          {/* Breakdown */}
          <div className="p-4 bg-midnight-bg border border-midnight-border rounded-lg">
            <h5 className="text-sm font-medium text-midnight-text mb-3">
              Investment Summary
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-midnight-textMuted">Monthly Investment:</span>
                <span className="text-midnight-text font-medium">
                  {formatCurrency(sipParams.monthlyContribution)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-midnight-textMuted">Investment Period:</span>
                <span className="text-midnight-text font-medium">
                  {sipParams.investmentYears} years
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-midnight-textMuted">Expected Return:</span>
                <span className="text-midnight-text font-medium">
                  {sipParams.expectedReturn}% p.a.
                </span>
              </div>
              <div className="border-t border-midnight-border pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-midnight-text">Return Multiple:</span>
                  <span className="text-midnight-emerald">
                    {(sipCalculation.futureValue / sipCalculation.totalInvested).toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRetirementTab = (): React.ReactNode => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Retirement Inputs */}
      <div className="midnight-card p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-midnight-text mb-6">
          Retirement Planning Inputs
        </h4>
        
        <div className="space-y-6">
          {/* Current Age */}
          <div>
            <label className="block text-sm font-medium text-midnight-text mb-3">
              Current Age
            </label>
            <input
              type="number"
              value={retirementParams.currentAge}
              onChange={(e) => handleRetirementChange('currentAge', e.target.value)}
              className="w-full p-3 bg-midnight-bg border border-midnight-border rounded-lg text-midnight-text focus:ring-2 focus:ring-midnight-emerald focus:border-transparent"
              min="18"
              max="65"
              step="1"
            />
          </div>

          {/* Retirement Age */}
          <div>
            <label className="block text-sm font-medium text-midnight-text mb-3">
              Target Retirement Age
            </label>
            <input
              type="number"
              value={retirementParams.retirementAge}
              onChange={(e) => handleRetirementChange('retirementAge', e.target.value)}
              className="w-full p-3 bg-midnight-bg border border-midnight-border rounded-lg text-midnight-text focus:ring-2 focus:ring-midnight-emerald focus:border-transparent"
              min="50"
              max="75"
              step="1"
            />
          </div>

          {/* Monthly Living Costs */}
          <div>
            <label className="block text-sm font-medium text-midnight-text mb-3">
              Current Monthly Living Costs
            </label>
            <input
              type="number"
              value={retirementParams.monthlyLivingCosts}
              onChange={(e) => handleRetirementChange('monthlyLivingCosts', e.target.value)}
              className="w-full p-3 bg-midnight-bg border border-midnight-border rounded-lg text-midnight-text focus:ring-2 focus:ring-midnight-emerald focus:border-transparent"
              min="10000"
              max="500000"
              step="5000"
            />
            <input
              type="range"
              value={retirementParams.monthlyLivingCosts}
              onChange={(e) => handleRetirementChange('monthlyLivingCosts', e.target.value)}
              className="w-full h-2 bg-midnight-border rounded-lg appearance-none slider-thumb mt-3"
              min="20000"
              max="200000"
              step="5000"
            />
          </div>
        </div>
      </div>

      {/* Retirement Results */}
      <div className="midnight-card p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-midnight-text mb-6">
          Retirement Corpus Analysis
        </h4>
        
        {retirementCalculation.yearsToRetirement <= 0 ? (
          <div className="p-4 bg-midnight-warning/10 border border-midnight-warning/30 rounded-lg">
            <div className="text-midnight-warning font-medium">
              Invalid Parameters: Retirement age must be greater than current age
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Required Corpus */}
            <div className="p-4 bg-midnight-error/10 border border-midnight-error/30 rounded-lg">
              <div className="text-sm text-midnight-error font-medium mb-1">
                Required Retirement Corpus
              </div>
              <div className="text-2xl font-bold text-midnight-error">
                {formatCurrency(retirementCalculation.requiredCorpus)}
              </div>
              <div className="text-xs text-midnight-error/80 mt-1">
                for 25 years post-retirement
              </div>
            </div>

            {/* Monthly Investment Required */}
            <div className="p-4 bg-midnight-warning/10 border border-midnight-warning/30 rounded-lg">
              <div className="text-sm text-midnight-warning font-medium mb-1">
                Monthly Investment Required
              </div>
              <div className="text-xl font-bold text-midnight-warning">
                {formatCurrency(retirementCalculation.monthlyInvestmentRequired)}
              </div>
              <div className="text-xs text-midnight-warning/80 mt-1">
                assuming 12% annual return
              </div>
            </div>

            {/* Inflated Monthly Cost */}
            <div className="p-4 bg-midnight-blue/10 border border-midnight-blue/30 rounded-lg">
              <div className="text-sm text-midnight-blue font-medium mb-1">
                Inflated Monthly Cost at Retirement
              </div>
              <div className="text-xl font-bold text-midnight-blue">
                {formatCurrency(retirementCalculation.inflatedMonthlyCost)}
              </div>
              <div className="text-xs text-midnight-blue/80 mt-1">
                with 6% annual inflation
              </div>
            </div>

            {/* Planning Summary */}
            <div className="p-4 bg-midnight-bg border border-midnight-border rounded-lg">
              <h5 className="text-sm font-medium text-midnight-text mb-3">
                Retirement Planning Summary
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-midnight-textMuted">Years to Retirement:</span>
                  <span className="text-midnight-text font-medium">
                    {retirementCalculation.yearsToRetirement} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-midnight-textMuted">Current Monthly Cost:</span>
                  <span className="text-midnight-text font-medium">
                    {formatCurrency(retirementParams.monthlyLivingCosts)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-midnight-textMuted">Inflation Rate:</span>
                  <span className="text-midnight-text font-medium">6% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-midnight-textMuted">Post-retirement Years:</span>
                  <span className="text-midnight-text font-medium">25 years</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="midnight-card p-4 rounded-xl">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('sip')}
            className={`
              px-6 py-3 rounded-lg border-2 transition-all duration-200 font-medium
              ${activeTab === 'sip'
                ? 'bg-midnight-emerald/10 border-midnight-emerald text-midnight-emerald'
                : 'bg-midnight-surface border-midnight-border text-midnight-textMuted hover:border-midnight-emerald/50'
              }
            `}
            type="button"
          >
            SIP Investment Planning
          </button>
          <button
            onClick={() => setActiveTab('retirement')}
            className={`
              px-6 py-3 rounded-lg border-2 transition-all duration-200 font-medium
              ${activeTab === 'retirement'
                ? 'bg-midnight-emerald/10 border-midnight-emerald text-midnight-emerald'
                : 'bg-midnight-surface border-midnight-border text-midnight-textMuted hover:border-midnight-emerald/50'
              }
            `}
            type="button"
          >
            Retirement Corpus Planning
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'sip' ? renderSIPTab() : renderRetirementTab()}
      </div>
    </div>
  )
}
