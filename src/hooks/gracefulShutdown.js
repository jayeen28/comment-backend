/**
 * gracefulShutdown handles graceful shutdown of a Node.js application by registering event listeners
 * for specific signals and errors.
 *
 * @module gracefulShutdown
 */

const { default: mongoose } = require("mongoose");

/**
 * Register event handlers for graceful shutdown.
 */
module.exports = function () {
  /**
   * Event handler function for graceful shutdown events.
   *
   * @param {Error} signal - The shutdown signal.
   */
  async function handleShutdownEvent(signal) {
    try {
      // Log the original error or event object.
      console.log(`Process shutdown signal: ${signal}`);

      //****** Perform any necessary cleanup or finalization here. ******/
      await mongoose.connection.close();
      console.log('Mongodb closed');
      if (this.io) {
        this.io.local.disconnectSockets();
        this.io.close();
      }
      if (this.server) this.server.close(() => {
        console.log('Server closed');
      });

      this.emitter.removeAllListeners();
    } catch (e) {
      console.error(e);

      // Exit the process gracefully.
      process.exit(1);
    }
  }
  process.on('SIGTERM', handleShutdownEvent.bind(this));
  process.on('SIGINT', handleShutdownEvent.bind(this));
  process.on('SIGUSR2', handleShutdownEvent.bind(this));
};
