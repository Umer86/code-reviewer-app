import React from 'react';

export const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.5 13c1.155 2-0.289 4.5-2.598 4.5H4.499c-2.31 0-3.753-2.5-2.598-4.5l7.5-13zM12 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10.5 9a1.5 1.5 0 113 0v4.5a1.5 1.5 0 11-3 0V9z"
      clipRule="evenodd"
    />
  </svg>
);
