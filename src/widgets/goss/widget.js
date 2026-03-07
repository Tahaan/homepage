// Custom proxy handler to return data when goss gives a 503 http return code.
import gossProxyHandler from "./proxy.js";

const widget = {
  api: "{url}/healthz",
  proxyHandler: gossProxyHandler,
}

export default widget;
