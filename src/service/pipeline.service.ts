const addToPipeline = (
  queries: (string | undefined)[],
  fieldsArray: string[],
  isPost: boolean = false
): object => {
  if (queries.length === 0) return { $match: {} };

  const conditions: object[] = !isPost ? [{ isDeleted: false }] : [];
  const conditionSet = new Set<string>();

  if (!isPost) {
    conditionSet.add(JSON.stringify({ isDeleted: false }));
  }
  for (const [index, query] of queries.entries()) {
    if (query) {
      const newCondition = {
        [fieldsArray[index]]: { $regex: query, $options: "i" },
      };
      const conditionStr = JSON.stringify(newCondition);

      if (!conditionSet.has(conditionStr)) {
        conditionSet.add(conditionStr);
        conditions.push(newCondition);
      }
    }
  }

  if (conditions.length === 0) return { $match: {} };

  return isPost
    ? { $match: { $or: conditions } }
    : { $match: { $and: conditions } };
};

export default addToPipeline;
