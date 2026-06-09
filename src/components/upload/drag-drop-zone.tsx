'use client'

import React, { useCallback, useState } from 'react'
import { useClaimStore } from '@/stores/claim-store'
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { formatFileSize, validateFileUpload } from '@/lib/utils'
import type { DragDropZoneProps } from '@/types/claim'

export default function DragDropZone({ type, label, description, accept = '.pdf,.png,.jpg,.jpeg' }: DragDropZoneProps) {
  const { currentClaim, uploadDocument, removeDocument } = useClaimStore()
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const existingDocument = currentClaim?.documents.find(doc => doc.type === type)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setIsUploading(true)

    try {
      const validation = validateFileUpload(file)
      if (!validation.isValid) {
        setError(validation.error || 'File validation failed')
        return
      }

      // Simulate upload delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))

      const success = uploadDocument(type, file)
      if (!success) {
        setError('Failed to upload file. Please try again.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('An unexpected error occurred during upload.')
    } finally {
      setIsUploading(false)
    }
  }, [type, uploadDocument])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (isUploading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile, isUploading])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isUploading) {
      setIsDragActive(true)
    }
  }, [isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragActive(false)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && !isUploading) {
      handleFile(files[0])
    }
    // Clear the input value to allow re-selecting the same file
    e.target.value = ''
  }, [handleFile, isUploading])

  const handleRemove = useCallback(() => {
    if (!isUploading) {
      removeDocument(type)
      setError(null)
    }
  }, [removeDocument, type, isUploading])

  const getZoneClasses = useCallback(() => {
    let classes = 'midnight-upload-zone rounded-xl p-6 text-center transition-all duration-300 '
    
    if (isUploading) {
      classes += 'opacity-50 pointer-events-none '
    } else if (isDragActive) {
      classes += 'drag-active '
    } else if (existingDocument) {
      classes += 'has-file border-midnight-success bg-midnight-success/5 '
    } else if (error) {
      classes += 'border-midnight-error bg-midnight-error/5 '
    }
    
    return classes
  }, [isDragActive, existingDocument, error, isUploading])

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-midnight-text mb-2">
        {label}
      </label>
      
      <div
        className={getZoneClasses()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label={`Upload zone for ${label}`}
      >
        {existingDocument && !isUploading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <DocumentIcon className="h-8 w-8 text-midnight-success" />
              <CheckCircleIcon className="h-6 w-6 text-midnight-success animate-pulse-emerald" />
            </div>
            
            <div>
              <p className="font-medium text-midnight-text">{existingDocument.name}</p>
              <p className="text-sm text-midnight-textMuted">
                {formatFileSize(existingDocument.size)} • Uploaded Successfully
              </p>
            </div>
            
            <div className="security-indicator">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              <span>File validated and secure</span>
            </div>
            
            <button
              onClick={handleRemove}
              className="text-midnight-textMuted hover:text-midnight-error transition-colors text-sm underline"
              type="button"
            >
              Remove and upload different file
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id={`file-input-${type}`}
              disabled={isUploading}
              aria-label={`File input for ${label}`}
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-midnight-emerald"></div>
                ) : isDragActive ? (
                  <ArrowUpTrayIcon className="h-12 w-12 text-midnight-emerald animate-bounce" />
                ) : (
                  <DocumentIcon className="h-12 w-12 text-midnight-textMuted" />
                )}
              </div>
              
              <div>
                <p className="text-lg font-medium text-midnight-text">
                  {isUploading 
                    ? 'Validating and uploading...'
                    : isDragActive 
                      ? 'Drop your file here' 
                      : 'Drag and drop your file'
                  }
                </p>
                <p className="text-midnight-textMuted mt-1">{description}</p>
              </div>
              
              {!isUploading && (
                <div className="flex items-center justify-center space-x-2 text-sm text-midnight-textMuted">
                  <span>or</span>
                  <label
                    htmlFor={`file-input-${type}`}
                    className="text-midnight-emerald hover:text-midnight-emeraldHover cursor-pointer font-medium underline"
                  >
                    browse files
                  </label>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-xs text-midnight-textMuted">
                  Supports PDF, PNG, JPG (max 10MB)
                </p>
                <div className="security-indicator">
                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                  <span>All uploads are validated and secure</span>
                </div>
              </div>
            </div>
          </>
        )}
        
        {error && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-midnight-error">
            <ExclamationCircleIcon className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
