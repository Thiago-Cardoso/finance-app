/**
 * Date Picker Input Component
 *
 * Input com date picker nativo para iOS e Android
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  type TextInputProps,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

interface DatePickerInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string; // formato: YYYY-MM-DD
  onChangeValue: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  iconColor?: string;
}

export function DatePickerInput({
  value,
  onChangeValue,
  minimumDate,
  maximumDate,
  iconColor = '#666',
  ...rest
}: DatePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  const formatDateDisplay = useCallback((dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const handleDateChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }

      if (selectedDate) {
        setTempDate(selectedDate);

        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}`;

        onChangeValue(formatted);
      }
    },
    [onChangeValue]
  );

  const handlePress = useCallback(() => {
    setShowPicker(true);
  }, []);

  const handleIOSConfirm = useCallback(() => {
    setShowPicker(false);
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, '0');
    const day = String(tempDate.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    onChangeValue(formatted);
  }, [tempDate, onChangeValue]);

  return (
    <View>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View pointerEvents="none" className="flex-row items-center">
          <TextInput
            {...rest}
            value={formatDateDisplay(value)}
            editable={false}
            className="flex-1"
          />
          <View className="absolute right-4">
            <Calendar size={20} color={iconColor} />
          </View>
        </View>
      </TouchableOpacity>

      {showPicker && (
        <>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale="pt-BR"
          />

          {Platform.OS === 'ios' && (
            <View className="flex-row justify-end p-4 gap-2">
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#e0e0e0' }}
              >
                <Text className="font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleIOSConfirm}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#007AFF' }}
              >
                <Text className="font-medium text-white">Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
