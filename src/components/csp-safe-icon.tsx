import type { IconifyIcon } from "@iconify/react"
import type { SVGProps } from "react"
import { buildIcon, getIcon, loadIcon } from "@iconify/react"
import { useEffect, useMemo, useRef, useState } from "react"

type CspSafeIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  icon: string
}

function replaceSVGChildren(svg: SVGSVGElement, body: string) {
  const parsed = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${body}</svg>`,
    "image/svg+xml",
  )

  if (parsed.querySelector("parsererror")) {
    svg.replaceChildren()
    return
  }

  svg.replaceChildren(
    ...Array.from(parsed.documentElement.childNodes, (node) => document.importNode(node, true)),
  )
}

/**
 * Renders Iconify data without dangerouslySetInnerHTML.
 *
 * Content scripts inherit the host page's Trusted Types policy. Some sites, such
 * as LinkedIn, reject Iconify's `iconify` policy and record an extension error
 * even though Iconify catches the exception. Parsing validated SVG icon data as
 * XML keeps dynamic icons working without creating a Trusted Types policy.
 */
export function CspSafeIcon({ icon, style, ...props }: CspSafeIconProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [iconData, setIconData] = useState<Required<IconifyIcon> | null>(
    () => getIcon(icon) ?? null,
  )

  useEffect(() => {
    let isCurrent = true
    const cachedIcon = getIcon(icon)

    if (cachedIcon) {
      setIconData(cachedIcon)
      return () => {
        isCurrent = false
      }
    }

    setIconData(null)
    void loadIcon(icon)
      .then((loadedIcon) => {
        if (isCurrent) {
          setIconData(loadedIcon)
        }
      })
      .catch(() => {
        if (isCurrent) {
          setIconData(null)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [icon])

  const builtIcon = useMemo(() => (iconData ? buildIcon(iconData) : null), [iconData])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) {
      return
    }

    if (!builtIcon) {
      svg.replaceChildren()
      return
    }

    replaceSVGChildren(svg, builtIcon.body)
  }, [builtIcon])

  return (
    <svg
      {...props}
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
      role="img"
      width={builtIcon?.attributes.width ?? "1em"}
      height={builtIcon?.attributes.height ?? "1em"}
      viewBox={builtIcon?.attributes.viewBox}
      style={{ verticalAlign: "-0.125em", ...style }}
    />
  )
}
