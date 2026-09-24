// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DisclosureRow } from '../src/DisclosureRow.tsx'

afterEach(cleanup)

describe('DisclosureRow running presentation', () => {
  it('uses one row-level animation for title and summary', () => {
    const props = {
      icon: <span>icon</span>,
      title: 'Running command',
      open: false,
      expandable: false,
      onToggle: () => {},
      collapsedContent: <span>Checking files</span>,
    }
    const view = render(<DisclosureRow {...props} running />)
    const row = view.container.querySelector('[data-disclosure-row]')!
    expect(row.hasAttribute('data-running')).toBe(true)
    expect(row.querySelectorAll('[data-text-shimmer]')).toHaveLength(0)
    expect(row.textContent).toContain('Running command')
    expect(row.textContent).toContain('Checking files')
    view.rerender(<DisclosureRow {...props} running={false} />)
    expect(row.hasAttribute('data-running')).toBe(false)
  })
})
