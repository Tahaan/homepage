import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const logger = createLogger("gossProxyHandler");

export default async function gossProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (widget) {
      const urlString = formatApiCall(widgets[widget.type].api, { ...widget });
      const url = new URL(urlString);

      const [status, contentType, data] = await httpProxy(url, { method: "GET" });

      if (contentType) res.setHeader("Content-Type", contentType);

      // For goss: 503 still contains valid JSON result data, treat it as success
      if (status === 200 || status === 503) {
        const responseData = JSON.parse(Buffer.from(data).toString());
        responseData._gossUrl = urlString;
        return res.status(200).json(responseData);
      }

      return res.status(status).json({
        error: {
          message: "HTTP Error",
          url: sanitizeErrorURL(url),
          data: Buffer.isBuffer(data) ? Buffer.from(data).toString() : data,
        },
      });
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
