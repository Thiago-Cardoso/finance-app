import { render, screen } from '@/utils/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from './FormField'

const testSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'Nome é obrigatório')
})

type TestFormData = z.infer<typeof testSchema>

const TestFormFieldComponent = ({
  hasError = false,
  label = 'Email',
  description = 'Digite seu email',
  required = false
}: {
  hasError?: boolean
  label?: string
  description?: string
  required?: boolean
}) => {
  const methods = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      email: hasError ? '' : 'test@example.com',
      name: ''
    },
    // Trigger validation immediately if hasError is true
    mode: hasError ? 'onChange' : 'onSubmit'
  })

  // Trigger validation if we want to show errors
  if (hasError) {
    methods.trigger()
  }

  return (
    <FormProvider {...methods}>
      <FormField
        name="email"
        label={label}
        description={description}
        required={required}
      >
        <input
          {...methods.register('email')}
          data-testid="email-input"
          placeholder="email@example.com"
        />
      </FormField>
    </FormProvider>
  )
}

describe('FormField', () => {
  it('renders field with label', () => {
    render(<TestFormFieldComponent label="Email Address" />)

    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
  })

  it('renders field without label when not provided', () => {
    render(<TestFormFieldComponent label={undefined} />)

    expect(screen.queryByRole('label')).not.toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
  })

  it('displays required asterisk when required is true', () => {
    render(<TestFormFieldComponent required />)

    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveClass('text-red-500')
  })

  it('does not display required asterisk when required is false', () => {
    render(<TestFormFieldComponent required={false} />)

    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('renders description text', () => {
    const description = 'Digite seu melhor email'
    render(<TestFormFieldComponent description={description} />)

    expect(screen.getByText(description)).toBeInTheDocument()
    expect(screen.getByText(description)).toHaveClass('text-gray-500')
  })

  it('does not render description when not provided', () => {
    const TestNoDescription = () => {
      const methods = useForm<TestFormData>()
      return (
        <FormProvider {...methods}>
          <FormField name="email" label="Email">
            <input {...methods.register('email')} data-testid="email-input" />
          </FormField>
        </FormProvider>
      )
    }

    render(<TestNoDescription />)

    expect(screen.queryByText('Digite seu email')).not.toBeInTheDocument()
  })

  it('displays error message when field has error', async () => {
    const TestWithError = () => {
      const methods = useForm<TestFormData>({
        resolver: zodResolver(testSchema),
        defaultValues: { email: '', name: '' }
      })

      // Set error manually
      methods.setError('email', { message: 'Email inválido' })

      return (
        <FormProvider {...methods}>
          <FormField name="email" label="Email">
            <input {...methods.register('email')} data-testid="email-input" />
          </FormField>
        </FormProvider>
      )
    }

    render(<TestWithError />)

    expect(screen.getByText('Email inválido')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const TestWithClassName = () => {
      const methods = useForm<TestFormData>()
      return (
        <FormProvider {...methods}>
          <FormField name="email" className="custom-field-class">
            <input {...methods.register('email')} />
          </FormField>
        </FormProvider>
      )
    }

    const { container } = render(<TestWithClassName />)

    expect(container.querySelector('.custom-field-class')).toBeInTheDocument()
  })

  it('associates label with input via htmlFor and id', () => {
    const TestLabelAssociation = () => {
      const methods = useForm<TestFormData>()
      return (
        <FormProvider {...methods}>
          <FormField name="email" label="Email">
            <input {...methods.register('email')} id="email" />
          </FormField>
        </FormProvider>
      )
    }

    render(<TestLabelAssociation />)

    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email')
  })

  it('renders children correctly', () => {
    const TestChildren = () => {
      const methods = useForm<TestFormData>()
      return (
        <FormProvider {...methods}>
          <FormField name="email" label="Email">
            <div data-testid="custom-child">Custom Input</div>
          </FormField>
        </FormProvider>
      )
    }

    render(<TestChildren />)

    expect(screen.getByTestId('custom-child')).toBeInTheDocument()
    expect(screen.getByText('Custom Input')).toBeInTheDocument()
  })

  it('handles nested field names', () => {
    const nestedSchema = z.object({
      user: z.object({
        email: z.string().email()
      })
    })

    type NestedFormData = z.infer<typeof nestedSchema>

    const TestNested = () => {
      const methods = useForm<NestedFormData>({
        resolver: zodResolver(nestedSchema)
      })

      return (
        <FormProvider {...methods}>
          <FormField name="user.email" label="User Email">
            <input {...methods.register('user.email')} />
          </FormField>
        </FormProvider>
      )
    }

    render(<TestNested />)

    expect(screen.getByText('User Email')).toBeInTheDocument()
  })

  it('has correct ARIA attributes', () => {
    const TestARIA = () => {
      const methods = useForm<TestFormData>()
      methods.setError('email', { message: 'Email inválido' })

      return (
        <FormProvider {...methods}>
          <FormField name="email" label="Email">
            <input {...methods.register('email')} id="email" />
          </FormField>
        </FormProvider>
      )
    }

    render(<TestARIA />)

    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveTextContent('Email inválido')
  })

  it('applies dark mode classes to label', () => {
    const TestDarkLabel = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <FormField name="email" label="Email">
            <input {...methods.register('email')} />
          </FormField>
        </FormProvider>
      )
    }

    render(<TestDarkLabel />)

    const label = screen.getByText('Email')
    expect(label).toHaveClass('dark:text-gray-300')
  })

  it('applies dark mode classes to description', () => {
    const TestDarkDescription = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <FormField name="email" description="Your email address">
            <input {...methods.register('email')} />
          </FormField>
        </FormProvider>
      )
    }

    render(<TestDarkDescription />)

    const description = screen.getByText('Your email address')
    expect(description).toHaveClass('dark:text-gray-400')
  })

  it('applies dark mode classes to error message', () => {
    const TestDarkError = () => {
      const methods = useForm<TestFormData>()
      methods.setError('email', { message: 'Email inválido' })

      return (
        <FormProvider {...methods}>
          <FormField name="email">
            <input {...methods.register('email')} />
          </FormField>
        </FormProvider>
      )
    }

    render(<TestDarkError />)

    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toHaveClass('dark:text-red-400')
  })
})
