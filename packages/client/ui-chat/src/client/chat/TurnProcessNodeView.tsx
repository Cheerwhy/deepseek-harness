import { memo } from 'react'
import { IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatNodeViewProps, PresentationInjected } from '../contract/slots.ts'
import { turnProcessAlwaysOpen } from '../contract/turn-process.ts'
import { formatRunDuration } from './message-chrome.ts'
import css from './TurnProcessNodeView.module.css'

/** Turn-level process disclosure controller. */
export const TurnProcessNodeView = memo(function TurnProcessNodeView({
  node, turnProcess, usePresentation, t,
}: ChatNodeViewProps<'turn-process'> & InjectFace<PresentationInjected>) {
  if (turnProcess === undefined) throw new Error('turn-process node requires Turn process owner state')
  const completedTurnHeader = usePresentation(policy => policy.completedTurnHeader)
  const open = !turnProcess.foldable || turnProcess.open
  const turn = node.location.kind === 'turn' || node.location.kind === 'step'
    ? node.location.turn
    : undefined
  if (turn?.status !== 'closed' || completedTurnHeader === 'none') return null
  const canCollapse = turnProcess.foldable && turnProcess.hasContent && !turnProcessAlwaysOpen(node)
  if (completedTurnHeader === 'counts' && !canCollapse) return null
  const reason = turn.end?.data.reason.kind
  const elapsedMs = turn.start === undefined ? undefined
    : Math.max(1000, (turn.end?.time ?? turn.start.time) - turn.start.time)
  const duration = elapsedMs === undefined ? undefined
    : formatRunDuration(elapsedMs, t)
  // Other end reasons retain elapsed time; only cancellation and failure replace it.
  const durationLabel = reason === 'aborted' ? t('message.stopped')
    : reason === 'error' ? t('message.turnProcess.failed')
      : duration === undefined ? t('message.turnProcess.worked')
        : t('message.turnProcess.took', { duration })
  const labels: string[] = []
  if (node.data.toolCallCount > 0) labels.push(t(
    node.data.toolCallCount === 1 ? 'message.turnProcess.toolCalls.one' : 'message.turnProcess.toolCalls.other',
    { count: node.data.toolCallCount },
  ))
  if (node.data.messageCount > 0) labels.push(t(
    node.data.messageCount === 1 ? 'message.turnProcess.messages.one' : 'message.turnProcess.messages.other',
    { count: node.data.messageCount },
  ))
  if (node.data.subagentCount > 0) labels.push(t(
    node.data.subagentCount === 1 ? 'message.turnProcess.subagents.one' : 'message.turnProcess.subagents.other',
    { count: node.data.subagentCount },
  ))
  const label = completedTurnHeader === 'counts'
    ? labels.length === 0 ? t('message.turnProcess.thoughtForAWhile')
      : labels.join(t('message.turnProcess.separator'))
    : durationLabel
  return (
    <button
      type="button"
      className={css.root}
      data-open={open || undefined}
      data-turn-process={node.data.turn}
      data-turn-process-messages={node.data.messageCount}
      data-turn-process-tool-calls={node.data.toolCallCount}
      data-turn-process-subagents={node.data.subagentCount}
      disabled={!canCollapse}
      aria-expanded={turnProcess.hasContent ? open : undefined}
      onClick={(event) => {
        event.currentTarget.focus()
        turnProcess.setOpen(!open)
      }}
    >
      <span className={css.label}>{label}</span>
      {canCollapse && <IconChevronDownOutlineRegular className={css.chevron} />}
    </button>
  )
})
