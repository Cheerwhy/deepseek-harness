/**
 * Runtime vocabulary derived from the persisted work-details mode. Renderers
 * and seats select single fields of this policy; none of them compares the
 * mode enum, so adding a mode changes only the table below.
 */

import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { TranscriptViewMode } from '../chat-settings.ts'

/** Presentation capabilities that one work-details mode enables. */
export interface ChatPresentationPolicy {
  /** Mode this policy was derived from; for diagnostics, never for branching in renderers. */
  readonly mode: TranscriptViewMode
  /** Whether a normally completed Turn folds its process rows behind the whole-Turn control. */
  readonly foldCompletedTurns: boolean
  /** Require a loaded final answer and complete history before folding, as in the classic display. */
  readonly classicTurnFold: boolean
  /** Collapsible group headers for all Turns, historical Turns only, or no Turns. */
  readonly stepGrouping: 'collapsed' | 'history' | 'none'
  /** Show the running command, path, query, or reasoning detail in group titles. */
  readonly liveProcessDetail: boolean
  /** Whether a settled reasoning row previews its first line beside the Think title. */
  readonly settledReasoningPreview: boolean
  /** Whether streaming reasoning previews the current line as it grows. */
  readonly liveReasoningLatestLine: boolean
  /** Label shown on a completed Turn's process control. */
  readonly completedTurnHeader: 'counts' | 'duration' | 'none'
}

const POLICIES: Readonly<Record<TranscriptViewMode, ChatPresentationPolicy>> = {
  normal: {
    mode: 'normal',
    foldCompletedTurns: true,
    classicTurnFold: true,
    stepGrouping: 'none',
    liveProcessDetail: false,
    settledReasoningPreview: true,
    liveReasoningLatestLine: true,
    completedTurnHeader: 'counts',
  },
  compact: {
    mode: 'compact',
    foldCompletedTurns: true,
    classicTurnFold: false,
    stepGrouping: 'collapsed',
    liveProcessDetail: false,
    settledReasoningPreview: false,
    liveReasoningLatestLine: false,
    completedTurnHeader: 'duration',
  },
  standard: {
    mode: 'standard',
    foldCompletedTurns: true,
    classicTurnFold: false,
    stepGrouping: 'collapsed',
    liveProcessDetail: true,
    settledReasoningPreview: true,
    liveReasoningLatestLine: false,
    completedTurnHeader: 'duration',
  },
  detailed: {
    mode: 'detailed',
    foldCompletedTurns: true,
    classicTurnFold: false,
    stepGrouping: 'history',
    liveProcessDetail: true,
    settledReasoningPreview: true,
    liveReasoningLatestLine: false,
    completedTurnHeader: 'duration',
  },
  verbose: {
    mode: 'verbose',
    foldCompletedTurns: false,
    classicTurnFold: false,
    stepGrouping: 'none',
    liveProcessDetail: false,
    settledReasoningPreview: true,
    liveReasoningLatestLine: false,
    completedTurnHeader: 'duration',
  },
}

/**
 * Resolve the policy constant for one mode. The same mode always yields the
 * same object, so selectors over a policy see stable identities.
 * @param mode - persisted work-details mode.
 * @returns the mode's presentation policy.
 */
export function presentationPolicyFor(mode: TranscriptViewMode): ChatPresentationPolicy {
  return POLICIES[mode]
}

/**
 * Derive a policy observable from the mode observable without a subscription of
 * its own: reads are a table lookup and change notifications are the mode's.
 * @param mode - live work-details mode.
 * @returns observable policy that changes exactly when the mode changes.
 */
export function derivePresentationPolicy(
  mode: ObservableSnapshot<TranscriptViewMode>,
): ObservableSnapshot<ChatPresentationPolicy> {
  return {
    getSnapshot: () => POLICIES[mode.getSnapshot()],
    subscribe: listener => mode.subscribe(listener),
  }
}
