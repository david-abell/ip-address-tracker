require("dotenv").config();

const API_KEY = process.env.API_KEY_GE0_IPIFY;
// const API_BASE_URL = "localhost:8888";
const API_BASE_URL = "https://geo.ipify.org";

const proxySharedOptions = {
  target: API_BASE_URL,
  changeOrigin: true,
  logLevel: "debug",
};

const ROUTES = [
  {
    url: "/noquery",
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 5,
    },
    proxy: {
      pathRewrite: {
        [`^/noquery`]: `/api/v2/country,city?apiKey=${API_KEY}`,
      },
      ...proxySharedOptions,
    },
  },
  {
    url: "/domain",
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 5,
    },
    proxy: {
      pathRewrite: (path, req) => {
        let newPath = path.replace(
          /^\/domain\?/,
          `/api/v2/country,city?apiKey=${API_KEY}&`
        );
        return newPath;
      },
      ...proxySharedOptions,
    },
  },
  {
    url: "/ip",
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 5,
    },
    proxy: {
      pathRewrite: (path, req) => {
        let newPath = path.replace(
          /^\/ip\?/,
          `/api/v2/country,city?apiKey=${API_KEY}&`
        );
        return newPath;
      },
      ...proxySharedOptions,
    },
  },
];

exports.ROUTES = ROUTES;
