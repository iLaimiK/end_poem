/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [autoprefixer, tailwindcssPostcss, postcssMinify],
};

export default config;
