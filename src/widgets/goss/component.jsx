import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { data, error } = useWidgetAPI(service.widget);
  if (error) return <Container service={service} error={error} />;

  const summary = data?.summary ?? {};

  if (data && (!data.summary || !data.results)) {
    return <Container service={service} error={{ message: "Invalid goss response" }} />;
  }
  const failed = summary["failed-count"] ?? 0;

  return (
    <div className={failed > 0 ? "ring-2 ring-red-500 rounded-md" : ""}>
      <Container service={service}>
        <Block label="goss.tests" value={summary["test-count"]} />
        <Block label="goss.failed" value={failed} />
        <Block label="goss.skipped" value={summary["skipped-count"]} />
      </Container>
      {data?.results && (
        <details className="px-1 pb-1">
          <summary className="text-center text-xs cursor-pointer text-theme-500 hover:text-theme-300">
            details
          </summary>
          <div className="mt-1 text-xs font-mono cursor-pointer"
            onClick={(e) => e.currentTarget.closest("details").removeAttribute("open")}>
            <div className="mb-1 text-theme-500">{service.href}healthz</div>
            <table className="w-full">
              <tbody>
                {data.results.map((result, i) => (
                  <tr key={i} className={result.successful ? "" : result.skipped ? "text-gray-400" : "text-red-400"}>
                    <td className="pr-2 text-center">
                      {result.skipped ? "—" : result.successful ? "✓" : "✗"}
                    </td>
                    <td className="whitespace-normal break-all">{result["summary-line"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
