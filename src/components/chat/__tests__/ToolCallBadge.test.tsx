import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

function invocation(
  toolName: string,
  args: Record<string, unknown>,
  state = "result",
  result: unknown = "Success"
) {
  return { toolName, args, state, result };
}

test("shows Creating for str_replace_editor create", () => {
  render(
    <ToolCallBadge
      toolInvocation={invocation("str_replace_editor", { command: "create", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("shows Editing for str_replace_editor str_replace", () => {
  render(
    <ToolCallBadge
      toolInvocation={invocation("str_replace_editor", { command: "str_replace", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("shows Editing for str_replace_editor insert", () => {
  render(
    <ToolCallBadge
      toolInvocation={invocation("str_replace_editor", { command: "insert", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("shows Editing for str_replace_editor undo_edit", () => {
  render(
    <ToolCallBadge
      toolInvocation={invocation("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("shows Viewing for str_replace_editor view", () => {
  render(
    <ToolCallBadge
      toolInvocation={invocation("str_replace_editor", { command: "view", path: "/App.jsx" })}
    />
  );
  expect(screen.getByText("Viewing /App.jsx")).toBeDefined();
});

test("shows Renaming for file_manager rename", () => {
  render(
    <ToolCallBadge
      toolInvocation={invocation("file_manager", { command: "rename", path: "/old.jsx" })}
    />
  );
  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

test("shows Deleting for file_manager delete", () => {
  render(
    <ToolCallBadge
      toolInvocation={invocation("file_manager", { command: "delete", path: "/old.jsx" })}
    />
  );
  expect(screen.getByText("Deleting /old.jsx")).toBeDefined();
});

test("falls back to toolName for unknown tool", () => {
  render(
    <ToolCallBadge
      toolInvocation={invocation("unknown_tool", { command: "do_something", path: "/file.jsx" })}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("falls back to toolName when args lack command or path", () => {
  render(
    <ToolCallBadge
      toolInvocation={invocation("str_replace_editor", {})}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("shows green dot when state is result", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={invocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "result", "Success")}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is not result", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={invocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "call", undefined)}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
