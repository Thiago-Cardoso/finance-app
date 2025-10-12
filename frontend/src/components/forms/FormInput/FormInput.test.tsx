import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { FormInput } from './FormInput'

const testSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres')
})

type TestFormData = z.infer<typeof testSchema>

const TestFormInputComponent = ({
  variant = 'default',
  hasError = false,
  ...props
}: {
  variant?: 'default' | 'error'
  hasError?: boolean
  type?: string
  disabled?: boolean
  placeholder?: string
}) => {
  const methods = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: { username: hasError ? '' : 'testuser' }
  })

  useEffect(() => {
    if (hasError) {
      methods.setError('username', { message: 'Username deve ter pelo menos 3 caracteres' })
    }
  }, [hasError, methods])

  return (
    <FormProvider {...methods}>
      <FormInput name="username" variant={variant} {...props} />
    </FormProvider>
  )
}

describe('FormInput', () => {
  it('renders input correctly', () => {
    render(<TestFormInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'username')
  })

  it('applies default variant styling', () => {
    render(<TestFormInputComponent variant="default" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-gray-300')
    expect(input).toHaveClass('focus:border-blue-500')
  })

  it('applies error variant styling when variant is error', () => {
    render(<TestFormInputComponent variant="error" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-300')
  })

  it('applies error styling automatically when field has error', () => {
    render(<TestFormInputComponent hasError />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-300')
  })

  it('handles user input', () => {
    render(<TestFormInputComponent />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'newusername' } })

    expect(input.value).toBe('newusername')
  })

  it('is disabled when disabled prop is true', () => {
    render(<TestFormInputComponent disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
  })

  it('supports different input types', () => {
    const { rerender } = render(<TestFormInputComponent type="text" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')

    rerender(<TestFormInputComponent type="email" />)
    const emailInput = screen.getByRole('textbox')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('applies custom className', () => {
    const TestCustomClassName = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <FormInput name="username" className="custom-input-class" />
        </FormProvider>
      )
    }

    render(<TestCustomClassName />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input-class')
  })

  it('renders placeholder text', () => {
    render(<TestFormInputComponent placeholder="Digite seu username" />)

    const input = screen.getByPlaceholderText('Digite seu username')
    expect(input).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()

    const TestRef = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <FormInput name="username" ref={ref} />
        </FormProvider>
      )
    }

    render(<TestRef />)

    expect(ref).toHaveBeenCalled()
  })

  it('has correct dark mode classes', () => {
    render(<TestFormInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('dark:bg-gray-800')
    expect(input).toHaveClass('dark:text-gray-100')
    expect(input).toHaveClass('dark:border-gray-600')
  })

  it('applies dark mode error styling', () => {
    render(<TestFormInputComponent hasError />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('dark:border-red-400')
    expect(input).toHaveClass('dark:focus:border-red-400')
  })

  it('passes through HTML input attributes', () => {
    const TestHTMLAttributes = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <FormInput
            name="username"
            autoComplete="username"
            maxLength={20}
            required
          />
        </FormProvider>
      )
    }

    render(<TestHTMLAttributes />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('autoComplete', 'username')
    expect(input).toHaveAttribute('maxLength', '20')
    expect(input).toHaveAttribute('required')
  })

  it('has proper focus styles', () => {
    render(<TestFormInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('focus:outline-none')
    expect(input).toHaveClass('focus:ring-2')
    expect(input).toHaveClass('focus:ring-blue-500')
  })

  it('integrates with React Hook Form', () => {
    render(<TestFormInputComponent />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    // TestFormInputComponent has default value 'testuser'
    expect(input.value).toBe('testuser')

    fireEvent.change(input, { target: { value: 'newvalue' } })
    expect(input.value).toBe('newvalue')
  })

  it('displays with correct padding', () => {
    render(<TestFormInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('px-3')
    expect(input).toHaveClass('py-2')
  })

  it('has rounded borders', () => {
    render(<TestFormInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('rounded-md')
  })
})
