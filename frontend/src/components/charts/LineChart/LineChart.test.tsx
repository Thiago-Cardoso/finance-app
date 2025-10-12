import { render, screen } from '@testing-library/react'
import { LineChart } from './LineChart'

const mockData = [
  { date: '2024-01-01', value: 100, name: 'Day 1' },
  { date: '2024-01-02', value: 200, name: 'Day 2' },
  { date: '2024-01-03', value: 150, name: 'Day 3' },
]

describe('LineChart', () => {
  it('renders chart container', () => {
    const { container } = render(
      <LineChart
        data={mockData}
        xAxisKey="date"
        yAxisKey="value"
        height={300}
      />
    )

    // Check if chart container is rendered
    expect(container.querySelector('.chart-container')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <LineChart
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
      <LineChart
        data={[]}
        xAxisKey="date"
        yAxisKey="value"
        error="Failed to load data"
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders with custom title and description', () => {
    render(
      <LineChart
        data={mockData}
        xAxisKey="date"
        yAxisKey="value"
        title="Chart Title"
        description="Chart description"
      />
    )

    expect(screen.getByText('Chart Title')).toBeInTheDocument()
    expect(screen.getByText('Chart description')).toBeInTheDocument()
  })

  it('renders with custom height', () => {
    const { container } = render(
      <LineChart
        data={mockData}
        xAxisKey="date"
        yAxisKey="value"
        height={400}
      />
    )

    const chartContainer = container.querySelector('.chart-container')
    expect(chartContainer).toBeInTheDocument()
  })
})
