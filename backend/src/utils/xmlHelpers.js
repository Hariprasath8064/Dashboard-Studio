function encodeXml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeXml(xmlString) {
  return xmlString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function splitTuple(rowString) {
  let trimmedText = String(rowString).trim();
  if (trimmedText.startsWith('(') && trimmedText.endsWith(')')) {
    trimmedText = trimmedText.slice(1, -1);
  }

  const results = [];
  let currentToken = '', inQuotes = false;
  for (let i = 0; i < trimmedText.length; i++) {
    const char = trimmedText[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { results.push(currentToken.trim()); currentToken = ''; }
    else currentToken += char;
  }
  results.push(currentToken.trim());
  return results;
}

module.exports = { encodeXml, sanitizeXml, splitTuple };
