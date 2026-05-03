
import React from 'react';

export const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3" />
    <path d="M8 2a2 2 0 0 1 2 2v10a4 4 0 0 0 4 4h1a2 2 0 0 0 2-2v-2a1 1 0 0 1 1-1h2" />
    <path d="M19.7 2.3a.3.3 0 1 0-.2-.3.3.3 0 0 0 .2.3" />
    <path d="M16 2a2 2 0 0 0-2 2v10a4 4 0 0 1-4 4h-1a2 2 0 0 1-2-2v-2a1 1 0 0 0-1-1H4" />
    <circle cx="14" cy="18" r="4" />
    <path d="M14 16v4" />
  </svg>
);
