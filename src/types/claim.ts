export interface SecureDocument {
  readonly id: string
  readonly name: string
  readonly type: 'policy' | 'denial'
  readonly file: File | null
  readonly uploaded: boolean
  readonly size: number
  readonly uploadedAt: Date
  readonly hash?: string
}

export interface PolicyRedFlag {
  readonly section: string
  readonly violation: string
  readonly impact: string
  readonly severity: 'low' | 'medium' | 'high'
  readonly regulatoryCode?: string
}

export interface AnalysisResult {
  readonly confidenceScore: number
  readonly redFlags: readonly PolicyRedFlag[]
  readonly completed: boolean
  readonly currentStep: number
  readonly analysisId: string
  readonly completedAt?: Date
}

export interface SecureClaim {
  readonly id: string
  readonly title: string
  readonly type: 'medical' | 'auto' | 'property'
  readonly status: 'draft' | 'analyzing' | 'appeal-ready' | 'submitted' | 'won' | 'lost'
  readonly claimValue: number
  readonly potentialSavings: number
  readonly documents: readonly SecureDocument[]
  readonly analysis: AnalysisResult | null
  readonly appealLetter: string | null
  readonly createdAt: Date
  readonly completedAt: Date | null
  readonly lastModified: Date
}

export interface PaymentFormData {
  readonly cardNumber: string
  readonly expiryDate: string
  readonly cvcCode: string
  readonly cardName: string
  readonly billingZip: string
}

export interface PaymentValidation {
  readonly cardNumber: {
    readonly isValid: boolean
    readonly error?: string
  }
  readonly expiryDate: {
    readonly isValid: boolean
    readonly error?: string
  }
  readonly cvcCode: {
    readonly isValid: boolean
    readonly error?: string
  }
  readonly cardName: {
    readonly isValid: boolean
    readonly error?: string
  }
  readonly billingZip: {
    readonly isValid: boolean
    readonly error?: string
  }
}

export interface ClaimStoreState {
  readonly claims: readonly SecureClaim[]
  readonly currentClaim: SecureClaim | null
  readonly totalSaved: number
  readonly isAnalyzing: boolean
  readonly lastSync: Date | null
}

export interface ClaimStoreActions {
  readonly initializeMockData: () => void
  readonly createNewClaim: () => void
  readonly updateCurrentClaim: (updates: Partial<Omit<SecureClaim, 'id' | 'createdAt'>>) => void
  readonly setCurrentClaim: (claimId: string | null) => void
  readonly uploadDocument: (type: 'policy' | 'denial', file: File) => boolean
  readonly removeDocument: (type: 'policy' | 'denial') => void
  readonly startAnalysis: () => void
  readonly updateAnalysisStep: (step: number) => void
  readonly completeAnalysis: () => void
  readonly generateAppealLetter: (template: string, customizations: Record<string, string>) => void
  readonly updateAppealLetter: (content: string) => void
  readonly completeClaim: (paymentAmount: number) => void
  readonly getClaimById: (id: string) => SecureClaim | undefined
  readonly getTotalClaimsWon: () => number
  readonly getActiveDisputesCount: () => number
}

export type ClaimStore = ClaimStoreState & ClaimStoreActions

export interface DragDropZoneProps {
  readonly type: 'policy' | 'denial'
  readonly label: string
  readonly description: string
  readonly accept?: string
}

export interface AnalysisStepperProps {
  readonly onComplete?: () => void
}

export interface LetterGeneratorProps {
  readonly onTriggerPayment?: () => void
}

export interface PaymentModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSuccess?: () => void
}

export type WorkflowStep = 'dashboard' | 'upload' | 'analysis' | 'appeal' | 'payment'

export interface AnalysisStep {
  readonly id: number
  readonly title: string
  readonly description: string
  readonly icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  readonly duration: number
}

export interface LetterTemplate {
  readonly id: string
  readonly name: string
  readonly type: 'medical' | 'auto' | 'property'
  readonly content: string
}
