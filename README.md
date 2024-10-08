Run `yarn dev` or `npm run dev` this command will install the dependencies and start the server. The backend can serve client build too. I have pushed the updated build in this repo. So if port not changed then you will find the client at http://localhost:4000 and the api will be served at http://localhost:4000/api.

To run in watch mode you can use `yarn run dev:watch`.

*** The rest of this readme is about falcon boilerplate which is built by me to develop backend in a faster way. You can ignore these if you want. ***

# About Falcon Boilerplate
<img src="https://i.ibb.co/sWqXfkz/Screenshot-from-2024-04-29-15-08-28.png" align="left" width="30%" style="margin-right: 10px"/>
Falcon Boilerplate is a service-based Node.js backend boilerplate that will help you kickstart and manage your projects more efficiently. This REST API server boilerplate is built upon a powerful stack of technologies, including Express.js, Socket.io, and Prisma with postgresql, to provide a comprehensive solution for web service development and database management. You can work faster like a falcon by using this template.
<br clear="left"/>
<br clear="left"/>

- [Getting Started](#getting-started)
  - [Folder Renaming](#folder-renaming)
  - [Configuration](#configuration)
  - [Install Dependencies](#install-dependencies)
  - [Start the Server](#start-the-server)

- [Creating Services](#creating-services)
  - [Create the service root file](#create-the-service-root-file)
  - [Generate service and entity with vs code snippets](#generate-service-and-entity-with-vs-code-snippets)
  - [Create the api routes and register socket listeners in the service root file](#create-the-api-routes-and-register-socket-listeners-in-the-service-root-file)
  - [Create entity functions](#create-entity-functions)
  - [Inject the service in the app](#inject-the-service-in-the-app)

- [Handling Api Error](#handling-api-error)
- [Serving Client](#serving-client)


## Getting Started

Follow these steps to get started with Falcon Boilerplate:


1. <a id="folder-renaming">**Folder Renaming:**</a> <br> Start by renaming the `demo_ssl` folder to `ssl` and `demo_settings` to `settings`.

1. <a id="configuration">**Configuration:**</a> <br> Configure your application settings in the `settings/dev.js` file for development and `settings/prod.js` for production. You will get the settings inside every request and socket events. The settings used will be determined by the NODE_ENV variable inside the index.js file at the root.

1. <a id="install-dependencies">**Install Dependencies**</a> <br> Run the following command to install project dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

1. <a id="start-the-server">**Start the Server**</a> <br> Start the server using nodemon to enable hot-reloading during development:

    ```bash
    yarn dev
    ```

## Creating Services
Follow these steps to create a new service:

1. <a id="create-the-service-root-file">**Create the service root file**</a> <br> Start by organizing your services within the `services` directory. Each service should have its own dedicated folder and a corresponding file for the service entry points also a single or multiple entity file for building the core logic.<br>
Example:
    ```plaintext
    - services
      | - user
        | - user.js
        | - user.entity.js
        | - user.schema.js
    ```

1. <a id="generate-service-and-entity-with-vs-code-snippets">**Generate service and entity with vs code snippets**</a> <br> If you are using vs code then use `service` to generate basic crud in a service root file.
    | Trigger | Content                      |
    | ------: | ---------------------------- |
    |   `service` | `service code with basic crud api routes and socket function.` |


1. <a id="create-the-api-routes-and-register-socket-listeners-in-the-service-root-file">**Create the api routes and register socket listeners in the service root file**</a> <br>
Service Root File (e.g., user.js):
    ```javascript
    const { create, handleClickButton } = require('./user.entity');

    /**
     * INSTRUCTIONS:
     * 1. Call API and socket handler functions from entity file (e.g., user.entity.js).
     */

    /**
     * Define API routes for user management.
     */
    function userApi() {

      /**
       * POST /user
       * @description This route is used to create a user.
       * @response {Object} 201 - The new user.
       * @body {Object} - The data to create a user.
      */
      this.router.post('/user', create(this));
    }

    /**
     * Register event handlers for user-related events.
     */
    function userSocket() {
          this.socket.on('clickedButton', handleClickButton(this));
    }

    module.exports = { userApi, userSocket };
    ```

1. <a id="create-entity-functions">**Create entity functions**</a> <br>
Entity File (e.g., user.entity.js):
    ```javascript
    import User from './user.schema.js';

    module.exports.create = ({ db }) => async (req, res, next) => {
        try {
            const { role } = req.params;
            req.body.password = await bcrypt.hash(req.body.password, 8);
            const user = await db.create({ table: User, payload: req.body});
            if(!user) return res.status(400).send({ message : 'Bad request' });
            res.status(201).send({ message: 'User registration successful' });
          } catch (e) { next(e) }
    };

    module.exports.handleClickButton = async ({ db }) => {
      // Implement the functionality you need.
    }
    ```
    `Note: In this boilerplate, all functions are connected to the Falcon class. This gives you access to various features, like I have accessed the db above. It also allows you to easily add new tools and functionalities to the Falcon class and access them globally.`

## Inject the service in the app
Lastly For making the service available for your clients you have to inject that in the app.<br>
Follow these steps:

1. **Inject api service**: <br>
    ```diff
    const { errorMiddleware } = require("./middlewares");
    +const { userApi } = require("./user/user");

    function apiServices() {
    + userApi.call(this);
      this.router.use(errorMiddleware(this))
    };
    ```

2. **Inject socket service**: <br>
    ```diff
    const { errorMiddleware } = require("./middlewares");
    +const { userApi, userSocket } = require("./user/user");

    function apiServices() {
      userApi.call(this);
      this.router.use(errorMiddleware(this))
    };

    function socketServices() {
    +  userSocket.call(this);
    };
    ```
    As simple as that. Your services are good to go now.

## Handling Api Error
In the entity, if you invoke the `next` function of express with an `Error` instance as its first parameter, the `errorMiddleware` function will be triggered. The error will be permanently logged in the `data/server_error/{year}/{month}/{day}.log` file, and the client will receive a 500 response with a reference id. If reference id is not found in the response, it means the middleware failed to save the error. The error log can be found in the console.
```javascript
module.exports.create = ({ db }) => async (req, res, next) => {
  try {
    const user = await db.create({ table: TABLE_NAME, payload: { data: req.body } });
    return res.status(201).send(user);
  } catch (e) { next(e) }
};
```

## Serving client
You can place your client code inside the `client` folder. The Falcon boilerplate will search for the `index.html` file to serve the client.


Created by [jayeen28](https://github.com/jayeen28) with ❤️