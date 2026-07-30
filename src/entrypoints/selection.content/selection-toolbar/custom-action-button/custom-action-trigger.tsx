import type { MouseEvent } from "react"
import type { SelectionToolbarCustomAction } from "@/types/config/selection-toolbar"
import { useCallback } from "react"
import { CspSafeIcon } from "@/components/csp-safe-icon"
import { SelectionToolbarTooltip } from "../../components/selection-tooltip"
import { useSelectionCustomActionPopover } from "./provider"

export function SelectionToolbarCustomActionTrigger({
  action,
}: {
  action: SelectionToolbarCustomAction
}) {
  const { openToolbarCustomAction } = useSelectionCustomActionPopover()

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.currentTarget.blur()
      openToolbarCustomAction(action.id, event.currentTarget)
    },
    [action.id, openToolbarCustomAction],
  )

  return (
    <SelectionToolbarTooltip
      content={action.name}
      render={
        <button
          type="button"
          aria-label={action.name}
          className="flex h-7 shrink-0 cursor-pointer items-center justify-center px-2 hover:bg-accent"
          onClick={handleClick}
        />
      }
    >
      <CspSafeIcon icon={action.icon} strokeWidth={0.8} className="size-4.5" />
    </SelectionToolbarTooltip>
  )
}
