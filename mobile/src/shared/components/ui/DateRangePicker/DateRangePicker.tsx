/**
 * Component: DateRangePicker
 *
 * Date range selector with start and end dates.
 * Includes preset shortcuts for common periods.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar, X } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { Button } from '../Button';

export interface DateRangePickerProps {
  /**
   * Start date
   */
  startDate: Date;

  /**
   * End date
   */
  endDate: Date;

  /**
   * Callback when dates change
   */
  onChange: (startDate: Date, endDate: Date) => void;

  /**
   * Minimum selectable date
   */
  minimumDate?: Date;

  /**
   * Maximum selectable date
   */
  maximumDate?: Date;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

interface DateShortcut {
  label: string;
  getValue: () => { startDate: Date; endDate: Date };
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get date shortcuts
 */
function getDateShortcuts(): DateShortcut[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return [
    {
      label: 'Este mês',
      getValue: () => ({
        startDate: new Date(year, month, 1),
        endDate: new Date(year, month + 1, 0),
      }),
    },
    {
      label: 'Mês anterior',
      getValue: () => ({
        startDate: new Date(year, month - 1, 1),
        endDate: new Date(year, month, 0),
      }),
    },
    {
      label: 'Últimos 3 meses',
      getValue: () => ({
        startDate: new Date(year, month - 2, 1),
        endDate: new Date(year, month + 1, 0),
      }),
    },
    {
      label: 'Este ano',
      getValue: () => ({
        startDate: new Date(year, 0, 1),
        endDate: new Date(year, 11, 31),
      }),
    },
    {
      label: 'Ano anterior',
      getValue: () => ({
        startDate: new Date(year - 1, 0, 1),
        endDate: new Date(year - 1, 11, 31),
      }),
    },
  ];
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minimumDate,
  maximumDate = new Date(),
  disabled = false,
}: DateRangePickerProps) {
  const { colors, theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  const shortcuts = useMemo(() => getDateShortcuts(), []);

  /**
   * Open modal and reset temp values
   */
  const handleOpen = () => {
    if (disabled) return;
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowModal(true);
  };

  /**
   * Apply shortcut
   */
  const handleShortcut = (shortcut: DateShortcut) => {
    const { startDate: newStart, endDate: newEnd } = shortcut.getValue();
    setTempStartDate(newStart);
    setTempEndDate(newEnd);
  };

  /**
   * Handle date change from picker
   */
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      if (activePicker === 'start') {
        setTempStartDate(selectedDate);
        // Auto-adjust end date if needed
        if (selectedDate > tempEndDate) {
          setTempEndDate(selectedDate);
        }
      } else if (activePicker === 'end') {
        setTempEndDate(selectedDate);
        // Auto-adjust start date if needed
        if (selectedDate < tempStartDate) {
          setTempStartDate(selectedDate);
        }
      }
    }
    setActivePicker(null);
  };

  /**
   * Validate and apply selection
   */
  const handleApply = () => {
    if (tempEndDate >= tempStartDate) {
      onChange(tempStartDate, tempEndDate);
      setShowModal(false);
    }
  };

  /**
   * Cancel and close modal
   */
  const handleCancel = () => {
    setShowModal(false);
    setActivePicker(null);
  };

  const isValid = tempEndDate >= tempStartDate;

  return (
    <View>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        className={`
          flex-row items-center justify-between px-4 py-3 rounded-lg
          ${disabled ? 'opacity-50' : ''}
        `}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        accessible
        accessibilityLabel="Selecionar período"
        accessibilityHint="Abre seletor de data"
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <View className="flex-1 flex-row items-center">
          <Calendar size={18} color={colors.text.secondary} />
          <Text
            className="text-sm ml-2"
            style={{ color: colors.text.primary }}
            numberOfLines={1}
          >
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={handleCancel}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="rounded-t-3xl pt-4 pb-8"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 mb-4">
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Selecionar Período
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Shortcuts */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 px-4"
            >
              {shortcuts.map((shortcut, index) => {
                const { startDate: sStart, endDate: sEnd } = shortcut.getValue();
                const isActive =
                  tempStartDate.getTime() === sStart.getTime() &&
                  tempEndDate.getTime() === sEnd.getTime();

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleShortcut(shortcut)}
                    className="mr-2 px-4 py-2 rounded-full"
                    style={{
                      backgroundColor: isActive
                        ? theme.colors.primary.DEFAULT
                        : colors.surface,
                      borderWidth: 1,
                      borderColor: isActive
                        ? theme.colors.primary.DEFAULT
                        : colors.border,
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{
                        color: isActive ? '#FFFFFF' : colors.text.primary,
                      }}
                    >
                      {shortcut.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Date Selectors */}
            <View className="px-4 mb-4">
              {/* Start Date */}
              <TouchableOpacity
                onPress={() => setActivePicker('start')}
                className="flex-row items-center justify-between p-4 rounded-lg mb-3"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor:
                    activePicker === 'start'
                      ? theme.colors.primary.DEFAULT
                      : colors.border,
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  Data inicial
                </Text>
                <Text
                  className="text-base font-medium"
                  style={{ color: colors.text.primary }}
                >
                  {formatDate(tempStartDate)}
                </Text>
              </TouchableOpacity>

              {/* End Date */}
              <TouchableOpacity
                onPress={() => setActivePicker('end')}
                className="flex-row items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor:
                    activePicker === 'end'
                      ? theme.colors.primary.DEFAULT
                      : colors.border,
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  Data final
                </Text>
                <Text
                  className="text-base font-medium"
                  style={{ color: colors.text.primary }}
                >
                  {formatDate(tempEndDate)}
                </Text>
              </TouchableOpacity>

              {/* Validation Error */}
              {!isValid && (
                <Text
                  className="text-sm mt-2"
                  style={{ color: theme.colors.error.DEFAULT }}
                >
                  A data final deve ser maior ou igual à data inicial
                </Text>
              )}
            </View>

            {/* Native Date Picker */}
            {activePicker && (
              <DateTimePicker
                value={activePicker === 'start' ? tempStartDate : tempEndDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor={colors.text.primary}
              />
            )}

            {/* Actions */}
            <View className="flex-row px-4 pt-4">
              <Button
                title="Cancelar"
                variant="outline"
                onPress={handleCancel}
                className="flex-1 mr-2"
              />
              <Button
                title="Aplicar"
                onPress={handleApply}
                disabled={!isValid}
                className="flex-1 ml-2"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default DateRangePicker;
