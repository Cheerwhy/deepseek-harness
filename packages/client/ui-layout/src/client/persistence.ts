/**
 * Edge-column width preferences persisted across reloads. Only the two width
 * preferences survive; measurements, the responsive override, and the
 * occupant's presentation reports stay transient (stores.ts).
 */
import { clampWidth, RIGHTBAR_MIN, SIDEBAR_MAX, SIDEBAR_MIN } from './columns.ts'

/** localStorage key for the frame-wide width preferences. */
export const layoutWidthPersistence = 'dsh.layout.widths.v1'

/** The persisted preference subset: both edge-column width preferences. */
export interface LayoutWidths {
  /** Sidebar preference in px; 0 reloads with the sidebar closed. */
  sidebar: number
  /** Right panel preference in px, or null before its first opening. */
  rightbar: number | null
}

/**
 * Restore the saved width preferences. The sidebar clamps back into its
 * contract range (0 keeps the closed state); a right preference below its
 * floor never came from a drag write, so the whole entry is discarded.
 * @returns the saved widths, or undefined when absent, inaccessible, or invalid.
 */
export function readLayoutWidths(): LayoutWidths | undefined {
  if (typeof localStorage === 'undefined') return undefined
  let raw: string | null
  try { raw = localStorage.getItem(layoutWidthPersistence) }
  catch (_storageUnavailable) { return undefined }
  if (raw === null) return undefined
  try {
    const parsed = JSON.parse(raw) as Partial<LayoutWidths>
    if (typeof parsed.sidebar !== 'number' || !Number.isFinite(parsed.sidebar)) throw new Error('invalid sidebar width')
    if (parsed.rightbar !== null && (typeof parsed.rightbar !== 'number' || !Number.isFinite(parsed.rightbar) || parsed.rightbar < RIGHTBAR_MIN)) throw new Error('invalid rightbar width')
    return { sidebar: parsed.sidebar === 0 ? 0 : clampWidth(parsed.sidebar, SIDEBAR_MIN, SIDEBAR_MAX), rightbar: parsed.rightbar }
  } catch (_invalidEntry) {
    clearLayoutWidths()
    return undefined
  }
}

/**
 * Persist both width preferences in one entry.
 * @param widths - current dragged preferences.
 */
export function writeLayoutWidths(widths: LayoutWidths): void {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(layoutWidthPersistence, JSON.stringify(widths)) }
  catch (error) { console.error('Layout width persistence failed:', error) }
}

/**
 * Drop the persisted width preferences (storage failure only skips cleanup).
 */
export function clearLayoutWidths(): void {
  if (typeof localStorage === 'undefined') return
  try { localStorage.removeItem(layoutWidthPersistence) }
  catch (_storageUnavailable) { /* The stale entry stays but is excluded from this window. */ }
}
