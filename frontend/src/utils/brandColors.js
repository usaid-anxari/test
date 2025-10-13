// TrueTestify Brand Colors Configuration
// Based on official TrueTestify brand image - NO GRADIENTS, solid colors only

export const BRAND_COLORS = {
  // Primary Brand Colors (from TrueTestify brand image)
  primary: '#04A4FF',        // Teal Blue - Primary Color
  secondary: '#04A4FF',      // Sky Blue - Secondary Color (same as primary)
  
  // Background Colors
  background: {
    main: '#ffffff',         // White background
    light: '#f8fafc',       // Light gray background
    card: '#ffffff'         // Card background
  },

  // Widget Accent Colors
  widget: {
    video: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200',
      hover: 'hover:bg-orange-200'
    },
    audio: {
      bg: 'bg-purple-100', 
      text: 'text-purple-600',
      border: 'border-purple-200',
      hover: 'hover:bg-purple-200'
    },
    text: {
      bg: 'bg-green-100',
      text: 'text-green-600', 
      border: 'border-green-200',
      hover: 'hover:bg-green-200'
    }
  },

  // Status Colors
  status: {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200'
    }
  },

  // Typography Colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    light: 'text-gray-400',
    white: 'text-white',
    brand: 'text-[#04A4FF]'   // Brand color text
  }
};

// CSS Custom Properties for dynamic usage
export const CSS_VARIABLES = {
  '--color-primary-teal': '#04A4FF',
  '--color-secondary-blue': '#04A4FF',
  '--color-teal-light': '#7dd3fc',
  '--color-sky-highlight': '#bae6fd'
};

// Utility functions
export const getWidgetColors = (type) => {
  return BRAND_COLORS.widget[type] || BRAND_COLORS.widget.text;
};

export const getStatusColors = (status) => {
  return BRAND_COLORS.status[status] || BRAND_COLORS.status.info;
};