<<<<<<< HEAD
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import postcssMinify from 'postcss-minify';

=======
>>>>>>> 8a7784da27b488f9d699bd42ec7ea0de1a886aa4
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [autoprefixer, tailwindcssPostcss, postcssMinify],
};

export default config;
