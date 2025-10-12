import { render, screen } from '@testing-library/react'
import { BaseChart } from './BaseChart'

describe('BaseChart', () => {
  const MockChild = () => <div data-testid="mock-chart">Mock Chart</div>

  it('renders children when not loading or error', () => {
    render(
      <BaseChart height={300}>
        <MockChild />
      </BaseChart>
    )

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <BaseChart loading={true} height={300}>
        <MockChild />
      </BaseChart>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading chart')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-chart')).not.toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <BaseChart error="Failed to load chart data" height={300}>
        <MockChild />
      </BaseChart>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load chart data')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-chart')).not.toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <BaseChart title="Chart Title" height={300}>
        <MockChild />
      </BaseChart>
    )

    expect(screen.getByText('Chart Title')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <BaseChart description="Chart description text" height={300}>
        <MockChild />
      </BaseChart>
    )

    expect(screen.getByText('Chart description text')).toBeInTheDocument()
  })

  it('renders both title and description', () => {
    render(
      <BaseChart title="Chart Title" description="Chart description" height={300}>
        <MockChild />
      </BaseChart>
    )

    expect(screen.getByText('Chart Title')).toBeInTheDocument()
    expect(screen.getByText('Chart description')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <BaseChart className="custom-class" height={300}>
        <MockChild />
      </BaseChart>
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('applies custom height in loading state', () => {
    const { container } = render(
      <BaseChart loading={true} height={500}>
        <MockChild />
      </BaseChart>
    )

    const loadingDiv = container.querySelector('[role="status"]')
    expect(loadingDiv).toHaveStyle({ height: '500px' })
  })

  it('applies custom height in error state', () => {
    const { container } = render(
      <BaseChart error="Error" height={500}>
        <MockChild />
      </BaseChart>
    )

    const errorDiv = container.querySelector('[role="alert"]')
    expect(errorDiv).toHaveStyle({ height: '500px' })
  })

  it('renders responsive container by default', () => {
    const { container } = render(
      <BaseChart height={300}>
        <MockChild />
      </BaseChart>
    )

    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('does not render chart header when no title or description', () => {
    const { container } = render(
      <BaseChart height={300}>
        <MockChild />
      </BaseChart>
    )

    expect(container.querySelector('.chart-header')).not.toBeInTheDocument()
  })

  it('uses default height when not specified', () => {
    const { container } = render(
      <BaseChart loading={true}>
        <MockChild />
      </BaseChart>
    )

    const loadingDiv = container.querySelector('[role="status"]')
    expect(loadingDiv).toHaveStyle({ height: '300px' })
  })
})
