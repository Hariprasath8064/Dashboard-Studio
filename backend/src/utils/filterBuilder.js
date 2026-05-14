const buildFilterClause = (filters, availableProps = [], filterLogic = 'AND') => {
  if (!filters || filters.length === 0) return '';

  const clauses = filters.map(f => {
    if (f.type === 'macro') {
      if (f.macroType === 'script_substring_compare') {
        const sub1 = f.sub1.replace(/"/g, '""');
        const sub2 = f.sub2.replace(/"/g, '""');
        return `(exists (scripts of actions of it) whose (number of substrings "${sub1}" of it ${f.operator} number of substrings "${sub2}" of it))`;
      }
    }

    const propDef = availableProps.find(p => p.relevancePath === f.property);
    const dataType = propDef ? propDef.dataType.toLowerCase() : 'string';
    const propRef = `${f.property} of it`;

    if (dataType === 'string') {
      const val = f.value.toLowerCase().replace(/"/g, '""');
      if (f.operator === 'contains')         return `(exists (it) whose (it as string as lowercase contains "${val}") of (${propRef}))`;
      if (f.operator === 'does not contain') return `(not exists (it) whose (it as string as lowercase contains "${val}") of (${propRef}))`;
      if (f.operator === 'starts with')      return `(exists (it) whose (it as string as lowercase starts with "${val}") of (${propRef}))`;
      if (f.operator === 'ends with')        return `(exists (it) whose (it as string as lowercase ends with "${val}") of (${propRef}))`;
      if (f.operator === '=')                return `(exists (it) whose (it as string as lowercase = "${val}") of (${propRef}))`;
      if (f.operator === '!=')               return `(not exists (it) whose (it as string as lowercase = "${val}") of (${propRef}))`;
    }

    if (dataType === 'integer') {
      return `(exists (it) whose (it as string as integer ${f.operator} ${parseInt(f.value, 10) || 0}) of (${propRef}))`;
    }

    if (dataType === 'boolean') {
      const isTrue = f.value.toLowerCase() === 'true' || f.operator === 'is true';
      return `(exists (it) whose (it as string as boolean = ${isTrue ? 'True' : 'False'}) of (${propRef}))`;
    }

    if (dataType === 'date' || dataType === 'time' || dataType === 'time of day' || dataType === 'time interval') {
      const op = f.operator === 'before' ? '<' : f.operator === 'after' ? '>' : f.operator;
      return `(exists (it) whose (it as string as ${dataType} ${op} "${f.value}" as ${dataType}) of (${propRef}))`;
    }

    return `(exists (it) whose (it as string as lowercase ${f.operator} "${f.value.toLowerCase()}") of (${propRef}))`;
  });

  return clauses.join(` ${filterLogic} \n\t\t\t`);
};

module.exports = { buildFilterClause };
