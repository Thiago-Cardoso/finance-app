import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { Textarea } from './Textarea'

const testSchema = z.object({
  notes: z.string().max(500, 'Notas não podem ter mais de 500 caracteres')
})

type TestFormData = z.infer<typeof testSchema>

const TestTextareaComponent = ({
  variant = 'default',
  hasError = false,
  ...props
}: {
  variant?: 'default' | 'error'
  hasError?: boolean
  disabled?: boolean
  placeholder?: string
  rows?: number
}) => {
  const methods = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: { notes: '' }
  })

  useEffect(() => {
    if (hasError) {
      methods.setError('notes', { message: 'Notas não podem ter mais de 500 caracteres' })
    }
  }, [hasError, methods])

  return (
    <FormProvider {...methods}>
      <Textarea name="notes" variant={variant} {...props} />
    </FormProvider>
  )
}

describe('Textarea', () => {
  it('renders textarea correctly', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('id', 'notes')
  })

  it('applies default variant styling', () => {
    render(<TestTextareaComponent variant="default" />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-gray-300')
    expect(textarea).toHaveClass('focus:border-blue-500')
  })

  it('applies error variant styling when variant is error', () => {
    render(<TestTextareaComponent variant="error" />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-red-300')
  })

  it('applies error styling automatically when field has error', () => {
    render(<TestTextareaComponent hasError />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-red-300')
    expect(textarea).toHaveClass('dark:border-red-400')
  })

  it('handles user input', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test notes content' } })

    expect(textarea.value).toBe('Test notes content')
  })

  it('handles multi-line input', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    const multilineText = 'Line 1\nLine 2\nLine 3'
    fireEvent.change(textarea, { target: { value: multilineText } })

    expect(textarea.value).toBe(multilineText)
  })

  it('is disabled when disabled prop is true', () => {
    render(<TestTextareaComponent disabled />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass('disabled:cursor-not-allowed')
  })

  it('applies custom className', () => {
    const TestCustomClassName = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <Textarea name="notes" className="custom-textarea-class" />
        </FormProvider>
      )
    }

    render(<TestCustomClassName />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-textarea-class')
  })

  it('renders placeholder text', () => {
    render(<TestTextareaComponent placeholder="Digite suas notas aqui" />)

    expect(screen.getByPlaceholderText('Digite suas notas aqui')).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()

    const TestRef = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <Textarea name="notes" ref={ref} />
        </FormProvider>
      )
    }

    render(<TestRef />)

    expect(ref).toHaveBeenCalled()
  })

  it('has correct dark mode classes', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('dark:bg-gray-800')
    expect(textarea).toHaveClass('dark:text-gray-100')
    expect(textarea).toHaveClass('dark:border-gray-600')
  })

  it('applies dark mode error styling', () => {
    render(<TestTextareaComponent hasError />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('dark:border-red-400')
    expect(textarea).toHaveClass('dark:focus:border-red-400')
  })

  it('respects rows prop', () => {
    render(<TestTextareaComponent rows={10} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '10')
  })

  it('passes through HTML textarea attributes', () => {
    const TestHTMLAttributes = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <Textarea
            name="notes"
            maxLength={500}
            autoComplete="off"
            required
          />
        </FormProvider>
      )
    }

    render(<TestHTMLAttributes />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('maxLength', '500')
    expect(textarea).toHaveAttribute('autoComplete', 'off')
    expect(textarea).toHaveAttribute('required')
  })

  it('has proper focus styles', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('focus:outline-none')
    expect(textarea).toHaveClass('focus:ring-2')
    expect(textarea).toHaveClass('focus:ring-blue-500')
  })

  it('integrates with React Hook Form', () => {
    // Use the existing test helper with a default value
    const TestWithValue = ({
      variant = 'default',
      hasError = false,
      ...props
    }: {
      variant?: 'default' | 'error'
      hasError?: boolean
      disabled?: boolean
      placeholder?: string
      rows?: number
    }) => {
      const methods = useForm<TestFormData>({
        resolver: zodResolver(testSchema),
        defaultValues: { notes: 'Initial notes' }
      })

      useEffect(() => {
        if (hasError) {
          methods.setError('notes', { message: 'Notas não podem ter mais de 500 caracteres' })
        }
      }, [hasError, methods])

      return (
        <FormProvider {...methods}>
          <Textarea name="notes" variant={variant} {...props} />
        </FormProvider>
      )
    }

    render(<TestWithValue />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('Initial notes')

    fireEvent.change(textarea, { target: { value: 'Updated notes' } })
    expect(textarea.value).toBe('Updated notes')
  })

  it('displays with correct padding', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('px-3')
    expect(textarea).toHaveClass('py-2')
  })

  it('has rounded borders', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('rounded-md')
  })

  it('has block display and full width', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('block')
    expect(textarea).toHaveClass('w-full')
  })

  it('handles very long text input', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    const longText = 'A'.repeat(1000)
    fireEvent.change(textarea, { target: { value: longText } })

    expect(textarea.value).toBe(longText)
  })

  it('handles special characters', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    const specialText = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./'
    fireEvent.change(textarea, { target: { value: specialText } })

    expect(textarea.value).toBe(specialText)
  })

  it('handles line breaks and formatting', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    const formattedText = 'First paragraph.\n\nSecond paragraph with    spaces.\n\nThird paragraph.'
    fireEvent.change(textarea, { target: { value: formattedText } })

    expect(textarea.value).toBe(formattedText)
  })

  it('can be focused and blurred', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox')

    textarea.focus()
    expect(textarea).toHaveFocus()

    textarea.blur()
    expect(textarea).not.toHaveFocus()
  })

  it('has shadow styling', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('shadow-sm')
  })

  it('has transition animation', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('transition-colors')
    expect(textarea).toHaveClass('duration-200')
  })

  it('handles empty input', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '' } })

    expect(textarea.value).toBe('')
  })

  it('preserves whitespace in input', () => {
    render(<TestTextareaComponent />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    const textWithSpaces = '   Leading and trailing spaces   '
    fireEvent.change(textarea, { target: { value: textWithSpaces } })

    expect(textarea.value).toBe(textWithSpaces)
  })
})
