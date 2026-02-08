import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import i18n from './i18n';

/**
 * Custom wrapper that provides all necessary context providers.
 */
const AllTheProviders = ({ children }) => {
  return (
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };