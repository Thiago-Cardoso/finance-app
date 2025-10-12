import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from './Form'

const testSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido')
})

type TestFormData = z.infer<typeof testSchema>

const TestFormComponent = ({
  onSubmit,
  disabled = false
}: {
  onSubmit: jest.Mock
  disabled?: boolean
}) => {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: '',
      email: ''
    }
  })

  return (
    <Form form={form} onSubmit={onSubmit} disabled={disabled}>
      <input
        {...form.register('name')}
        data-testid="name-input"
        placeholder="Nome"
      />
      <input
        {...form.register('email')}
        data-testid="email-input"
        placeholder="Email"
      />
      <button type="submit" data-testid="submit-button">
        Enviar
      </button>
    </Form>
  )
}

describe('Form', () => {
  it('renders form with children', () => {
    const onSubmit = jest.fn()
    render(<TestFormComponent onSubmit={onSubmit} />)

    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('calls onSubmit with valid data', async () => {
    const onSubmit = jest.fn()
    render(<TestFormComponent onSubmit={onSubmit} />)

    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('submit-button')

    fireEvent.change(nameInput, { target: { value: 'João Silva' } })
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@example.com'
      }, expect.anything())
    })
  })

  it('does not call onSubmit with invalid data', async () => {
    const onSubmit = jest.fn()
    render(<TestFormComponent onSubmit={onSubmit} />)

    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('submit-button')

    // Leave name empty (invalid)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  it('disables form when disabled prop is true', () => {
    const onSubmit = jest.fn()
    render(<TestFormComponent onSubmit={onSubmit} disabled />)

    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('submit-button')

    expect(nameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('applies custom className', () => {
    const onSubmit = jest.fn()
    const form = useForm<TestFormData>()

    const { container } = render(
      <Form form={form} onSubmit={onSubmit} className="custom-form-class">
        <div>Content</div>
      </Form>
    )

    const formElement = container.querySelector('form')
    expect(formElement).toHaveClass('custom-form-class')
  })

  it('has noValidate attribute by default', () => {
    const onSubmit = jest.fn()
    const form = useForm<TestFormData>()

    const { container } = render(
      <Form form={form} onSubmit={onSubmit}>
        <div>Content</div>
      </Form>
    )

    const formElement = container.querySelector('form')
    expect(formElement).toHaveAttribute('noValidate')
  })

  it('can enable browser validation when noValidate is false', () => {
    const onSubmit = jest.fn()
    const form = useForm<TestFormData>()

    const { container } = render(
      <Form form={form} onSubmit={onSubmit} noValidate={false}>
        <div>Content</div>
      </Form>
    )

    const formElement = container.querySelector('form')
    expect(formElement).not.toHaveAttribute('noValidate')
  })

  it('handles async onSubmit', async () => {
    const onSubmit = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )
    render(<TestFormComponent onSubmit={onSubmit} />)

    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('submit-button')

    fireEvent.change(nameInput, { target: { value: 'João Silva' } })
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })
})
