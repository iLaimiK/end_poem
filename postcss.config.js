<<<<<<< HEAD
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import postcssMinify from 'postcss-minify';

=======
>>>>>>> 03f5236cf58c29734b71f6f61b5144d941ee714d
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [autoprefixer, tailwindcssPostcss, postcssMinify],
};

export default config;
