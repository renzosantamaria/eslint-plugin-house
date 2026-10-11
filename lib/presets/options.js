const isText = (value) => typeof value === 'string' && value.trim() !== '';

const kindOf = (value) => (value === null ? 'null' : typeof value);

export function requireOptions(preset, options, known) {
  if (options === null || typeof options !== 'object') {
    throw new TypeError(`${preset} takes an object, not ${kindOf(options)}.`);
  }

  const unknown = Object.keys(options).filter((key) => !known.includes(key));

  if (unknown.length > 0) {
    throw new TypeError(
      `${preset} does not take ${unknown.join(', ')}; it takes ${known.join(', ')}.`,
    );
  }

  return options;
}

function requireText(option, value) {
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

export function requireFlag(option, value) {
  if (typeof value !== 'boolean') {
    throw new TypeError(`${option} must be true or false.`);
  }

  return value;
}

const leavesTheProject = (folder) =>
  folder.startsWith('/') ||
  /^[A-Za-z]:/.test(folder) ||
  folder.includes('\\') ||
  folder.split('/').includes('..');

// The folder ends up in a glob that ESLint matches against paths below its
// base path, and one that can never match would switch the preset off without
// a word.
export function requireFolder(option, value) {
  const folder = requireText(option, value).trim();

  if (leavesTheProject(folder)) {
    throw new TypeError(
      `${option} must be a path with forward slashes, relative to the config file and inside its folder.`,
    );
  }

  return folder;
}
