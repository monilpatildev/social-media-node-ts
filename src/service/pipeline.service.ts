const addToPipeline = (
  queries: (string | undefined)[],
  fieldsArray: string[],
  isPost: boolean = false
): object => {
  const conditions = queries.reduce((acc, query, index) => {
    if (!isPost) {
      acc.push({
        isDeleted: false,
      });
    }
    if (query) {
      acc.push({
        [fieldsArray[index]]: { $regex: query, $options: "i" },
      });
    }

    return acc;
  }, [] as object[]);

  if (conditions.length === 0) {
    return { $match: {} };
  }

  return isPost
    ? { $match: { $or: conditions } }
    : { $match: { $and: conditions } };
};

export default addToPipeline;
