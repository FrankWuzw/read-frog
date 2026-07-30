// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CspSafeIcon } from "../csp-safe-icon"

const iconData = {
  body: '<path d="M2 2h20v20H2z"/>',
  height: 24,
  width: 24,
} as const

const { buildIconMock, getIconMock, loadIconMock } = vi.hoisted(() => ({
  getIconMock: vi.fn<(...args: any[]) => any>(),
  loadIconMock: vi.fn<(...args: any[]) => any>(),
  buildIconMock: vi.fn<(...args: any[]) => any>(),
}))

vi.mock("@iconify/react", () => ({
  buildIcon: buildIconMock,
  getIcon: getIconMock,
  loadIcon: loadIconMock,
}))

describe("CspSafeIcon", () => {
  beforeEach(() => {
    getIconMock.mockReset()
    loadIconMock.mockReset()
    buildIconMock.mockReset()
    buildIconMock.mockReturnValue({
      attributes: {
        height: "1em",
        viewBox: "0 0 24 24",
        width: "1em",
      },
      body: iconData.body,
      inline: false,
    })
  })

  it("renders cached Iconify SVG data without creating a Trusted Types policy", async () => {
    const createPolicy = vi.fn<(...args: any[]) => any>()
    Object.defineProperty(window, "trustedTypes", {
      configurable: true,
      value: { createPolicy },
    })
    getIconMock.mockReturnValue(iconData)

    const { container } = render(<CspSafeIcon icon="tabler:sparkles" className="size-4" />)

    await waitFor(() => {
      expect(container.querySelector("svg path")).toHaveAttribute("d", "M2 2h20v20H2z")
    })
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 24 24")
    expect(createPolicy).not.toHaveBeenCalled()
    expect(loadIconMock).not.toHaveBeenCalled()
  })

  it("loads missing icons and silently leaves invalid icon data empty", async () => {
    getIconMock.mockReturnValue(null)
    loadIconMock.mockResolvedValue({
      ...iconData,
      body: "<not-closed",
    })
    buildIconMock.mockReturnValueOnce({
      attributes: {
        height: "1em",
        viewBox: "0 0 24 24",
        width: "1em",
      },
      body: "<not-closed",
      inline: false,
    })

    const { container } = render(<CspSafeIcon icon="custom:invalid" />)

    await waitFor(() => {
      expect(loadIconMock).toHaveBeenCalledWith("custom:invalid")
    })
    expect(container.querySelector("svg")?.childNodes).toHaveLength(0)
  })
})
