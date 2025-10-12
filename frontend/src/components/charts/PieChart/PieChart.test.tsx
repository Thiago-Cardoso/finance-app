import { render, screen } from '@testing-library/react'
import { PieChart } from './PieChart'

const mockData = [
  { name: 'Category 1', value: 100 },
  { name: 'Category 2', value: 200 },
  { name: 'Category 3', value: 150 },
]

describe('PieChart', () => {
  it('renders chart container', () => {
    const { container } = render(
      <PieChart
        data={mockData}
        dataKey="value"
        nameKey="name"
        height={300}
      />
    )

    expect(container.querySelector('.chart-container')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <PieChart
        data={[]}
        dataKey="value"
        nameKey="name"
        loading={true}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <PieChart
        data={[]}
        dataKey="value"
        nameKey="name"
        error="Failed to load data"
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(
      <PieChart
        data={mockData}
        dataKey="value"
        nameKey="name"
        title="Pie Chart Title"
      />
    )

    expect(screen.getByText('Pie Chart Title')).toBeInTheDocument()
  })
})
