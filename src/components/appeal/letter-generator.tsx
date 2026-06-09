'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import { useClaimStore } from '@/stores/claim-store'
import { 
  ClipboardDocumentIcon, 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { sanitizeHtml } from '@/lib/utils'
import type { LetterTemplate, LetterGeneratorProps } from '@/types/claim'

const LETTER_TEMPLATES: readonly LetterTemplate[] = [
  {
    id: 'medical',
    name: 'Medical Claim Denial',
    type: 'medical',
    content: `# Medical Insurance Claim Appeal

**RE: Policy Holder:** [POLICY_HOLDER_NAME]
**Policy Number:** [POLICY_NUMBER]
**Claim Number:** [CLAIM_NUMBER]  
**Date of Service:** [DATE_OF_SERVICE]
**Date of Denial:** [DENIAL_DATE]

Dear Claims Review Committee,

I am formally appealing the wrongful denial of my medical insurance claim dated [DENIAL_DATE]. After thorough review of my policy documentation and applicable state insurance regulations, I have identified multiple material violations of coverage terms and statutory care guidelines that invalidate this denial.

## Policy Violations & Regulatory Breaches Identified:

**Section 4.2 Emergency Care Framework Violation:**
The denial letter fails to acknowledge the emergency nature of the medical services provided. Under [STATE] Insurance Code Section 10110.6, emergency room care restrictions cannot be applied retroactively when the presenting symptoms would cause a reasonable person to believe immediate medical attention was required. Your denial contradicts established emergency care protocols and violates the prudent layperson standard codified in federal EMTALA regulations.

**Section 7.1 Investigation Timeline Breach:**
The claim was denied before completion of the mandatory 30-day investigation period required under [STATE] Insurance Code Section 10113.95. Your denial letter dated [DENIAL_DATE] was issued only [DAYS_ELAPSED] days after submission, demonstrating insufficient investigation and failure to comply with statutory review requirements.

**Section 12.4 Pre-Authorization Communication Failure:**
The policy holder was never properly notified of pre-authorization requirements as mandated by [STATE] Insurance Code Section 10123.137. The denial based on lack of pre-authorization constitutes a material breach when the insurer failed to provide adequate notice of such requirements during enrollment or subsequent policy communications.

## Legal Standards & Statutory Care Guidelines:

This denial violates established statutory care guidelines under [STATE] Health & Safety Code Section 1367.01, which requires insurance carriers to provide coverage consistent with accepted medical practice standards. The treating physician's medical necessity determination carries presumptive validity under established case law.

The insurance carrier has violated its covenant of good faith and fair dealing by:
1. Applying policy exclusions that contradict express coverage language
2. Failing to conduct reasonable investigation before denial
3. Misrepresenting policy terms regarding emergency care coverage
4. Denying coverage without medical peer review as required by statute

## Demand for Immediate Resolution:

Based on the documented policy violations and regulatory breaches presented above, I demand immediate reversal of this wrongful denial and payment of the full claim amount of $[CLAIM_VALUE]. The evidence demonstrates clear liability under both contract and statutory grounds.

Continued delay in resolving this matter may result in additional legal action including:
- Bad faith insurance practices claims under [STATE] Insurance Code Section 790.03
- Extracontractual damages for unreasonable denial
- Attorney fees and costs under [STATE] Civil Code Section 1717
- Regulatory complaint filing with the [STATE] Department of Insurance

I expect written confirmation of claim approval and payment authorization within 30 calendar days of receipt of this letter. Failure to respond appropriately will be considered evidence of continued bad faith conduct.

Sincerely,

[POLICY_HOLDER_NAME]
[POLICY_HOLDER_ADDRESS]
[PHONE_NUMBER]
[EMAIL_ADDRESS]

**Date:** [CURRENT_DATE]

---
*This letter serves as formal notice under [STATE] Insurance Code Section 10113.95 and preserves all rights under applicable state and federal law.*`
  },
  {
    id: 'auto',
    name: 'Auto Insurance Dispute',
    type: 'auto',
    content: `# Auto Insurance Claim Appeal

**RE: Policy Number:** [POLICY_NUMBER]
**Claim Number:** [CLAIM_NUMBER]
**Date of Loss:** [DATE_OF_LOSS]
**Vehicle:** [VEHICLE_YEAR] [VEHICLE_MAKE] [VEHICLE_MODEL]

Dear Claims Department,

This letter serves as a formal appeal of the wrongful denial of my auto insurance claim dated [DENIAL_DATE]. Your denial violates multiple provisions of my insurance contract and applicable [STATE] Vehicle Code liability assessment standards.

## Documented Policy & Statutory Violations:

**Standard Liability Assessment Timeline Breach:**
Under [STATE] Vehicle Code Section 16020.2, insurance carriers must complete liability investigation within 40 days of claim filing. Your denial issued [DAYS_ELAPSED] days after the incident fails to demonstrate adequate investigation of fault determination as required by statutory timeline provisions.

**Traffic Code Provisions Misapplication:**
The denial letter incorrectly cites traffic regulations regarding right-of-way violations. However, [STATE] Vehicle Code Section establishes clear liability standards that directly contradict your fault assessment. The police report supports this interpretation.

**Section 11580.2 Coverage Obligation Violation:**
Your denial contradicts express policy language regarding collision coverage. [STATE] Vehicle Code Section 11580.2 requires insurance carriers to provide coverage consistent with policy terms, and the circumstances of this loss fall squarely within covered perils.

## Legal Analysis & Case Law Precedent:

The denial violates established precedent which held that insurance companies cannot apply exclusions that contradict reasonable policy interpretations. Your denial letter fails to provide specific policy language supporting the coverage denial.

Additionally, [STATE] Insurance Code Section 790.03(h) prohibits unfair claim settlement practices, including:
1. Misrepresenting applicable policy provisions
2. Failing to conduct reasonable investigations  
3. Denying claims without proper legal basis
4. Delaying payment without reasonable justification

## Traffic Engineering Analysis:

The incident location has documented traffic pattern issues that support my position. [STATE] Vehicle Code requires consideration of roadway design factors in fault determination. Traffic engineering analysis confirms the visibility and signage issues that contributed to this incident.

## Demand for Resolution:

Based on the legal analysis presented above, I demand immediate claim approval and payment of $[CLAIM_VALUE]. Your denial lacks sufficient legal foundation and constitutes bad faith insurance conduct under [STATE] law.

Specific relief demanded:
- Immediate reversal of claim denial
- Payment of full repair costs
- Rental car reimbursement
- Diminished value compensation
- Interest and penalties as provided by law

Failure to resolve this matter within 30 days may result in bad faith insurance lawsuit under [STATE] Insurance Code, regulatory complaint with [STATE] Insurance Commissioner, and recovery of attorney fees and extracontractual damages.

Sincerely,

[POLICY_HOLDER_NAME]  
[POLICY_HOLDER_ADDRESS]
[PHONE_NUMBER]
[EMAIL_ADDRESS]

**Date:** [CURRENT_DATE]

---
*This correspondence preserves all rights under applicable [STATE] Insurance Code and Vehicle Code provisions.*`
  },
  {
    id: 'property',
    name: 'Property Damage Dispute', 
    type: 'property',
    content: `# Property Insurance Claim Appeal

**Policy Number:** [POLICY_NUMBER]
**Claim Number:** [CLAIM_NUMBER]  
**Property Address:** [PROPERTY_ADDRESS]
**Date of Loss:** [LOSS_DATE]
**Type of Loss:** [LOSS_TYPE]

Dear Underwriting Department,

I hereby formally appeal the erroneous denial of my property insurance claim dated [DENIAL_DATE]. The denial constitutes material breach of our insurance contract and violates established [STATE] property insurance regulations.

## Independent Adjuster Valuation & Comparative Analysis:

**Localized Market Assessment Discrepancy:**
Your company's damage estimate materially understates actual replacement costs. Independent certified adjuster analysis conducted comprehensive evaluation and determined actual replacement cost significantly higher than your estimate.

**Comparative Market Analysis:**
Recent comparable losses in the geographic area demonstrate consistent settlement values significantly higher than your estimate. These comparables establish market standard replacement costs that your estimate fails to acknowledge.

## Policy Contract Breach & Coverage Violations:

**Coverage Obligation:**
The policy explicitly provides replacement cost coverage for covered perils. Your denial letter incorrectly applies actual cash value methodology, directly contradicting policy terms that guarantee replacement cost coverage for covered losses.

**Reasonable Expectations Doctrine:**
Under [STATE] Insurance Code, policy language must be interpreted to protect the reasonable expectations of the insured. The denial violates this principle by applying exclusions that contradict plain language coverage grants.

**[STATE] Property Insurance Regulations Violation:**
The denial fails to comply with [STATE] Insurance Code requirements including:
1. Specific documentation of policy exclusions  
2. Reasonable investigation before denial
3. Good faith evaluation of replacement costs
4. Proper application of policy terms

## Engineering & Construction Industry Standards:

**Building Code Compliance Requirements:**
[LOCAL_JURISDICTION] Building Code mandates specific construction standards. Replacement costs must account for code upgrade requirements, which your estimate fails to include. Current building permits for similar construction average appropriate costs per square foot.

**Materials & Labor Cost Analysis:**
Current construction material costs have increased substantially since policy effective date. Construction cost indexes show significant variance from your estimates for materials, labor rates, and total project costs.

## Demand for Immediate Resolution:

Based on the comprehensive evidence presented, I demand:

1. **Immediate claim approval** for full replacement cost of $[CLAIM_VALUE]
2. **Additional living expenses** during reconstruction
3. **Code upgrade coverage** as required by policy
4. **Interest and penalties** from date of loss as provided by [STATE] law

Failure to resolve within 30 days will result in breach of contract lawsuit with demand for extracontractual damages, bad faith insurance claim under [STATE] Insurance Code, regulatory complaint with [STATE] Insurance Commissioner, and recovery of attorney fees.

Respectfully submitted,

[POLICY_HOLDER_NAME]
[POLICY_HOLDER_ADDRESS] 
[PHONE_NUMBER]
[EMAIL_ADDRESS]

**Date:** [CURRENT_DATE]

---
*This appeal preserves all contractual and statutory rights under applicable [STATE] insurance and property law.*`
  }
] as const

export default function LetterGenerator({ onTriggerPayment }: LetterGeneratorProps) {
  const { currentClaim, updateAppealLetter, generateAppealLetter } = useClaimStore()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('medical')
  const [letterContent, setLetterContent] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentTemplate = LETTER_TEMPLATES.find(t => t.id === selectedTemplate) || LETTER_TEMPLATES[0]

  const validateContent = useCallback((content: string): string | null => {
    if (!content.trim()) {
      return 'Letter content cannot be empty'
    }
    
    if (content.length > 50000) {
      return 'Letter content is too long (maximum 50,000 characters)'
    }
    
    // Check for potentially malicious content patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        return 'Content contains invalid characters or formatting'
      }
    }
    
    return null
  }, [])

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId)
    const template = LETTER_TEMPLATES.find(t => t.id === templateId)
    if (template && currentClaim) {
      // Generate personalized letter with mock data
      const now = new Date()
      const personalizedContent = template.content
        .replace(/\[POLICY_HOLDER_NAME\]/g, 'John Smith')
        .replace(/\[POLICY_NUMBER\]/g, 'POL-' + Math.random().toString(36).substr(2, 9).toUpperCase())
        .replace(/\[CLAIM_NUMBER\]/g, 'CLM-' + Math.random().toString(36).substr(2, 9).toUpperCase())
        .replace(/\[DATE_OF_SERVICE\]/g, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString())
        .replace(/\[DENIAL_DATE\]/g, new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString())
        .replace(/\[DATE_OF_LOSS\]/g, new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toLocaleDateString())
        .replace(/\[LOSS_DATE\]/g, new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toLocaleDateString())
        .replace(/\[CLAIM_VALUE\]/g, currentClaim.claimValue.toLocaleString())
        .replace(/\[CURRENT_DATE\]/g, now.toLocaleDateString())
        .replace(/\[STATE\]/g, 'California')
        .replace(/\[DAYS_ELAPSED\]/g, '12')
        .replace(/\[VEHICLE_YEAR\]/g, '2021')
        .replace(/\[VEHICLE_MAKE\]/g, 'Honda')
        .replace(/\[VEHICLE_MODEL\]/g, 'Accord')
        .replace(/\[PROPERTY_ADDRESS\]/g, '123 Main Street, Anytown, CA 90210')
        .replace(/\[LOSS_TYPE\]/g, 'Water Damage')
        .replace(/\[POLICY_HOLDER_ADDRESS\]/g, '456 Oak Avenue\nAnytown, CA 90210')
        .replace(/\[PHONE_NUMBER\]/g, '(555) 123-4567')
        .replace(/\[EMAIL_ADDRESS\]/g, 'john.smith@email.com')

      const validationError = validateContent(personalizedContent)
      if (validationError) {
        setValidationError(validationError)
        return
      }

      setValidationError(null)
      const sanitizedContent = sanitizeHtml(personalizedContent)
      setLetterContent(sanitizedContent)
      updateAppealLetter(sanitizedContent)
    }
  }, [currentClaim, updateAppealLetter, validateContent])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    
    const validationError = validateContent(newContent)
    if (validationError) {
      setValidationError(validationError)
      return
    }
    
    setValidationError(null)
    const sanitizedContent = sanitizeHtml(newContent)
    setLetterContent(sanitizedContent)
    updateAppealLetter(sanitizedContent)
  }, [updateAppealLetter, validateContent])

  const handleCopyToClipboard = useCallback(async () => {
    if (!letterContent) return
    
    try {
      await navigator.clipboard.writeText(letterContent)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [letterContent])

  const handleDownloadPDF = useCallback(() => {
    if (!letterContent || validationError) return
    onTriggerPayment?.()
  }, [letterContent, validationError, onTriggerPayment])

  const handleSubmitAppeal = useCallback(() => {
    if (!letterContent || validationError) return
    onTriggerPayment?.()
  }, [letterContent, validationError, onTriggerPayment])

  // Initialize with default template
  useEffect(() => {
    if (!letterContent && currentClaim) {
      handleTemplateSelect(currentClaim.type || 'medical')
    }
  }, [currentClaim, letterContent, handleTemplateSelect])

  if (!currentClaim) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="h-16 w-16 text-midnight-textMuted mx-auto mb-4" />
        <p className="text-midnight-textMuted">No active claim found</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Security Notice */}
      <div className="security-indicator">
        <ShieldCheckIcon className="h-5 w-5 mr-2" />
        <span>All content is validated and sanitized for security</span>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-midnight-text">Generate Appeal Letter</h2>
        <p className="text-midnight-textMuted">
          Create a professional legal appeal letter based on your claim analysis
        </p>
      </div>

      {/* Template Selection */}
      <div className="midnight-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-midnight-text mb-4">
          Select Appeal Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LETTER_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedTemplate === template.id
                  ? 'border-midnight-emerald bg-midnight-emerald/10 text-midnight-emerald'
                  : 'border-midnight-border bg-midnight-surface text-midnight-textMuted hover:border-midnight-emerald/50'
                }
              `}
              type="button"
            >
              <div className="font-medium">{template.name}</div>
              <div className="text-sm mt-1 opacity-80 capitalize">
                {template.type} claim dispute
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Letter Editor */}
      <div className="midnight-card p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-midnight-text">
            Appeal Letter Content
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-midnight-textMuted">
              {letterContent.length.toLocaleString()} characters
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-midnight-emerald hover:text-midnight-emeraldHover text-sm font-medium transition-colors"
              type="button"
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
          </div>
        </div>

        {validationError && (
          <div className="security-indicator error mb-4">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            <span>{validationError}</span>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              ref={textareaRef}
              value={letterContent}
              onChange={handleContentChange}
              className="markdown-editor w-full h-96 p-4 rounded-lg resize-none focus:ring-2 focus:ring-midnight-emerald focus:border-transparent text-sm"
              placeholder="Your appeal letter content will appear here..."
              maxLength={50000}
            />
            <div className="text-xs text-midnight-textMuted">
              You can edit this letter to customize it for your specific situation. All content is automatically sanitized for security.
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <div 
              className="bg-midnight-bg p-6 rounded-lg border border-midnight-border text-midnight-text whitespace-pre-wrap text-sm leading-relaxed"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              {letterContent || 'Select a template above to generate your appeal letter'}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {letterContent && !validationError && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center justify-center space-x-3 px-6 py-3 bg-midnight-surface hover:bg-midnight-surfaceHover border border-midnight-border text-midnight-text rounded-lg transition-all duration-200"
            type="button"
          >
            {copySuccess ? (
              <>
                <CheckCircleIcon className="h-5 w-5 text-midnight-success" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-5 w-5" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            className="midnight-button-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-3 hover:scale-105 transition-transform duration-200"
            type="button"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Download PDF Appeal</span>
          </button>

          <button
            onClick={handleSubmitAppeal}
            className="flex items-center justify-center space-x-3 px-6 py-3 bg-midnight-blue hover:bg-midnight-blueHover text-white rounded-lg font-semibold transition-all duration-200"
            type="button"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Submit Legal Appeal</span>
          </button>
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="midnight-card p-4 rounded-xl bg-midnight-warning/10 border border-midnight-warning/30">
        <div className="text-xs text-midnight-textMuted leading-relaxed">
          <strong className="text-midnight-warning">Legal Disclaimer:</strong> This letter is generated for informational purposes only and does not constitute legal advice. 
          Please review all content carefully and consider consulting with a qualified attorney before submitting. 
          ClaimDefender is not a law firm and does not provide legal representation. All content is automatically validated and sanitized for security.
        </div>
      </div>
    </div>
  )
}
