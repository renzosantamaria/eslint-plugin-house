export function readStaticAttribute(element, name) {
  const attribute = element.startTag.attributes.find(
    (candidate) => candidate.key.name === name,
  );

  return attribute?.value?.value;
}
