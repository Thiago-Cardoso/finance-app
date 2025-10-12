import { render, screen } from '@testing-library/react'
import { BarChart } from './BarChart'

const mockData = [
  { name: 'Category 1', value: 100 },
  { name: 'Category 2', value: 200 },
  { name: 'Category 3', value: 150 },
]

describe('BarChart', () => {
  it('renders chart container', () => {
    const { container } = render(
      <BarChart
        data={mockData}
        xAxisKey="name"
        yAxisKey="value"
        height={300}
      />
    )

    expect(container.querySelector('.chart-container')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <BarChart
        data={[]}
        xAxisKey="name"
        yAxisKey="value"
        loading={true}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <BarChart
        data={[]}
        xAxisKey="name"
        yAxisKey="value"
        error="Failed to load data"
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(
      <BarChart
        data={mockData}
        xAxisKey="name"
        yAxisKey="value"
        title="Bar Chart Title"
      />
    )

    expect(screen.getByText('Bar Chart Title')).toBeInTheDocument()
  })
})
