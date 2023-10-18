/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config}  */
export default {
  // 防止删除无用css代码
  safelist: [
    {
      pattern: /card/,
    },
    {
      pattern: /alert/,
    },
  ],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      height: {
        128: '32rem',
      },
      letterSpacing: {
        3: '0.3rem',
        4: '0.4rem',
      },
    },
  },
  plugins: [require('daisyui')],
};
