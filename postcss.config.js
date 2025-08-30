import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import postcssMinify from 'postcss-minify';

const config = {
  plugins: [autoprefixer, tailwindcssPostcss, postcssMinify],
};

export default config;
