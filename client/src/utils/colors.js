// Main color palette for FMB Merchant Portal
export const colors = {
  // Primary brand color
  primary: '#DEAD25',
  
  // Background colors
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  
  // Text colors
  textPrimary: '#2d3748',
  textSecondary: '#718096',
  textMuted: '#4a5568',
  
  // Status colors
  success: '#48bb78',
  warning: '#f6ad55',
  error: '#e53e3e',
  info: '#667eea',
  
  // Border colors
  border: '#e2e8f0',
  borderLight: '#f7fafc',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.15)'
};

// CSS custom properties for easy use
export const cssVariables = `
  :root {
    --color-primary: ${colors.primary};
    --color-background: ${colors.background};
    --color-card-background: ${colors.cardBackground};
    --color-text-primary: ${colors.textPrimary};
    --color-text-secondary: ${colors.textSecondary};
    --color-text-muted: ${colors.textMuted};
    --color-success: ${colors.success};
    --color-warning: ${colors.warning};
    --color-error: ${colors.error};
    --color-info: ${colors.info};
    --color-border: ${colors.border};
    --color-border-light: ${colors.borderLight};
    --color-shadow: ${colors.shadow};
    --color-shadow-dark: ${colors.shadowDark};
  }
`;

export default colors;
