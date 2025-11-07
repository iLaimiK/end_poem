<<<<<<< HEAD
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import postcssMinify from 'postcss-minify';

=======
>>>>>>> 70f76763bf938d1a765f8f40172cd68d06c75fca
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [autoprefixer, tailwindcssPostcss, postcssMinify],
};

export default config;
