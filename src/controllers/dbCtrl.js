module.exports.find = ({ table, payload = {} }) => new Promise((resolve, reject) => {
  const queryKeys = Object.keys(payload?.query || {});
  const noPaginate = payload.paginate === false;
  payload.options = noPaginate ?
    { sort: {}, ...payload?.query?.limit && { limit: payload?.query?.limit } } :
    {
      ...payload.populate && { populate: { ...payload.populate } },
      page: payload?.query?.page || 0,
      limit: payload?.query?.limit || 10,
      sort: { ...!payload?.query?.sortBy && { createdAt: -1 } }
    };

  // prepare query object with provied queries to find.
  queryKeys.forEach(async k => {
    if (typeof payload?.query[k] === 'string' && payload?.query[k].startsWith('{"') && payload?.query[k].endsWith('}')) payload.query[k] = JSON.parse(payload?.query[k]);
    if (k === 'sortBy') {
      const parts = payload?.query?.sortBy.split(':');
      return payload.options.sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    if (k === 'id') {
      payload._id = payload?.query?.id;
      return delete payload?.query?.id;
    }
    payload[k] = payload?.query[k];
  });

  const method = noPaginate ? 'find' : 'paginate';
  const options = payload.options;
  const populate = payload.populate;
  delete payload.allowedQuery;
  delete payload.populate;
  delete payload.paginate;
  delete payload.options;
  delete payload?.query;
  const args = [payload, ...noPaginate ? [null] : [], options];
  // May break
  resolve(table[method](...args)[noPaginate ? 'populate' : 'then'](populate))
    .then(res => resolve(res))
    .catch(e => reject(e));
});

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
  const { table, payload, _id } = target;
  if (_id) {//if mongodb instance found then delete with obj.remove method.
    await target.remove();
    return target;
  }
  if (payload.id) payload._id = payload.id; delete payload.id;
  const element = await table.findOne(payload);
  if (!element) return null;
  await element.remove();
  return element;
};

module.exports.removeAll = async ({ table, payload }) => {
  const res = await table.deleteMany(payload);
  return res;
};


module.exports.updateMany = async ({ table, payload }) => {
  const { filter, update, options, callback } = payload;
  const res = await table.updateMany(filter, update, options, callback);
  return res;
};

module.exports.save = async (data) => await data.save();

module.exports.populate = async (data, payload = {}) => await data.populate(payload);

module.exports.sort = async (data, payload = {}) => await data.sort(payload);

module.exports.aggr = async ({ table, payload }) => await table.aggregate(payload);

module.exports.bulkCreate = ({ table, docs }) => table.insertMany(docs);