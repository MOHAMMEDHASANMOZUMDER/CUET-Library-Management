function jsonSafe(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, val) => (typeof val === 'bigint' ? val.toString() : val))
  );
}

module.exports = { jsonSafe };
