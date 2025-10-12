import { render, screen } from '@testing-library/react'
import { CustomTooltip } from './CustomTooltip'

describe('CustomTooltip', () => {
  const mockPayload = [
    {
      name: 'Income',
      value: 5000,
      color: '#10b981',
      dataKey: 'income',
    },
    {
      name: 'Expense',
      value: 3000,
      color: '#ef4444',
      dataKey: 'expense',
    },
  ]

  it('returns null when not active', () => {
    const { container } = render(
      <CustomTooltip active={false} payload={mockPayload} label="2024-01-01" />
    )

    expect(container.firstChild).toBeNull()
  })

  it('returns null when payload is empty', () => {
    const { container } = render(
      <CustomTooltip active={true} payload={[]} label="2024-01-01" />
    )

    expect(container.firstChild).toBeNull()
  })

  it('returns null when payload is null', () => {
    const { container } = render(
      <CustomTooltip active={true} payload={null as any} label="2024-01-01" />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders tooltip with formatted date label', () => {
    render(
      <CustomTooltip active={true} payload={mockPayload} label="2024-01-15" />
    )

    // Date should be formatted in Portuguese
    expect(screen.getByText(/15 de janeiro de 2024/i)).toBeInTheDocument()
  })

  it('renders tooltip with non-date label', () => {
    render(
      <CustomTooltip active={true} payload={mockPayload} label="Category A" />
    )

    expect(screen.getByText('Category A')).toBeInTheDocument()
  })

  it('renders all payload entries', () => {
    render(
      <CustomTooltip active={true} payload={mockPayload} label="2024-01-01" />
    )

    expect(screen.getByText(/Income:/i)).toBeInTheDocument()
    expect(screen.getByText(/Expense:/i)).toBeInTheDocument()
  })

  it('formats currency values correctly', () => {
    render(
      <CustomTooltip active={true} payload={mockPayload} label="2024-01-01" />
    )

    // Values should be formatted as currency
    expect(screen.getByText(/R\$\s*5\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*3\.000,00/)).toBeInTheDocument()
  })

  it('uses dataKey as fallback when name is not provided', () => {
    const payloadWithoutName = [
      {
        value: 1000,
        color: '#3b82f6',
        dataKey: 'balance',
      },
    ]

    render(
      <CustomTooltip active={true} payload={payloadWithoutName as any} label="2024-01-01" />
    )

    expect(screen.getByText(/balance:/i)).toBeInTheDocument()
  })

  it('renders without label', () => {
    const { container } = render(
      <CustomTooltip active={true} payload={mockPayload} />
    )

    // Should render payload items even without label
    expect(container.querySelector('.bg-white')).toBeInTheDocument()
    expect(screen.getByText(/Income:/i)).toBeInTheDocument()
  })

  it('applies correct color indicators for each entry', () => {
    const { container } = render(
      <CustomTooltip active={true} payload={mockPayload} label="2024-01-01" />
    )

    const colorIndicators = container.querySelectorAll('.w-3.h-3.rounded-full')
    expect(colorIndicators).toHaveLength(2)
  })

  it('handles large numbers with proper formatting', () => {
    const payloadWithLargeNumbers = [
      {
        name: 'Total',
        value: 1234567.89,
        color: '#3b82f6',
        dataKey: 'total',
      },
    ]

    render(
      <CustomTooltip active={true} payload={payloadWithLargeNumbers} label="2024-01-01" />
    )

    expect(screen.getByText(/R\$\s*1\.234\.567,89/)).toBeInTheDocument()
  })

  it('handles negative values', () => {
    const payloadWithNegative = [
      {
        name: 'Loss',
        value: -500,
        color: '#ef4444',
        dataKey: 'loss',
      },
    ]

    render(
      <CustomTooltip active={true} payload={payloadWithNegative} label="2024-01-01" />
    )

    expect(screen.getByText(/-R\$\s*500,00/)).toBeInTheDocument()
  })

  it('uses custom formatter when provided', () => {
    const customFormatter = (value: any, name: string): [string, string] => [`${value}%`, name]

    render(
      <CustomTooltip
        active={true}
        payload={mockPayload}
        label="2024-01-01"
        formatter={customFormatter}
      />
    )

    expect(screen.getByText('5000%')).toBeInTheDocument()
    expect(screen.getByText('3000%')).toBeInTheDocument()
  })
})
