<<<<<<< HEAD
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import postcssMinify from 'postcss-minify';

=======
>>>>>>> 67c5de0b4c909d1c4a2e1c1fda91f84c6cd76b42
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [autoprefixer, tailwindcssPostcss, postcssMinify],
};

export default config;
