module.exports.findOne = async ({ table, payload = {} }) => {
  if (Object.keys(payload).length < 1) resolve(null);
  return table.findOne(payload).populate(payload.populate?.path, payload.populate?.select?.split(' '));
};

module.exports.create = async ({ table, payload }) => {
  const elem = await new table(payload);
  const res = await elem.save();
  payload.populate && await res.populate(payload.populate);
  return res;
};

module.exports.rawUpdate = async ({ table, payload }) => {
  return table.updateOne(payload.query, payload.update);
}

module.exports.updateWithSave = async ({ table, payload }) => {
  const element = await table.findOne(payload.query);
  if (!element) return null;
  Object.keys(payload.update || {}).forEach(param => element[param] = payload.update[param]);
  const res = await element.save();
  payload.populate && await res.populate(payload.populate?.path, payload.populate?.select?.split(' '));
  return element;
};

module.exports.remove = async (target) => {
  const { table, payload } = target;
  return table.deleteOne(payload);
};

module.exports.removeAll = async ({ table, payload }) => {
  return await table.deleteMany(payload);
};


module.exports.updateMany = async ({ table, payload }) => {
  const { filter, update, options, callback } = payload;
  const res = await table.updateMany(filter, update, options, callback);
  return res;
};

module.exports.save = (data) => data.save();

module.exports.populate = (data, payload = {}) => data.populate(payload);

module.exports.sort = (data, payload = {}) => data.sort(payload);

module.exports.aggr = ({ table, payload }) => table.aggregate(payload);

module.exports.bulkCreate = ({ table, docs }) => table.insertMany(docs);