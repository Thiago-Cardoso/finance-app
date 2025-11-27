/**
 * Component: SearchBar
 *
 * Search input with debounce, clear button, and visual feedback.
 *
 * LOOP PREVENTION:
 * - Uses useRef for onSearch callback to prevent infinite re-renders
 * - Debounce delay of 500ms to reduce API calls
 * - Only debouncedValue in useEffect dependencies (NOT the callback)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useDebounce } from '@/shared/hooks/useDebounce';

export interface SearchBarProps {
  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Current search value
   */
  value?: string;

  /**
   * Callback when search value changes (debounced)
   */
  onSearch?: (query: string) => void;

  /**
   * Callback when value changes (immediate)
   */
  onChangeText?: (text: string) => void;

  /**
   * Debounce delay in ms (default: 500)
   */
  debounceDelay?: number;

  /**
   * Show loading indicator
   */
  isLoading?: boolean;

  /**
   * Auto focus on mount
   */
  autoFocus?: boolean;

  /**
   * Disable input
   */
  disabled?: boolean;

  /**
   * Custom className for container
   */
  className?: string;

  /**
   * Callback when clear is pressed
   */
  onClear?: () => void;

  /**
   * Callback when search is submitted (enter key)
   */
  onSubmit?: (query: string) => void;
}

export function SearchBar({
  placeholder = 'Buscar...',
  value: controlledValue,
  onSearch,
  onChangeText,
  debounceDelay = 500,
  isLoading = false,
  autoFocus = false,
  disabled = false,
  className = '',
  onClear,
  onSubmit,
}: SearchBarProps) {
  const { colors, theme } = useTheme();
  const [localValue, setLocalValue] = useState(controlledValue || '');
  const [isFocused, setIsFocused] = useState(false);

  // ✅ CRITICAL: Use ref for onSearch to prevent infinite loops
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Use controlled value if provided
  const inputValue = controlledValue !== undefined ? controlledValue : localValue;

  // Debounce the search value
  const debouncedValue = useDebounce(inputValue, debounceDelay);

  // Notify parent when debounced value changes (SAFE - no onSearch in deps)
  useEffect(() => {
    if (onSearchRef.current && debouncedValue !== undefined) {
      onSearchRef.current(debouncedValue);
    }
  }, [debouncedValue]); // ✅ ONLY debouncedValue in deps

  const handleChange = useCallback((text: string) => {
    if (controlledValue === undefined) {
      setLocalValue(text);
    }
    onChangeText?.(text);
  }, [controlledValue, onChangeText]);

  const handleClear = useCallback(() => {
    if (controlledValue === undefined) {
      setLocalValue('');
    }
    onChangeText?.('');
    onClear?.();
  }, [controlledValue, onChangeText, onClear]);

  const handleSubmit = useCallback(() => {
    onSubmit?.(inputValue);
  }, [inputValue, onSubmit]);

  const showClearButton = inputValue.length > 0 && !isLoading;

  return (
    <View
      className={`flex-row items-center rounded-xl px-4 py-3 ${className}`}
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: isFocused ? theme.colors.primary.DEFAULT : colors.border,
      }}
    >
      {/* Search Icon */}
      <Search
        size={20}
        color={isFocused ? theme.colors.primary.DEFAULT : colors.text.secondary}
      />

      {/* Input */}
      <TextInput
        value={inputValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text.disabled}
        style={{
          flex: 1,
          marginLeft: 12,
          marginRight: 8,
          fontSize: 16,
          color: colors.text.primary,
        }}
        autoFocus={autoFocus}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />

      {/* Loading Indicator */}
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={theme.colors.primary.DEFAULT}
        />
      )}

      {/* Clear Button */}
      {showClearButton && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          accessibilityLabel="Limpar busca"
          accessibilityRole="button"
        >
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.border }}
          >
            <X size={14} color={colors.text.secondary} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default SearchBar;
