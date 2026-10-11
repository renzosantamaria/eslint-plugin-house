const isText = (value) => typeof value === 'string' && value.trim() !== '';

export function requireOptions(preset, options, known) {
  const unknown = Object.keys(options).filter((key) => !known.includes(key));

  if (unknown.length > 0) {
    throw new TypeError(
      `${preset} does not take ${unknown.join(', ')}; it takes ${known.join(', ')}.`,
    );
  }

  return options;
}

export function requireText(option, value) {
  if (!isText(value)) {
    throw new TypeError(`${option} must be a non-empty string.`);
  }

  return value;
}

export function requireTexts(option, values, { atLeast = 0 } = {}) {
  if (
    !Array.isArray(values) ||
    values.length < atLeast ||
    !values.every(isText)
  ) {
    throw new TypeError(
      `${option} must be an array of ${atLeast > 0 ? `at least ${atLeast} ` : ''}non-empty strings.`,
    );
  }

  return values;
}
