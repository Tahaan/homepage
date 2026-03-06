import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { data, error } = useWidgetAPI(service.widget);

  if (error) return <Container service={service} error={error} />;

  const summary = data?.summary ?? {};
  const failed = summary["failed-count"] ?? 0;

  return (
    <div className={failed > 0 ? "ring-2 ring-red-500 rounded-md" : ""}>
      <Container service={service}>
        <Block label="goss.tests" value={summary["test-count"]} />
        <Block label="goss.failed" value={failed} />
        <Block label="goss.skipped" value={summary["skipped-count"]} />
      </Container>
    {data && (
      <details className="px-1 pb-1">
        <summary className="text-center text-xs cursor-pointer text-theme-500 hover:text-theme-300">
          raw
        </summary>
        <div className="mt-1 text-xs font-mono whitespace-pre-wrap break-all p-2 cursor-pointer"
          onClick={(e) => e.currentTarget.closest("details").removeAttribute("open")}>
          {JSON.stringify(data, null, 2)}
        </div>
      </details>
    )}
    </div>
  );
}
