import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "@/app/main-content";

// The toggle lives in MainContent, but it is wrapped by context providers and
// renders several heavy children (chat, editor, live preview iframe). Mock them
// all out so the test exercises only the Preview/Code toggle behavior.
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div>ChatInterface</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div>FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div>CodeEditor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div>PreviewFrame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div>HeaderActions</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("defaults to the preview view", () => {
  render(<MainContent />);

  expect(screen.getByText("PreviewFrame")).toBeDefined();
  expect(screen.queryByText("CodeEditor")).toBeNull();
});

test("clicking the Code tab switches to the code view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByRole("tab", { name: "Code" }));

  expect(screen.getByText("CodeEditor")).toBeDefined();
  expect(screen.getByText("FileTree")).toBeDefined();
  expect(screen.queryByText("PreviewFrame")).toBeNull();
});

test("clicking Code then Preview toggles back to the preview view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByText("CodeEditor")).toBeDefined();

  await user.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByText("PreviewFrame")).toBeDefined();
  expect(screen.queryByText("CodeEditor")).toBeNull();
});
