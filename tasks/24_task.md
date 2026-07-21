---
status: pending
parallelizable: false
blocked_by: ["3.0", "16.0", "21.0"]
---

<task_context>
<domain>frontend/features</domain>
<type>implementation</type>
<scope>supporting_feature</scope>
<complexity>medium</complexity>
<dependencies>frontend_setup, forms, import_backend</dependencies>
<unblocks>"26.0", "30.0"</unblocks>
</task_context>

# Tarefa 24.0: Interface de Importação e Integração de Contas

## Visão Geral
Desenvolver interface completa para importação de dados bancários e integração com contas no frontend, incluindo upload de arquivos, mapeamento de colunas, preview de dados, monitoramento de progresso e gestão de integrações automáticas.

## Requisitos
- Interface de upload de arquivos multi-formato
- Preview e validação de dados antes da importação
- Mapeamento customizável de colunas
- Monitoramento de progresso em tempo real
- Gestão de duplicatas com interface visual
- Configuração de integrações automáticas
- Histórico de importações com logs
- Interface responsiva e intuitiva
- Drag & drop para arquivos
- Suporte a múltiplos bancos

## Subtarefas
- [ ] 24.1 Interface de upload com drag & drop
- [ ] 24.2 Preview e validação de dados
- [ ] 24.3 Mapeamento de colunas customizável
- [ ] 24.4 Monitoramento de progresso
- [ ] 24.5 Gestão de duplicatas
- [ ] 24.6 Configuração de integrações
- [ ] 24.7 Histórico e logs de importação
- [ ] 24.8 Templates de importação
- [ ] 24.9 Interface de conexão com bancos
- [ ] 24.10 Configurações avançadas

## Sequenciamento
- Bloqueado por: 3.0 (Frontend Setup), 16.0 (Forms), 21.0 (Import Backend)
- Desbloqueia: 26.0 (Performance), 30.0 (Deploy Produção)
- Paralelizável: Não (depende do backend de importação)

## Detalhes de Implementação

### 1. Types para Importação
```ts
// src/types/import.ts
export interface ImportJob {
  id: number
  filename: string
  file_format: 'csv' | 'ofx' | 'qif' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  total_records: number
  imported_count: number
  skipped_count: number
  error_count: number
  started_at?: string
  finished_at?: string
  duration?: number
  success_rate: number
  reference_number: string
  can_be_reverted: boolean
  created_at: string
  updated_at: string
}

export interface ImportLog {
  id: number
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  details: Record<string, any>
  created_at: string
}

export interface ImportPreview {
  headers: string[]
  sample_data: Array<Record<string, string>>
  total_rows: number
  detected_format: string
  column_mapping_suggestions: Record<string, string>
  validation_errors: Array<{
    row: number
    column: string
    error: string
    value: string
  }>
}

export interface ColumnMapping {
  [key: string]: string // field_name -> column_name
}

export interface ImportConfiguration {
  column_mapping: ColumnMapping
  skip_first_row: boolean
  date_format: string
  currency_format: string
  duplicate_handling: 'skip' | 'import' | 'ask'
  category_auto_assignment: boolean
  default_category_id?: number
}

export interface BankIntegration {
  id: number
  bank_name: string
  bank_code: string
  status: 'active' | 'inactive' | 'error'
  last_sync: string
  account_type: 'checking' | 'savings' | 'credit'
  account_number: string
  connection_type: 'api' | 'scraping' | 'manual'
  auto_import_enabled: boolean
  sync_frequency: 'daily' | 'weekly' | 'monthly'
  last_transaction_date: string
  created_at: string
}

export interface ImportTemplate {
  id: number
  name: string
  bank_name: string
  file_format: string
  column_mapping: ColumnMapping
  configuration: ImportConfiguration
  is_default: boolean
  created_at: string
}
```

### 2. Hooks para Importação
```tsx
// src/hooks/useImport.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { ImportJob, ImportLog, ImportPreview, ImportConfiguration } from '@/types/import'

export function useImportJobs() {
  return useQuery({
    queryKey: ['import-jobs'],
    queryFn: () => apiClient.get('/imports'),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useImportJob(id: number) {
  return useQuery({
    queryKey: ['import-jobs', id],
    queryFn: () => apiClient.get(`/imports/${id}`),
    enabled: !!id,
    refetchInterval: (data) => {
      // Auto-refresh while processing
      const status = data?.data?.status
      return status === 'pending' || status === 'processing' ? 2000 : false
    }
  })
}

export function useImportLogs(importId: number) {
  return useQuery({
    queryKey: ['import-jobs', importId, 'logs'],
    queryFn: () => apiClient.get(`/imports/${importId}/logs`),
    enabled: !!importId
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, options }: {
      file: File
      options?: ImportConfiguration
    }) => {
      const formData = new FormData()
      formData.append('file', file)
      if (options) {
        formData.append('options', JSON.stringify(options))
      }

      return apiClient.post('/imports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] })
    }
  })
}

export function usePreviewFile() {
  return useMutation({
    mutationFn: async (file: File): Promise<ImportPreview> => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/imports/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    }
  })
}

export function useRevertImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (importId: number) => apiClient.post(`/imports/${importId}/revert`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}

export function useBankIntegrations() {
  return useQuery({
    queryKey: ['bank-integrations'],
    queryFn: () => apiClient.get('/bank-integrations'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useImportTemplates() {
  return useQuery({
    queryKey: ['import-templates'],
    queryFn: () => apiClient.get('/import-templates'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

### 3. Componente de Upload com Drag & Drop
```tsx
// src/components/import/FileUpload/FileUpload.tsx
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { clsx } from 'clsx'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string[]
  maxSize?: number
  className?: string
}

export function FileUpload({
  onFileSelect,
  accept = ['.csv', '.ofx', '.qif', '.json'],
  maxSize = 10 * 1024 * 1024, // 10MB
  className
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('Arquivo muito grande. Tamanho máximo: 10MB')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Formato de arquivo não suportado')
      } else {
        setError('Erro ao processar arquivo')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/x-ofx': ['.ofx'],
      'application/x-qif': ['.qif'],
      'application/json': ['.json']
    },
    maxSize,
    multiple: false
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        {
          'border-primary-400 bg-primary-50': isDragAccept,
          'border-red-400 bg-red-50': isDragReject,
          'border-gray-300 hover:border-gray-400': !isDragActive,
        },
        className
      )}
    >
      <input {...getInputProps()} />

      <div className="space-y-4">
        {/* Upload Icon */}
        <div className="mx-auto w-12 h-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Upload Text */}
        <div>
          {isDragActive ? (
            <p className="text-primary-600 font-medium">
              Solte o arquivo aqui...
            </p>
          ) : (
            <div>
              <p className="text-gray-600 font-medium mb-1">
                Arraste e solte um arquivo aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500">
                Formatos suportados: CSV, OFX, QIF, JSON (máx. 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Supported Formats */}
        <div className="flex justify-center space-x-4 text-xs text-gray-400">
          <span className="px-2 py-1 bg-gray-100 rounded">CSV</span>
          <span className="px-2 py-1 bg-gray-100 rounded">OFX</span>
          <span className="px-2 py-1 bg-gray-100 rounded">QIF</span>
          <span className="px-2 py-1 bg-gray-100 rounded">JSON</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 4. Preview de Dados
```tsx
// src/components/import/DataPreview/DataPreview.tsx
'use client'

import { useState } from 'react'
import { ImportPreview, ColumnMapping } from '@/types/import'
import { Button } from '@/components/ui/Button/Button'
import { Select } from '@/components/forms/Select/Select'

interface DataPreviewProps {
  preview: ImportPreview
  onMappingChange: (mapping: ColumnMapping) => void
  onConfirm: () => void
  loading?: boolean
}

const FIELD_OPTIONS = [
  { value: '', label: 'Ignorar coluna' },
  { value: 'date', label: 'Data' },
  { value: 'description', label: 'Descrição' },
  { value: 'amount', label: 'Valor' },
  { value: 'category', label: 'Categoria' },
  { value: 'notes', label: 'Observações' },
  { value: 'reference', label: 'Referência' }
]

export function DataPreview({
  preview,
  onMappingChange,
  onConfirm,
  loading = false
}: DataPreviewProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(
    preview.column_mapping_suggestions || {}
  )

  const handleMappingChange = (column: string, field: string) => {
    const newMapping = { ...mapping, [field]: column }
    setMapping(newMapping)
    onMappingChange(newMapping)
  }

  const hasErrors = preview.validation_errors && preview.validation_errors.length > 0
  const requiredFields = ['date', 'description', 'amount']
  const missingRequiredFields = requiredFields.filter(field => !mapping[field])

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Preview do Arquivo
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Formato detectado:</span>
            <span className="ml-2 font-medium">{preview.detected_format.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-blue-700">Total de linhas:</span>
            <span className="ml-2 font-medium">{preview.total_rows}</span>
          </div>
        </div>
      </div>

      {/* Column Mapping */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Mapeamento de Colunas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preview.headers.map((header, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {header}
                </label>
                <Select
                  value={Object.keys(mapping).find(key => mapping[key] === header) || ''}
                  onChange={(field) => handleMappingChange(header, field)}
                  options={FIELD_OPTIONS}
                  placeholder="Selecionar campo"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Required Fields Warning */}
        {missingRequiredFields.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <span className="font-medium">Campos obrigatórios não mapeados:</span>
              {' '}
              {missingRequiredFields.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Data Sample */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Amostra dos Dados ({preview.sample_data.length} primeiras linhas)
        </h4>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {preview.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {preview.sample_data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {preview.headers.map((header, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                    >
                      {row[header] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <div>
          <h4 className="text-md font-semibold text-red-900 mb-4">
            Erros de Validação ({preview.validation_errors.length})
          </h4>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
            {preview.validation_errors.slice(0, 10).map((error, index) => (
              <div key={index} className="text-sm text-red-800 mb-2">
                <span className="font-medium">Linha {error.row}:</span>
                {' '}
                {error.error} (valor: "{error.value}")
              </div>
            ))}
            {preview.validation_errors.length > 10 && (
              <p className="text-sm text-red-600 mt-2">
                E mais {preview.validation_errors.length - 10} erros...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          loading={loading}
          disabled={missingRequiredFields.length > 0}
        >
          Confirmar Importação
        </Button>
      </div>
    </div>
  )
}
```

### 5. Monitor de Progresso
```tsx
// src/components/import/ImportProgress/ImportProgress.tsx
'use client'

import { ImportJob } from '@/types/import'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'

interface ImportProgressProps {
  importJob: ImportJob
  onViewLogs?: () => void
  onRevert?: () => void
}

export function ImportProgress({ importJob, onViewLogs, onRevert }: ImportProgressProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída'
      case 'failed':
        return 'Falhou'
      case 'processing':
        return 'Processando'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  const progressPercentage = importJob.total_records > 0
    ? Math.round(((importJob.imported_count + importJob.skipped_count + importJob.error_count) / importJob.total_records) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {importJob.filename}
          </h3>
          <p className="text-sm text-gray-600">
            Ref: {importJob.reference_number}
          </p>
        </div>

        <span className={clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          getStatusColor(importJob.status)
        )}>
          {getStatusLabel(importJob.status)}
        </span>
      </div>

      {/* Progress Bar */}
      {importJob.status === 'processing' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-lg font-semibold text-gray-900">
            {importJob.total_records}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Importadas</p>
          <p className="text-lg font-semibold text-green-600">
            {importJob.imported_count}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Ignoradas</p>
          <p className="text-lg font-semibold text-yellow-600">
            {importJob.skipped_count}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Erros</p>
          <p className="text-lg font-semibold text-red-600">
            {importJob.error_count}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-sm text-gray-600 space-y-1">
        {importJob.duration && (
          <p>
            <span className="font-medium">Duração:</span> {importJob.duration}s
          </p>
        )}
        {importJob.success_rate !== undefined && (
          <p>
            <span className="font-medium">Taxa de sucesso:</span> {importJob.success_rate}%
          </p>
        )}
        <p>
          <span className="font-medium">Criado:</span>{' '}
          {formatDistanceToNow(new Date(importJob.created_at), {
            addSuffix: true,
            locale: ptBR
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
        {onViewLogs && (
          <button
            onClick={onViewLogs}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver Logs
          </button>
        )}
        {importJob.can_be_reverted && onRevert && (
          <button
            onClick={onRevert}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Reverter
          </button>
        )}
      </div>
    </div>
  )
}
```

### 6. Página Principal de Importação
```tsx
// src/app/import/page.tsx
'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/import/FileUpload/FileUpload'
import { DataPreview } from '@/components/import/DataPreview/DataPreview'
import { ImportProgress } from '@/components/import/ImportProgress/ImportProgress'
import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import {
  useImportJobs,
  usePreviewFile,
  useUploadFile,
  useRevertImport,
  useImportJob,
  useImportLogs
} from '@/hooks/useImport'
import { ImportPreview, ColumnMapping, ImportConfiguration } from '@/types/import'

type Step = 'upload' | 'preview' | 'progress'

export default function ImportPage() {
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [selectedImportId, setSelectedImportId] = useState<number | null>(null)

  const { data: importJobsData, isLoading: loadingJobs } = useImportJobs()
  const { data: logsData } = useImportLogs(selectedImportId || 0)
  const { mutate: previewFile, isPending: previewLoading } = usePreviewFile()
  const { mutate: uploadFile, isPending: uploadLoading } = useUploadFile()
  const { mutate: revertImport } = useRevertImport()

  const importJobs = importJobsData?.data || []

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    previewFile(file, {
      onSuccess: (previewData) => {
        setPreview(previewData)
        setMapping(previewData.column_mapping_suggestions || {})
        setCurrentStep('preview')
      },
      onError: (error) => {
        console.error('Preview failed:', error)
        alert('Erro ao processar arquivo. Verifique o formato e tente novamente.')
      }
    })
  }

  const handleConfirmImport = () => {
    if (!selectedFile) return

    const configuration: ImportConfiguration = {
      column_mapping: mapping,
      skip_first_row: true,
      date_format: 'DD/MM/YYYY',
      currency_format: 'BRL',
      duplicate_handling: 'skip',
      category_auto_assignment: true
    }

    uploadFile({
      file: selectedFile,
      options: configuration
    }, {
      onSuccess: () => {
        setCurrentStep('progress')
        setSelectedFile(null)
        setPreview(null)
        setMapping({})
      }
    })
  }

  const handleStartOver = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setPreview(null)
    setMapping({})
  }

  const handleViewLogs = (importId: number) => {
    setSelectedImportId(importId)
    setShowLogsModal(true)
  }

  const handleRevert = (importId: number) => {
    if (window.confirm('Tem certeza que deseja reverter esta importação? Todas as transações importadas serão removidas.')) {
      revertImport(importId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Importar Transações</h1>
          <p className="text-gray-600 mt-2">
            Importe suas transações bancárias de arquivos CSV, OFX, QIF ou JSON
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {['upload', 'preview', 'progress'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : index < ['upload', 'preview', 'progress'].indexOf(currentStep)
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                }`}>
                  {index < ['upload', 'preview', 'progress'].indexOf(currentStep) ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === step ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step === 'upload' ? 'Upload' : step === 'preview' ? 'Preview' : 'Progresso'}
                </span>
                {index < 2 && (
                  <div className={`flex-1 mx-4 h-0.5 ${
                    index < ['upload', 'preview', 'progress'].indexOf(currentStep)
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Upload Step */}
          {currentStep === 'upload' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Selecionar Arquivo
              </h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                className="w-full"
              />
              {previewLoading && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Analisando arquivo...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && preview && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Configurar Importação
                </h2>
                <Button
                  variant="secondary"
                  onClick={handleStartOver}
                >
                  Voltar
                </Button>
              </div>
              <DataPreview
                preview={preview}
                onMappingChange={setMapping}
                onConfirm={handleConfirmImport}
                loading={uploadLoading}
              />
            </div>
          )}

          {/* Import History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Histórico de Importações
              </h2>
              {currentStep !== 'upload' && (
                <Button
                  variant="secondary"
                  onClick={handleStartOver}
                >
                  Nova Importação
                </Button>
              )}
            </div>

            {loadingJobs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : importJobs.length > 0 ? (
              <div className="space-y-4">
                {importJobs.map(job => (
                  <ImportProgress
                    key={job.id}
                    importJob={job}
                    onViewLogs={() => handleViewLogs(job.id)}
                    onRevert={() => handleRevert(job.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma importação encontrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Logs Modal */}
        <Modal
          isOpen={showLogsModal}
          onClose={() => setShowLogsModal(false)}
          title="Logs de Importação"
          size="lg"
        >
          {logsData?.data && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logsData.data.map((log: any) => (
                <div
                  key={log.id}
                  className={`p-2 rounded text-sm ${
                    log.level === 'error'
                      ? 'bg-red-50 text-red-800'
                      : log.level === 'warning'
                        ? 'bg-yellow-50 text-yellow-800'
                        : 'bg-gray-50 text-gray-800'
                  }`}
                >
                  <span className="font-medium">[{log.level.toUpperCase()}]</span>
                  {' '}
                  {log.message}
                </div>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
```

### 7. Testes dos Componentes
```tsx
// src/components/import/FileUpload/FileUpload.test.tsx
import { render, screen, fireEvent } from '@/utils/test-utils'
import { FileUpload } from './FileUpload'

describe('FileUpload', () => {
  const mockOnFileSelect = jest.fn()

  beforeEach(() => {
    mockOnFileSelect.mockClear()
  })

  it('renders upload area correctly', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />)

    expect(screen.getByText('Arraste e solte um arquivo aqui ou clique para selecionar')).toBeInTheDocument()
    expect(screen.getByText('Formatos suportados: CSV, OFX, QIF, JSON (máx. 10MB)')).toBeInTheDocument()
  })

  it('shows supported format badges', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />)

    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByText('OFX')).toBeInTheDocument()
    expect(screen.getByText('QIF')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
  })

  it('handles file selection through input', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />)

    const file = new File(['test'], 'test.csv', { type: 'text/csv' })
    const input = screen.getByRole('textbox', { hidden: true })

    fireEvent.change(input, { target: { files: [file] } })

    expect(mockOnFileSelect).toHaveBeenCalledWith(file)
  })

  it('shows error for unsupported file type', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />)

    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByRole('textbox', { hidden: true })

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('Formato de arquivo não suportado')).toBeInTheDocument()
    expect(mockOnFileSelect).not.toHaveBeenCalled()
  })

  it('shows error for file too large', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} maxSize={1024} />)

    // Create a file larger than maxSize
    const largeFile = new File(['x'.repeat(2048)], 'large.csv', { type: 'text/csv' })
    const input = screen.getByRole('textbox', { hidden: true })

    fireEvent.change(input, { target: { files: [largeFile] } })

    expect(screen.getByText(/Arquivo muito grande/)).toBeInTheDocument()
    expect(mockOnFileSelect).not.toHaveBeenCalled()
  })
})
```

## Critérios de Sucesso
- [ ] Upload com drag & drop funcionando
- [ ] Preview de dados com validação
- [ ] Mapeamento de colunas customizável
- [ ] Monitoramento de progresso em tempo real
- [ ] Gestão de duplicatas implementada
- [ ] Histórico de importações completo
- [ ] Interface responsiva e intuitiva
- [ ] Tratamento de erros robusto
- [ ] Suporte a múltiplos formatos
- [ ] Testes unitários com cobertura 85%+

## UX e Performance
- Feedback visual imediato
- Progress indicators detalhados
- Error handling graceful
- Loading states em todas as operações
- Responsive design para mobile

## Recursos Necessários
- Desenvolvedor frontend React experiente
- Designer UX para validação da interface
- Tester para casos de upload complexos

## Tempo Estimado
- Interface de upload: 6-8 horas
- Preview e validação: 8-10 horas
- Mapeamento de colunas: 6-8 horas
- Monitor de progresso: 6-8 horas
- Gestão de histórico: 6-8 horas
- Interface de integrações: 8-10 horas
- Testes e otimização: 8-10 horas
- **Total**: 6-8 dias de trabalho