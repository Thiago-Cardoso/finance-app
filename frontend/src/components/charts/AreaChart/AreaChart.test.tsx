import { render, screen } from '@testing-library/react'
import { AreaChart } from './AreaChart'

const mockData = [
  { name: 'Day 1', value: 100, date: '2024-01-01' },
  { name: 'Day 2', value: 200, date: '2024-01-02' },
  { name: 'Day 3', value: 150, date: '2024-01-03' },
]

describe('AreaChart', () => {
  it('renders chart container', () => {
    const { container } = render(
      <AreaChart
        data={mockData}
        xAxisKey="date"
        yAxisKey="value"
        height={300}
      />
    )

    expect(container.querySelector('.chart-container')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <AreaChart
        data={[]}
        xAxisKey="date"
        yAxisKey="value"
        loading={true}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading chart')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <AreaChart
        data={[]}
        xAxisKey="date"
        yAxisKey="value"
        error="Failed to load data"
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(
      <AreaChart
        data={mockData}
        xAxisKey="date"
        yAxisKey="value"
        title="Area Chart Title"
      />
    )

    expect(screen.getByText('Area Chart Title')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <AreaChart
        data={mockData}
        xAxisKey="date"
        yAxisKey="value"
        title="Area Chart"
        description="Area chart description"
      />
    )

    expect(screen.getByText('Area chart description')).toBeInTheDocument()
  })
})
