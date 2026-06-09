import DOMPurify from 'dompurify'

/**
 * Formats a number as currency (USD)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '$0'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

/**
 * Formats a date for display
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Formats file size in human readable format
 * @param bytes - Size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 Bytes'
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i] || 'Bytes'}`
}

/**
 * Combines class names safely
 * @param classes - Array of class names (can include undefined/null)
 * @returns Combined class string
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof dirty !== 'string') {
    return ''
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: [],
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img', 'svg'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style', 'src', 'href']
  })
}

/**
 * Validates and masks credit card number
 * @param cardNumber - Raw card number string
 * @returns Object with validation result and masked number
 */
export function validateAndMaskCardNumber(cardNumber: string): {
  isValid: boolean
  masked: string
  cardType: string | null
} {
  // Remove all non-digits
  const cleaned = cardNumber.replace(/\D/g, '')
  
  if (cleaned.length === 0) {
    return { isValid: false, masked: '', cardType: null }
  }
  
  // Luhn algorithm validation
  const isValid = isValidCardNumber(cleaned)
  
  // Determine card type
  const cardType = getCardType(cleaned)
  
  // Mask the number (show only last 4 digits)
  const masked = cleaned.length > 4 
    ? `•••• •••• •••• ${cleaned.slice(-4)}`
    : cleaned
  
  return { isValid, masked, cardType }
}

/**
 * Luhn algorithm implementation for credit card validation
 * @param cardNumber - Credit card number string (digits only)
 * @returns True if valid, false otherwise
 */
function isValidCardNumber(cardNumber: string): boolean {
  if (!/^\d+$/.test(cardNumber) || cardNumber.length < 13 || cardNumber.length > 19) {
    return false
  }
  
  let sum = 0
  let isEven = false
  
  // Process digits from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10)
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

/**
 * Determines credit card type based on number
 * @param cardNumber - Credit card number string (digits only)
 * @returns Card type or null
 */
function getCardType(cardNumber: string): string | null {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/
  }
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return type
    }
  }
  
  return null
}

/**
 * Validates CVV code
 * @param cvv - CVV string
 * @param cardType - Type of credit card
 * @returns True if valid, false otherwise
 */
export function isValidCvv(cvv: string, cardType: string | null): boolean {
  const cleaned = cvv.replace(/\D/g, '')
  
  if (cardType === 'amex') {
    return cleaned.length === 4
  }
  
  return cleaned.length === 3
}

/**
 * Validates expiry date
 * @param expiry - Expiry date in MM/YY format
 * @returns True if valid and not expired, false otherwise
 */
export function isValidExpiryDate(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  
  const month = parseInt(match[1], 10)
  const year = parseInt(match[2], 10) + 2000
  
  if (month < 1 || month > 12) return false
  
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false
  }
  
  return true
}

/**
 * Securely generates a random ID
 * @returns Random alphanumeric string
 */
export function generateSecureId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Validates file type and size for security
 * @param file - File object to validate
 * @returns Validation result object
 */
export function validateFileUpload(file: File): {
  isValid: boolean
  error: string | null
} {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ]
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only PDF and image files (PNG, JPG) are allowed' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Debounces a function call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => func(...args), wait)
  }
}
