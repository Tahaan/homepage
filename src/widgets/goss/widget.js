//import genericProxyHandler from "utils/proxy/handlers/generic";
import gossProxyHandler from "./proxy.js";

const widget = {
  api: "{url}/healthz",
  proxyHandler: gossProxyHandler,
}

export default widget;
