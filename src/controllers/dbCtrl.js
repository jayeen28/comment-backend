/**
 * Find multiple documents in a specified MongoDB collection.
 * @param {Object} options - An object with the following properties:
 * @param {string} options.table - The name of the collection to search.
 * @param {Object} [options.payload={}] - An object with payload-value pairs to use as a filter for the search.
 *   - allowedQuery (Set): A set of allowed query keys. If any provided query payload is not in this set, the function will reject with an error.
 *   - paginate (boolean): If true, the function will return a paginated result. If false, it will return all matching documents.
 *   - populate (Object): An object with the following properties:
 *     - path (string): The field to populate.
 *     - select (string): A space-separated string of fields to select.
 *   - query (Object): An object with payload-value pairs representing queries to filter the search by.
 *     - sortBy (string): A string in the format "field:order", where "field" is the field to sort by and "order" is either "asc" or "desc".
 *     - search (string): A string to search for in the collection.
 *     - page (number): The page number to return.
 *     - limit (number): The number of documents per page.
 *     - Any field of the provided table if allowed.
 * @returns {Promise} A promise that resolves with an array of found documents or an object with a `docs` array of found documents and metadata about the pagination, or rejects with an error if there is an issue with the query?.
 * @example
 * const result = await find({
 *   table: 'users',
 *   payload: {
 *     allowedQuery: new Set(['sortBy', 'search']),
 *     paginate: true,
 *     populate: { path: 'profile', select: 'name' },
 *     query: { sortBy: 'name:asc', search: 'john', page: 2, limit: 20 }
 *   }
 * });
 */
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

/**
 * Find a single document in a specified MongoDB collection.
 * @param {Object} options - An object with the following properties:
 * @param {string} options.table - The name of the collection to search.
 * @param {Object} [options.payload={}] - An object with payload-value pairs to use as a filter for the search.
 * @returns {Promise} A promise that resolves with the found document or null if no matching document is found, or rejects with an error if there is an issue with the query?.
 * @example
 * const result = await findOne({ table: 'users', payload: { name: 'John' } });
 */
module.exports.findOne = async ({ table, payload = {} }) => new Promise((resolve, reject) => {
  if (payload.id) payload._id = payload.id; delete payload.id;
  if (Object.keys(payload).length < 1) resolve(null);
  table.findOne(payload).populate(payload.populate?.path, payload.populate?.select?.split(' '))
    .then(res => resolve(res))
    .catch(e => reject(e));
});

/**
 * Create a new document in a specified MongoDB collection.
 * @param {Object} options - An object with the following properties:
 * @param {string} options.table - The name of the collection to create the document in.
 * @param {Object} options.payload - An object with payload-value pairs representing the fields and values of the new document.
 * @param {Object} [options.payload.populate] - An object with the following properties:
 *   - path (string): The field to populate.
 *   - select (string): A space-separated string of fields to select.
 * @returns {Promise} A promise that resolves with the created document, or rejects with an error if there is an issue with the creation.
 * @example
 * const result = await create({
 *   table: 'users',
 *   payload: { name: 'John', age: 30, populate: { path: 'profile', select: 'name' } }
 * });
 */
module.exports.create = async ({ table, payload }) => {
  const elem = await new table(payload);
  const res = await elem.save();
  payload.populate && await res.populate(payload.populate);
  return res;
};

/**
 * Update an existing document in a specified MongoDB collection.
 * @param {Object} options - An object with the following properties:
 * @param {string} options.table - The name of the collection to update the document in.
 * @param {Object} options.payload - An object with payload-value pairs representing the fields to update and their new values.
 *   - id (string): The ID of the document to update.
 *   - body (Object): An object with payload-value pairs representing the fields to update and their new values.
 *   - populate (Object): An object with the following properties:
 *     - path (string): The field to populate.
 *     - select (string): A space-separated string of fields to select.
 * @returns {Promise} A promise that resolves with the updated document, or rejects with an error if there is an issue with the update.
 * @example
 * const result = await update({
 *   table: 'users',
 *   payload: { id: '123', body: { name: 'John', age: 30 }, populate: { path: 'profile', select: 'name' } }
 * });
 */
module.exports.update = async ({ table, payload }) => {
  if (payload.id) payload._id = payload.id; delete payload.id;
  const element = await table.findOne(payload);
  if (!element) return null;
  Object.keys(payload.body || {}).forEach(param => element[param] = payload.body[param]);
  const res = await element.save();
  payload.populate && await res.populate(payload.populate?.path, payload.populate?.select?.split(' '));
  return element;
};


/**
 * remove - Removes an element from the specified table that matches the provided payload.
 *
 * @param {Object} options - An object containing the following fields:
 *   - table {string}: The name of the table to remove the element from.
 *   - payload {Object}: The payload to use to identify the element to remove.
 * @return {Promise} A promise that resolves with the removed element if it was found and removed successfully,
 *   or with `null` if no element was found. Rejects with an error if there was an issue removing the element.
 */
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

/**
 * removeAll - Removes all elements from the specified table.
 *
 * @param {Object} options - An object containing the following field:
 *   - table {string}: The name of the table to remove all elements from.
 * @return {Promise} A promise that resolves with an object containing information about the deleted elements.
 *   Rejects with an error if there was an issue deleting the elements.
 */
module.exports.removeAll = async ({ table, payload }) => {
  const res = await table.deleteMany(payload);
  return res;
};


module.exports.updateMany = async ({ table, payload }) => {
  const { filter, update, options, callback } = payload;
  const res = await table.updateMany(filter, update, options, callback);
  return res;
};

/**
 * save - Saves an element to the database.
 *
 * @param {Object} data - The element to save.
 * @return {Promise}approved A promise that resolves with the saved element if it was saved successfully.
 *   Rejects with an error if there was an issue saving the element.
 */
module.exports.save = async (data) => await data.save();

/**
 * Asynchronously populates the specified field(s) of a Mongoose model instance with documents from other collections.
 *
 * @param {Model} data - The Mongoose model instance to populate.
 * @param {Object|String} payload - An object or string specifying the field(s) to populate and any additional options.
 * @returns {Promise<Model>} A Promise that resolves to the populated model instance.
 * @throws {Error} If data is not a valid Mongoose model instance or if payload is not a valid object or string.
 * @throws {Error} If an error occurs while populating the model instance.
 */
module.exports.populate = async (data, payload = {}) => await data.populate(payload);

module.exports.sort = async (data, payload = {}) => await data.sort(payload);

module.exports.aggr = async ({ table, payload }) => await table.aggregate(payload);

module.exports.bulkCreate = ({ table, docs }) => table.insertMany(docs);