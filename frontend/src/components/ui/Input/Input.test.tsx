import { render, screen, fireEvent } from '@/utils/test-utils'
import { Input } from './Input'

describe('Input', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows required asterisk when required is true', () => {
    render(<Input label="Email" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('*')).toHaveClass('text-red-500')
  })

  it('renders error message when error prop is provided', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toHaveClass('text-red-600')
  })

  it('applies error border style when error is present', () => {
    render(<Input error="Error message" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  it('applies default border style when no error', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-gray-300')
  })

  it('handles input changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('updates value when controlled', () => {
    const { rerender } = render(<Input value="initial" readOnly />)
    expect(screen.getByRole('textbox')).toHaveValue('initial')

    rerender(<Input value="updated" readOnly />)
    expect(screen.getByRole('textbox')).toHaveValue('updated')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('cursor-not-allowed bg-gray-100')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} />)

    expect(ref).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  describe('input types', () => {
    it('renders as text input by default', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('renders as email input when type is email', () => {
      render(<Input type="email" />)
      // Email inputs don't have a specific role, check by type attribute
      const input = document.querySelector('input[type="email"]')
      expect(input).toBeInTheDocument()
    })

    it('renders as password input when type is password', () => {
      render(<Input type="password" />)
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('renders as number input when type is number', () => {
      render(<Input type="number" />)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })
  })

  it('passes through HTML input attributes', () => {
    render(
      <Input
        placeholder="Enter value"
        name="test-input"
        maxLength={10}
        aria-label="Test input"
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter value')
    expect(input).toHaveAttribute('name', 'test-input')
    expect(input).toHaveAttribute('maxLength', '10')
    expect(input).toHaveAttribute('aria-label', 'Test input')
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)

    const input = screen.getByRole('textbox')

    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })
})
