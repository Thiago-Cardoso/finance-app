'use client'

import { Controller, useFormContext } from 'react-hook-form'
import ReactSelect, { Props as ReactSelectProps } from 'react-select'
import { clsx } from 'clsx'

export interface SelectOption {
  value: string | number
  label: string
  color?: string
}

interface SelectProps extends Omit<ReactSelectProps<SelectOption>, 'name'> {
  name: string
  options: SelectOption[]
  placeholder?: string
  isSearchable?: boolean
  isClearable?: boolean
  isMulti?: boolean
  className?: string
}

export function Select({
  name,
  options,
  placeholder = 'Selecione...',
  isSearchable = true,
  isClearable = true,
  isMulti = false,
  className,
  ...props
}: SelectProps) {
  const { control, formState: { errors } } = useFormContext()
  const hasError = !!errors[name]

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'rgb(var(--color-background, 255 255 255))',
      borderColor: hasError
        ? '#ef4444'
        : state.isFocused
          ? '#3b82f6'
          : 'rgb(209 213 219)',
      boxShadow: state.isFocused
        ? hasError
          ? '0 0 0 1px #ef4444'
          : '0 0 0 1px #3b82f6'
        : 'none',
      '&:hover': {
        borderColor: hasError ? '#ef4444' : '#3b82f6'
      },
      minHeight: '42px'
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgb(var(--color-background, 255 255 255))',
      zIndex: 50
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
          ? 'rgb(239 246 255)'
          : 'transparent',
      color: state.isSelected ? 'white' : 'rgb(55 65 81)',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : 'rgb(239 246 255)'
      }
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgb(239 246 255)',
      color: 'rgb(30 64 175)'
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: 'rgb(30 64 175)'
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: 'rgb(30 64 175)',
      '&:hover': {
        backgroundColor: '#3b82f6',
        color: 'white'
      }
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'rgb(var(--color-foreground, 17 24 39))'
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'rgb(var(--color-foreground, 17 24 39))'
    })
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, onBlur } }) => (
        <ReactSelect
          {...props}
          options={options}
          value={options.find(option => option.value === value) || null}
          onChange={(selectedOption: any) => {
            if (isMulti) {
              onChange(selectedOption?.map((option: SelectOption) => option.value) || [])
            } else {
              onChange(selectedOption?.value || null)
            }
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          isSearchable={isSearchable}
          isClearable={isClearable}
          isMulti={isMulti}
          styles={customStyles}
          className={clsx('react-select-container', className)}
          classNamePrefix="react-select"
          noOptionsMessage={() => 'Nenhuma opção encontrada'}
          loadingMessage={() => 'Carregando...'}
        />
      )}
    />
  )
}
