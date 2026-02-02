/**
 * EventBus - Centralized event system for the entire application
 * Allows decoupled communication between modules
 */
export class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Function to call when event fires
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to event once only
   * @param {string} eventName
   * @param {Function} callback
   */
  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (data) => {
      callback(data);
      unsubscribe();
    });
  }

  /**
   * Emit an event
   * @param {string} eventName
   * @param {any} data
   */
  emit(eventName, data) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   * @param {string} eventName
   */
  off(eventName) {
    this.events.delete(eventName);
  }

  /**
   * Remove all listeners
   */
  clear() {
    this.events.clear();
  }
}

export default EventBus;
