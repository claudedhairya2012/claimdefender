'use client'

import React, { useState, useMemo } from 'react'
import { formatCurrency } from '@/lib/utils'

type PolicyStatus = 'active' | 'expired' | 'pending' | 'cancelled'
type PolicyCategory = 'all' | 'health' | 'motor' | 'life'

interface InsurancePolicy {
  readonly id: string
  readonly name: string
  readonly provider: string
  readonly category: 'health' | 'motor' | 'life'
  readonly annualPremium: number
  readonly status: PolicyStatus
  readonly expiryDate: Date
  readonly coverageAmount: number
}

interface PolicyFilterConfig {
  readonly id: PolicyCategory
  readonly label: string
}

const POLICY_FILTERS: readonly PolicyFilterConfig[] = [
  { id: 'all', label: 'All Policies' },
  { id: 'health', label: 'Health Insurance' },
  { id: 'motor', label: 'Motor Insurance' },
  { id: 'life', label: 'Life Insurance' }
] as const

const MOCK_POLICIES: readonly InsurancePolicy[] = [
  {
    id: 'POL001',
    name: 'Comprehensive Health Plan',
    provider: 'SecureHealth Insurance',
    category: 'health',
    annualPremium: 24500,
    status: 'active',
    expiryDate: new Date(2024, 11, 15),
    coverageAmount: 1000000
  },
  {
    id: 'POL002',
    name: 'Motor Comprehensive Coverage',
    provider: 'DriveGuard Motors',
    category: 'motor',
    annualPremium: 18750,
    status: 'active',
    expiryDate: new Date(2024, 8, 22),
    coverageAmount: 850000
  },
  {
    id: 'POL003',
    name: 'Term Life Protection',
    provider: 'LifeSecure Assurance',
    category: 'life',
    annualPremium: 36200,
    status: 'active',
    expiryDate: new Date(2025, 2, 10),
    coverageAmount: 5000000
  },
  {
    id: 'POL004',
    name: 'Family Floater Health',
    provider: 'MediCare Plus',
    category: 'health',
    annualPremium: 31800,
    status: 'pending',
    expiryDate: new Date(2024, 10, 5),
    coverageAmount: 1500000
  },
  {
    id: 'POL005',
    name: 'Two Wheeler Insurance',
    provider: 'BikeShield Corp',
    category: 'motor',
    annualPremium: 8950,
    status: 'expired',
    expiryDate: new Date(2024, 3, 18),
    coverageAmount: 125000
  }
] as const

export default function PolicyManager() {
  const [activeFilter, setActiveFilter] = useState<PolicyCategory>('all')

  const filteredPolicies = useMemo((): readonly InsurancePolicy[] => {
    if (activeFilter === 'all') {
      return MOCK_POLICIES
    }
    return MOCK_POLICIES.filter(policy => policy.category === activeFilter)
  }, [activeFilter])

  const handleFilterChange = (filter: PolicyCategory): void => {
    setActiveFilter(filter)
  }

  const handleAIAudit = (policy: InsurancePolicy): void => {
    alert(`Initiating AI Audit for Policy: ${policy.name}\nProvider: ${policy.provider}\nCoverage: ${formatCurrency(policy.coverageAmount)}`)
  }

  const getStatusIndicator = (status: PolicyStatus): { className: string; label: string } => {
    switch (status) {
      case 'active':
        return { className: 'text-midnight-success', label: 'Active' }
      case 'expired':
        return { className: 'text-midnight-error', label: 'Expired' }
      case 'pending':
        return { className: 'text-midnight-warning', label: 'Pending' }
      case 'cancelled':
        return { className: 'text-midnight-textMuted', label: 'Cancelled' }
      default:
        return { className: 'text-midnight-textMuted', label: 'Unknown' }
    }
  }

  const formatExpiryDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="midnight-card p-4 rounded-xl">
        <h3 className="text-lg font-semibold text-midnight-text mb-4">
          Policy Filter Categories
        </h3>
        <div className="flex flex-wrap gap-3">
          {POLICY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium
                ${activeFilter === filter.id
                  ? 'bg-midnight-blue/10 border-midnight-blue text-midnight-blue'
                  : 'bg-midnight-surface border-midnight-border text-midnight-textMuted hover:border-midnight-blue/50 hover:text-midnight-text'
                }
              `}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Policy Table */}
      <div className="midnight-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-midnight-border">
          <h3 className="text-lg font-semibold text-midnight-text">
            Policy Inventory Dashboard
          </h3>
          <p className="text-midnight-textMuted text-sm mt-1">
            Showing {filteredPolicies.length} policies
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-midnight-bg border-b border-midnight-border">
                <th className="text-left p-4 text-midnight-text font-semibold">
                  Policy Name
                </th>
                <th className="text-left p-4 text-midnight-text font-semibold">
                  Provider Name
                </th>
                <th className="text-right p-4 text-midnight-text font-semibold">
                  Annual Premium
                </th>
                <th className="text-center p-4 text-midnight-text font-semibold">
                  Status
                </th>
                <th className="text-center p-4 text-midnight-text font-semibold">
                  Expiry Date
                </th>
                <th className="text-right p-4 text-midnight-text font-semibold">
                  Coverage Amount
                </th>
                <th className="text-center p-4 text-midnight-text font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => {
                const statusInfo = getStatusIndicator(policy.status)
                return (
                  <tr
                    key={policy.id}
                    className="border-b border-midnight-border hover:bg-midnight-surface/30 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-midnight-text">
                          {policy.name}
                        </div>
                        <div className="text-xs text-midnight-textMuted uppercase tracking-wider">
                          {policy.category}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-midnight-text">
                      {policy.provider}
                    </td>
                    <td className="p-4 text-right font-medium text-midnight-text">
                      {formatCurrency(policy.annualPremium)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        policy.status === 'active' ? 'bg-midnight-success' :
                        policy.status === 'expired' ? 'bg-midnight-error' :
                        policy.status === 'pending' ? 'bg-midnight-warning' :
                        'bg-midnight-textMuted'
                      }`}></span>
                      <span className={`font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-4 text-center text-midnight-textMuted">
                      {formatExpiryDate(policy.expiryDate)}
                    </td>
                    <td className="p-4 text-right font-medium text-midnight-text">
                      {formatCurrency(policy.coverageAmount)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleAIAudit(policy)}
                        className="px-3 py-1 text-sm bg-midnight-emerald/10 border border-midnight-emerald text-midnight-emerald rounded-lg hover:bg-midnight-emerald/20 transition-colors"
                        type="button"
                      >
                        Initiate AI Audit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPolicies.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-midnight-textMuted">
              No policies found for the selected category
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
