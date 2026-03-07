import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getServiceWidget, httpProxy } = vi.hoisted(() => ({
  getServiceWidget: vi.fn(),
  httpProxy: vi.fn(),
}));

vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));
vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("widgets/widgets", () => ({
  default: { goss: { api: "{url}/healthz" } },
}));

import gossProxyHandler from "./proxy";

const mockWidget = { type: "goss", url: "http://192.168.1.1:6767" };
const mockSummary = { "test-count": 9, "failed-count": 0, "skipped-count": 1 };
const mockBody = Buffer.from(JSON.stringify({ summary: mockSummary }));

describe("widgets/goss/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServiceWidget.mockResolvedValue(mockWidget);
  });

  it("returns 400 when group or service is missing", async () => {
    const req = { query: {} };
    const res = createMockRes();

    await gossProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
  });

  it("returns data on HTTP 200", async () => {
    httpProxy.mockResolvedValue([200, "application/json", mockBody]);

    const req = { query: { group: "Test", service: "MyService", index: "0" } };
    const res = createMockRes();

    await gossProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.summary["test-count"]).toBe(9);
  });

  it("returns data on HTTP 503 (goss failure state)", async () => {
    const failBody = Buffer.from(JSON.stringify({
      summary: { "test-count": 17, "failed-count": 2, "skipped-count": 0 },
    }));
    httpProxy.mockResolvedValue([503, "application/json", failBody]);

    const req = { query: { group: "Test", service: "MyService", index: "0" } };
    const res = createMockRes();

    await gossProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.summary["failed-count"]).toBe(2);
  });

  it("returns error with string body on HTTP error", async () => {
    httpProxy.mockResolvedValue([500, "text/plain", "Internal Server Error"]);

    const req = { query: { group: "Test", service: "MyService", index: "0" } };
    const res = createMockRes();

    await gossProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.data).toBe("Internal Server Error");
  });

  it("returns error status on other HTTP errors", async () => {
    httpProxy.mockResolvedValue([500, "application/json", Buffer.from("Internal Server Error")]);

    const req = { query: { group: "Test", service: "MyService", index: "0" } };
    const res = createMockRes();

    await gossProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
