/**
 * Button Component Tests
 *
 * Testes unitários para o componente Button.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { Button } from '@/shared/components/ui/Button';
import { renderWithProviders } from '../../helpers/renderWithProviders';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = renderWithProviders(<Button title="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithProviders(
      <Button title="Click Me" onPress={onPressMock} />
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByTestId, queryByText } = renderWithProviders(
      <Button title="Submit" loading />
    );

    expect(getByTestId('button-loading')).toBeTruthy();
    expect(queryByText('Submit')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithProviders(
      <Button title="Click Me" onPress={onPressMock} disabled />
    );

    const button = getByText('Click Me').parent;
    fireEvent.press(button!);
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders with outline variant', () => {
    const { getByText } = renderWithProviders(
      <Button title="Outline" variant="outline" />
    );

    const button = getByText('Outline').parent;
    expect(button).toBeTruthy();
  });

  it('renders with secondary variant', () => {
    const { getByText } = renderWithProviders(
      <Button title="Secondary" variant="secondary" />
    );

    const button = getByText('Secondary').parent;
    expect(button).toBeTruthy();
  });
});
