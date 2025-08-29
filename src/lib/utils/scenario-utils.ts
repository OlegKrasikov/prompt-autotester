export function generateScenarioId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

export function parseExpectationArgs(argsJson: unknown): Record<string, unknown> {
  if (typeof argsJson === 'string') {
    try {
      const parsed = JSON.parse(argsJson);
      return typeof parsed === 'object' && parsed !== null ? parsed : { value: parsed };
    } catch {
      return { value: argsJson };
    }
  }
  if (typeof argsJson === 'object' && argsJson !== null) {
    return argsJson as Record<string, unknown>;
  }
  return { value: argsJson };
}

export function validateScenarioName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.length > 100) {
    return 'Name must be less than 100 characters';
  }
  return null;
}

export function validateExpectationKey(key: string): string | null {
  if (!key || key.trim().length === 0) {
    return 'Expectation key is required';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return 'Expectation key can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
}