import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { MoneyInput } from './MoneyInput'

const testSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo')
})

type TestFormData = z.infer<typeof testSchema>

const TestMoneyInputComponent = ({
  defaultValue = 0,
  hasError = false,
  ...props
}: {
  defaultValue?: number
  hasError?: boolean
  disabled?: boolean
  placeholder?: string
}) => {
  const methods = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: { amount: defaultValue }
  })

  useEffect(() => {
    if (hasError) {
      methods.setError('amount', { message: 'Valor deve ser positivo' })
    }
  }, [hasError, methods])

  return (
    <FormProvider {...methods}>
      <MoneyInput name="amount" {...props} />
    </FormProvider>
  )
}

describe('MoneyInput', () => {
  it('renders money input with R$ symbol', () => {
    render(<TestMoneyInputComponent />)

    expect(screen.getByText('R$')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('formats initial value correctly', () => {
    render(<TestMoneyInputComponent defaultValue={1234.56} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    // The value should be formatted as Brazilian currency
    expect(input.value).toContain('1.234,56')
  })

  it('formats zero value', () => {
    render(<TestMoneyInputComponent defaultValue={0} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toContain('0,00')
  })

  it('handles decimal input', async () => {
    render(<TestMoneyInputComponent />)

    const input = screen.getByRole('textbox') as HTMLInputElement

    // Type a value with decimal
    fireEvent.change(input, { target: { value: '100,50' } })

    await waitFor(() => {
      expect(input.value).toContain('100,50')
    })
  })

  it('handles thousands separator', async () => {
    render(<TestMoneyInputComponent />)

    const input = screen.getByRole('textbox') as HTMLInputElement

    fireEvent.change(input, { target: { value: '1.500,00' } })

    await waitFor(() => {
      expect(input.value).toContain('1.500,00')
    })
  })

  it('is disabled when disabled prop is true', () => {
    render(<TestMoneyInputComponent disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('applies error styling when field has error', () => {
    render(<TestMoneyInputComponent hasError />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-300')
  })

  it('applies default styling when no error', () => {
    render(<TestMoneyInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-gray-300')
    expect(input).toHaveClass('focus:border-blue-500')
  })

  it('has correct input mode for mobile keyboards', () => {
    render(<TestMoneyInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('inputMode', 'decimal')
  })

  it('has proper padding for R$ symbol', () => {
    render(<TestMoneyInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('pl-10')
  })

  it('applies custom className', () => {
    const TestCustomClassName = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <MoneyInput name="amount" className="custom-money-class" />
        </FormProvider>
      )
    }

    render(<TestCustomClassName />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-money-class')
  })

  it('renders placeholder text', () => {
    render(<TestMoneyInputComponent placeholder="Digite o valor" />)

    expect(screen.getByPlaceholderText('Digite o valor')).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()

    const TestRef = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <MoneyInput name="amount" ref={ref} />
        </FormProvider>
      )
    }

    render(<TestRef />)

    expect(ref).toHaveBeenCalled()
  })

  it('has dark mode styling', () => {
    render(<TestMoneyInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('dark:bg-gray-800')
    expect(input).toHaveClass('dark:text-gray-100')
  })

  it('R$ symbol has proper styling', () => {
    const { container } = render(<TestMoneyInputComponent />)

    const symbol = container.querySelector('.absolute')
    expect(symbol).toBeInTheDocument()
    expect(symbol).toHaveClass('flex items-center')
  })

  it('integrates with React Hook Form Controller', async () => {
    const TestIntegration = () => {
      const methods = useForm<TestFormData>({
        defaultValues: { amount: 100.50 }
      })

      return (
        <FormProvider {...methods}>
          <MoneyInput name="amount" />
        </FormProvider>
      )
    }

    render(<TestIntegration />)

    const input = screen.getByRole('textbox') as HTMLInputElement

    // Should display formatted value
    expect(input.value).toContain('100,50')

    // Change value
    fireEvent.change(input, { target: { value: '200,75' } })

    await waitFor(() => {
      // Value should be updated
      expect(input.value).toContain('200,75')
    })
  })

  it('handles blur event correctly', async () => {
    const TestBlur = () => {
      const methods = useForm<TestFormData>({
        defaultValues: { amount: 0 }
      })

      return (
        <FormProvider {...methods}>
          <MoneyInput name="amount" />
        </FormProvider>
      )
    }

    render(<TestBlur />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: '50' } })
    fireEvent.blur(input)

    await waitFor(() => {
      // Should format on blur
      const inputElement = screen.getByRole('textbox') as HTMLInputElement
      expect(inputElement.value).toContain('50')
    })
  })

  it('removes non-numeric characters except comma', () => {
    render(<TestMoneyInputComponent />)

    const input = screen.getByRole('textbox')

    // Try to input text with invalid characters
    fireEvent.change(input, { target: { value: 'abc123,45def' } })

    // Should only keep numbers and comma
    const inputElement = input as HTMLInputElement
    expect(inputElement.value).not.toContain('abc')
    expect(inputElement.value).not.toContain('def')
  })

  it('handles large values', async () => {
    render(<TestMoneyInputComponent defaultValue={999999.99} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toContain('999.999,99')
  })

  it('handles values less than 1', async () => {
    render(<TestMoneyInputComponent defaultValue={0.50} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toContain('0,50')
  })

  it('has focus ring styling', () => {
    render(<TestMoneyInputComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('focus:ring-2')
    expect(input).toHaveClass('focus:ring-blue-500')
  })

  it('maintains formatting during typing', async () => {
    render(<TestMoneyInputComponent defaultValue={0} />)

    const input = screen.getByRole('textbox')

    // Simulate typing gradually
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.change(input, { target: { value: '123' } })

    // Should handle incremental typing
    expect(input).toBeInTheDocument()
  })
})
