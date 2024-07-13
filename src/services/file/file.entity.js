const fs = require('fs');
const path = require('path');
const File = require('./file.schema');
/**
 * This function is for uploading files.
 *
 * Including:
 *  - Extracting file path, type, and original filename from the uploaded file object in `req.files`.
 *  - Validating the presence of these properties and performing basic file type check.
 *  - Calling a function `fileUp` to potentially save the uploaded file to a designated location and return the saved filename.
 *  - Inserting a record into the `files` table in the database with the saved filename, file type, and original filename (truncated to 38 characters to avoid potential database limitations).
 *  - Sending a success response with the newly inserted file's ID upon successful upload and insertion.
 *  - Sending a 400 Bad Request response if required file data is missing.
 *  - Sending a 400 Internal Server Error response with a specific error message if there's an issue with the file type.
 *  - Forwarding other errors to the next middleware using `next(e)`.
 */
module.exports.create = ({ db, filePath, fileCtrl: { fileUp } }) => async (req, res, next) => {
  try {
    const { path, type, originalFilename: org_filename } = req.files.file;
    if (!path || !type || !org_filename) return res.status(400).send(badRequest);
    const [fileType] = type.split('/');
    if (!fileType) return res.status(400).send({ type: 'fileTypeError', message: `Issue with file type for file ${org_filename}` });
    const filename = await fileUp(path, filePath);
    const file = await db.create({ table: File, payload: { filename, type, org_filename } })
    return res.status(200).send({ _id: file._id });
  } catch (e) { next(e) }
};

/**
 * This function is for getting a single file.
 *
 * Including
 *  - Extracts the file ID from the request parameters (`req.params.id`).
 *  - Queries the database table `files` to retrieve the filename associated with the file ID.
 *  - Checks if the file exists on the server using `fs.existsSync` (assuming `fs` is the file system module and `filePath` is a configured path).
 *  - Sends a 404 Not Found response if the file is not found in the database or on the server.
 *  - If the file exists, sends a 200 OK response and uses `res.sendFile` to stream the file content to the client.
 *  - Forwards other errors to the next middleware using `next(e)`.
 */
module.exports.get = ({ db, filePath }) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await db.findOne({ table: File, payload: { _id: id } });
    if (!file) return res.status(404).send({ message: 'File not found' });
    const exists = fs.existsSync(path.join(filePath, file.filename));
    if (!exists) return res.status(404).send({ message: 'File not found' });
    res.status(200).sendFile(path.join(filePath, file.filename));
  } catch (e) { next(e) }
};