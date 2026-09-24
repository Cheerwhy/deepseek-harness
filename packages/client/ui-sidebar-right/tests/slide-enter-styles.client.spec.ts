/**
 * Enter animation, asserted against SidebarRight.module.css on disk: the
 * sliding element (the dock host, the empty dock, a divider) is inserted fresh
 * on the first opening and reinserted after the last tab closed, and a
 * transition needs an already-painted element — those openings would otherwise
 * render in place with no slide. The opening flip briefly marks the panel
 * (SidebarPanel) and only that mark carries the enter animation: hosts and
 * dividers that a split, a float, or a tab switch inserts inside an open panel
 * match the open rule with no mark and stay unanimated. The keyframes animate
 * transform only (visibility is discrete and would step halfway through the
 * slide), and reduced motion disables both the transition and the animation.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../src/client/shell/SidebarRight.module.css', import.meta.url), 'utf8')

/** The stylesheet outside the reduced-motion media query. */
const cssOutsideReducedMotion = css.replace(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/, '')

/** Every `[selector, body]` rule outside the media query whose selector contains the fragment. */
function rulesWith(fragment: string): [string, string][] {
  const found: [string, string][] = []
  for (const match of cssOutsideReducedMotion.matchAll(/(?<sel>[^{}@]+)\{(?<body>[^{}]*)\}/g)) {
    if (match.groups!['sel']!.includes(fragment)) found.push([match.groups!['sel']!, match.groups!['body']!])
  }
  return found
}

/** The declaration blocks inside the reduced-motion media query. */
function reducedMotionBodies(): string[] {
  const media = /@media \(prefers-reduced-motion: reduce\) \{(?<body>[\s\S]*?)\n\}/.exec(css)?.groups?.['body'] ?? ''
  return [...media.matchAll(/\{(?<body>[^{}]*)\}/g)].map(match => match.groups!['body']!)
}

describe('slide enter animation styles', () => {
  it('keeps the open state on the transition alone', () => {
    const open = rulesWith('[data-sidebar-right-open] :global')
    expect(open).toHaveLength(1)
    expect(open[0]![0]).not.toContain('[data-sidebar-right-entering]')
    expect(open[0]![1]).toContain('transition: transform var(--ds-transition-duration-slow) var(--ds-ease-in-out)')
    expect(open[0]![1]).not.toContain('animation:')
  })

  it('animates every slider only under the entering mark, on the transition curve', () => {
    const entering = rulesWith('[data-sidebar-right-entering]')
    expect(entering).toHaveLength(1)
    const sliders = [':global([data-dockkit-host=\'dock\'])', ':global([data-dockkit-empty])', ':global([data-dockkit-divider])']
    for (const slider of sliders) expect(entering[0]![0]).toContain(slider)
    expect(entering[0]![1]).toContain('animation: dsh-sidebar-right-enter var(--ds-transition-duration-slow) var(--ds-ease-in-out)')
  })

  it('enters transform only, from the off-edge translate', () => {
    const frames = /@keyframes dsh-sidebar-right-enter \{\s*from \{(?<from>[^{}]*)\}\s*\}/.exec(css)?.groups?.['from']
    expect(frames).toBeDefined()
    expect(frames).toContain('transform: translateX(var(--dsh-sidebar-width))')
    expect(frames).not.toContain('visibility')
  })

  it('disables the enter animation and the transition under reduced motion', () => {
    const reduced = reducedMotionBodies()
    expect(reduced).toHaveLength(1)
    expect(reduced[0]).toContain('transition: none')
    expect(reduced[0]).toContain('animation: none')
  })
})
