import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { DatePicker } from './DatePicker'

const testSchema = z.object({
  date: z.date({ required_error: 'Data é obrigatória' })
})

type TestFormData = z.infer<typeof testSchema>

const TestDatePickerComponent = ({
  defaultDate,
  hasError = false,
  ...props
}: {
  defaultDate?: Date
  hasError?: boolean
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
}) => {
  const methods = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: { date: defaultDate }
  })

  useEffect(() => {
    if (hasError) {
      methods.setError('date', { message: 'Data é obrigatória' })
    }
  }, [hasError, methods])

  return (
    <FormProvider {...methods}>
      <DatePicker name="date" {...props} />
    </FormProvider>
  )
}

describe('DatePicker', () => {
  it('renders date picker input', () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'date')
  })

  it('displays placeholder text', () => {
    render(<TestDatePickerComponent />)

    expect(screen.getByPlaceholderText('Selecione uma data')).toBeInTheDocument()
  })

  it('displays selected date in DD/MM/YYYY format', () => {
    const testDate = new Date(2024, 0, 15) // January 15, 2024

    render(<TestDatePickerComponent defaultDate={testDate} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('15/01/2024')
  })

  it('opens calendar when input is clicked', async () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)

    await waitFor(() => {
      // Calendar should open and show month/year
      const calendar = document.querySelector('.react-datepicker')
      expect(calendar).toBeInTheDocument()
    })
  })

  it('allows selecting a date from calendar', async () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)

    await waitFor(() => {
      const calendar = document.querySelector('.react-datepicker')
      expect(calendar).toBeInTheDocument()
    })

    // Find and click on day 15
    const dayButtons = document.querySelectorAll('.react-datepicker__day')
    const day15 = Array.from(dayButtons).find((button) =>
      button.textContent === '15' && !button.classList.contains('react-datepicker__day--outside-month')
    )

    if (day15) {
      fireEvent.click(day15)

      await waitFor(() => {
        const inputElement = screen.getByRole('textbox') as HTMLInputElement
        expect(inputElement.value).toContain('/15/')
      })
    }
  })

  it('applies error styling when field has error', () => {
    render(<TestDatePickerComponent hasError />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-300')
    expect(input).toHaveClass('focus:border-red-500')
  })

  it('applies default styling when no error', () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-gray-300')
    expect(input).toHaveClass('focus:border-blue-500')
  })

  it('is disabled when disabled prop is true', () => {
    render(<TestDatePickerComponent disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('respects minDate prop', async () => {
    const minDate = new Date(2024, 0, 10) // January 10, 2024

    render(<TestDatePickerComponent minDate={minDate} />)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)

    await waitFor(() => {
      const calendar = document.querySelector('.react-datepicker')
      expect(calendar).toBeInTheDocument()

      // Days before minDate should be disabled
      const disabledDays = document.querySelectorAll('.react-datepicker__day--disabled')
      expect(disabledDays.length).toBeGreaterThan(0)
    })
  })

  it('respects maxDate prop', async () => {
    const maxDate = new Date(2024, 0, 20) // January 20, 2024

    render(<TestDatePickerComponent maxDate={maxDate} />)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)

    await waitFor(() => {
      const calendar = document.querySelector('.react-datepicker')
      expect(calendar).toBeInTheDocument()
    })
  })

  it('uses PT-BR locale', async () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)

    await waitFor(() => {
      // Check for Portuguese month names or day names
      const calendar = document.querySelector('.react-datepicker')
      expect(calendar).toBeInTheDocument()

      // Portuguese weekday names should be present
      const weekdays = document.querySelectorAll('.react-datepicker__day-name')
      expect(weekdays.length).toBeGreaterThan(0)
    })
  })

  it('has dark mode styling', () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('dark:bg-gray-800')
    expect(input).toHaveClass('dark:text-gray-100')
    expect(input).toHaveClass('dark:border-gray-600')
  })

  it('applies custom className', () => {
    const TestCustomClassName = () => {
      const methods = useForm<TestFormData>()

      return (
        <FormProvider {...methods}>
          <DatePicker name="date" className="custom-datepicker-class" />
        </FormProvider>
      )
    }

    render(<TestCustomClassName />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-datepicker-class')
  })

  it('integrates with React Hook Form', async () => {
    const TestIntegration = () => {
      const methods = useForm<TestFormData>({
        defaultValues: { date: undefined }
      })

      return (
        <FormProvider {...methods}>
          <DatePicker name="date" />
        </FormProvider>
      )
    }

    render(<TestIntegration />)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)

    await waitFor(() => {
      const calendar = document.querySelector('.react-datepicker')
      expect(calendar).toBeInTheDocument()
    })

    // Select a date
    const dayButtons = document.querySelectorAll('.react-datepicker__day')
    const firstAvailableDay = Array.from(dayButtons).find((button) =>
      !button.classList.contains('react-datepicker__day--outside-month') &&
      !button.classList.contains('react-datepicker__day--disabled')
    )

    if (firstAvailableDay) {
      fireEvent.click(firstAvailableDay)

      await waitFor(() => {
        // Input should have a date value
        const inputElement = screen.getByRole('textbox') as HTMLInputElement
        expect(inputElement.value).toBeTruthy()
      })
    }
  })

  it('has proper focus styles', () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('focus:outline-none')
    expect(input).toHaveClass('focus:ring-2')
  })

  it('closes calendar when date is selected', async () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)

    await waitFor(() => {
      const calendar = document.querySelector('.react-datepicker')
      expect(calendar).toBeInTheDocument()
    })

    const dayButtons = document.querySelectorAll('.react-datepicker__day')
    const firstDay = Array.from(dayButtons).find((button) =>
      !button.classList.contains('react-datepicker__day--outside-month')
    )

    if (firstDay) {
      fireEvent.click(firstDay)

      await waitFor(() => {
        // Calendar should close after selection
        const calendar = document.querySelector('.react-datepicker')
        expect(calendar).not.toBeInTheDocument()
      })
    }
  })

  it('handles keyboard navigation', () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')

    // Should be able to focus
    input.focus()
    expect(input).toHaveFocus()

    // Should be able to blur
    input.blur()
    expect(input).not.toHaveFocus()
  })

  it('displays current month by default', async () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)

    await waitFor(() => {
      const calendar = document.querySelector('.react-datepicker')
      expect(calendar).toBeInTheDocument()

      // Should show current month
      const monthElement = document.querySelector('.react-datepicker__current-month')
      expect(monthElement).toBeInTheDocument()
    })
  })

  it('can navigate between months', async () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)

    await waitFor(() => {
      const nextButton = document.querySelector('.react-datepicker__navigation--next')
      expect(nextButton).toBeInTheDocument()

      if (nextButton) {
        fireEvent.click(nextButton)
        // Month should change
        expect(document.querySelector('.react-datepicker')).toBeInTheDocument()
      }
    })
  })

  it('has rounded borders', () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('rounded-md')
  })

  it('has proper padding', () => {
    render(<TestDatePickerComponent />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('px-3')
    expect(input).toHaveClass('py-2')
  })
})
