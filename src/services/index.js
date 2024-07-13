const errorMiddleWare = require("../middlewares/errorMiddleWare");
const { commentApi } = require("./comment/comment");
const { fileApi } = require("./file/file");
const { userApi, userSocket } = require("./user/user");

function apiServices() {
  userApi.call(this);
  fileApi.call(this);
  commentApi.call(this);
  this.router.use(errorMiddleWare(this));//Inject the error middleware. It should be always at the end.
};

function socketServices() {
  userSocket.call(this);
};

module.exports = { apiServices, socketServices };