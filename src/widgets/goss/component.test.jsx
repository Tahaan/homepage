// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";
import { screen, fireEvent } from "@testing-library/react";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/goss/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "goss", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("goss.tests")).toBeInTheDocument();
    expect(screen.getByText("goss.failed")).toBeInTheDocument();
    expect(screen.getByText("goss.skipped")).toBeInTheDocument();
  });

  it("renders counts when data is available", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        results: [],
        summary: {
          "test-count": 12,
          "failed-count": 1,
          "skipped-count": 2,
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "goss", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "goss.tests", 12);
    expectBlockValue(container, "goss.failed", 1);
    expectBlockValue(container, "goss.skipped", 2);
  });

  it("renders error state", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "Network error" } });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "goss", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelector(".service-block")).toBeNull();
  });

  it("renders details summary when data is available", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        results: [],
        summary: { "test-count": 9, "failed-count": 0, "skipped-count": 1 },
      },
      error: undefined,
    });

    renderWithProviders(
      <Component service={{ widget: { type: "goss", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("goss.details")).toBeInTheDocument();
  });

  it("collapses raw data when clicked", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        results: [],
        summary: { "test-count": 9, "failed-count": 0, "skipped-count": 1 }
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "goss", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    const details = container.querySelector("details");
    details.setAttribute("open", "");

    const dataDiv = details.querySelector("div");
    fireEvent.click(dataDiv);

    expect(details.hasAttribute("open")).toBe(false);
  });

  it("renders error when summary is missing", () => {
    useWidgetAPI.mockReturnValue({
      data: { results: [] },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "goss", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelector(".service-block")).toBeNull();
  });

  it("renders error when results is missing", () => {
    useWidgetAPI.mockReturnValue({
      data: { summary: { "test-count": 9, "failed-count": 0, "skipped-count": 0 } },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "goss", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelector(".service-block")).toBeNull();
  });


  it("renders results table with pass, fail and skipped", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        results: [
          { "summary-line": "File: /etc/hosts: exists", successful: true, skipped: false },
          { "summary-line": "Port: tcp:80: listening", successful: false, skipped: false },
          { "summary-line": "Service: nginx: running", successful: false, skipped: true },
        ],
        summary: { "test-count": 3, "failed-count": 1, "skipped-count": 1 },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "goss", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelectorAll("tr")).toHaveLength(3);
  });
});
