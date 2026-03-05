export interface ExtractedAction {
  text: string;
  owner: string | null;
}

/**
 * Extract action items from meeting notes text.
 * Patterns:
 *  - `- [ ] Person to do thing`
 *  - `ACTION: Person to do thing`
 *  - `TODO: thing`
 *  - `@Person do thing`
 */
export function extractActions(notes: string): ExtractedAction[] {
  const actions: ExtractedAction[] = [];
  const lines = notes.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Pattern: - [ ] Person to do thing
    let match = trimmed.match(/^-\s*\[\s*\]\s*(.+)$/);
    if (match) {
      const text = match[1].trim();
      const ownerMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+)?)\s+to\s+/);
      actions.push({
        text,
        owner: ownerMatch ? ownerMatch[1] : null,
      });
      continue;
    }

    // Pattern: ACTION: Person to do thing
    match = trimmed.match(/^ACTION:\s*(.+)$/i);
    if (match) {
      const text = match[1].trim();
      const ownerMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+)?)\s+to\s+/);
      actions.push({
        text,
        owner: ownerMatch ? ownerMatch[1] : null,
      });
      continue;
    }

    // Pattern: TODO: thing
    match = trimmed.match(/^TODO:\s*(.+)$/i);
    if (match) {
      actions.push({
        text: match[1].trim(),
        owner: null,
      });
      continue;
    }

    // Pattern: @Person do thing
    match = trimmed.match(/^@([A-Z][a-z]+(?:\s+[A-Z]\.?))\s+(.+)$/) ||
            trimmed.match(/^@([A-Z][a-z]+(?:\s+[A-Z][a-z]+))\s+(.+)$/) ||
            trimmed.match(/^@(\S+)\s+(.+)$/);
    if (match) {
      actions.push({
        text: `${match[1]} ${match[2]}`.trim(),
        owner: match[1],
      });
      continue;
    }
  }

  return actions;
}
