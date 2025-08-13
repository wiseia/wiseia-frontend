// src/components/ui/GoogleIcon.tsx

import React from 'react'; // Adicionando a importação do React

export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path fill="#4285F4" d="M24 9.8c3.2 0 5.8 1.2 7.8 3l5.5-5.5C33.6 3.2 29.1 1 24 1 14.8 1 7.1 6.6 4 14.5l6.8 5.3C12.4 13.5 17.7 9.8 24 9.8z" />
    <path fill="#34A853" d="M24 47c5.1 0 9.6-1.7 12.8-4.5l-6.2-4.8c-1.7 1.2-3.9 1.8-6.6 1.8-6.3 0-11.6-3.7-13.6-8.8L4 35.8C7.1 42.4 14.8 47 24 47z" />
    <path fill="#FBBC05" d="M10.4 28.5c-.4-.9-.6-2-.6-3s.2-2.1.6-3L4 17.2C2.3 20.4 1.5 24.1 1.5 28c0 3.9.8 7.6 2.5 10.8l6.4-5.3z" />
    <path fill="#EA4335" d="M24 18.2c2.7 0 4.8 1 6.5 2.6l5.7-5.7C33.8 12.1 29.3 9 24 9c-6.3 0-11.6 3.7-13.6 8.8l6.4 5.3c1.6-5.1 6.9-8.9 13.2-8.9z" />
  </svg>
);