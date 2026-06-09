'use client'

import React, { useState } from 'react'
import PolicyManager from './policy-manager'
import EMICalculator from './emi-calculator'
import WealthPlanner from './wealth-planner'

type FinanceTab = 'policy' | 'emi' | 'wealth'

interface FinanceTabConfig {
  readonly id: FinanceTab
  readonly label: string
  readonly description: string
}

const FINANCE_TABS: readonly FinanceTabConfig[] = [
  {
    id: 'policy',
    label: 'Policy Matrix Tracker',
    description: 'Manage and audit your insurance portfolio'
  },
  {
    id: 'emi',
    label: 'Loan EMI Engine',
    description: 'Calculate loan repayment schedules and interest costs'
  },
  {
    id: 'wealth',
    label: 'Wealth SIP/Retirement Horizon',
    description: 'Plan systematic investments and retirement corpus'
  }
] as const

export default function InteractiveFinancialHub() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('policy')

  const handleTabChange = (tabId: FinanceTab): void => {
    setActiveTab(tabId)
  }

  const renderActiveComponent = (): React.ReactNode => {
    switch (activeTab) {
      case 'policy':
        return <PolicyManager />
      case 'emi':
        return <EMICalculator />
      case 'wealth':
        return <WealthPlanner />
      default:
        return <PolicyManager />
    }
  }

  return (
    <div className="min-h-screen bg-midnight-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-midnight-text mb-2">
            Financial Management Hub
          </h1>
          <p className="text-midnight-textMuted text-lg">
            Comprehensive financial planning and analysis tools
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="midnight-card p-2 rounded-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {FINANCE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  p-4 rounded-lg transition-all duration-200 text-left
                  ${activeTab === tab.id
                    ? 'bg-midnight-emerald/10 border-2 border-midnight-emerald text-midnight-emerald'
                    : 'bg-midnight-surface border-2 border-midnight-border text-midnight-textMuted hover:border-midnight-emerald/50 hover:text-midnight-text'
                  }
                `}
                type="button"
              >
                <div className="font-semibold text-base mb-1">
                  {tab.label}
                </div>
                <div className="text-sm opacity-80">
                  {tab.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Component Render Area */}
        <div className="animate-fade-in">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  )
}
