import { render, screen, fireEvent } from '@/utils/test-utils'
import { Button } from './Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state with spinner', () => {
    render(<Button loading>Loading</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
    // Check for spinner SVG
    const spinner = button.querySelector('svg.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when loading', () => {
    render(<Button loading>Loading</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  describe('variants', () => {
    it('applies primary variant classes correctly', () => {
      render(<Button variant="primary">Primary</Button>)

      expect(screen.getByRole('button')).toHaveClass('bg-primary-600')
    })

    it('applies secondary variant classes correctly', () => {
      render(<Button variant="secondary">Secondary</Button>)

      expect(screen.getByRole('button')).toHaveClass('bg-gray-200')
    })

    it('applies danger variant classes correctly', () => {
      render(<Button variant="danger">Delete</Button>)

      expect(screen.getByRole('button')).toHaveClass('bg-red-600')
    })

    it('applies ghost variant classes correctly', () => {
      render(<Button variant="ghost">Ghost</Button>)

      expect(screen.getByRole('button')).toHaveClass('text-gray-600')
    })
  })

  describe('sizes', () => {
    it('applies small size classes correctly', () => {
      render(<Button size="sm">Small</Button>)

      expect(screen.getByRole('button')).toHaveClass('px-3 py-2 text-sm')
    })

    it('applies medium size classes correctly (default)', () => {
      render(<Button size="md">Medium</Button>)

      expect(screen.getByRole('button')).toHaveClass('px-4 py-2 text-base')
    })

    it('applies large size classes correctly', () => {
      render(<Button size="lg">Large</Button>)

      expect(screen.getByRole('button')).toHaveClass('px-6 py-3 text-lg')
    })
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Button ref={ref}>Button</Button>)

    expect(ref).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>)

    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('passes through HTML button attributes', () => {
    render(
      <Button type="submit" aria-label="Submit form">
        Submit
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })
})
