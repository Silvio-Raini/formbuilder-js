/**
 * History - Undo/Redo stack for schema changes
 */
export class History {
  constructor(maxStates = 50) {
    this.past = [];
    this.present = null;
    this.future = [];
    this.maxStates = maxStates;
  }

  /**
   * Push new state
   */
  push(state) {
    if (this.present !== null) {
      this.past.push(this.present);
      if (this.past.length > this.maxStates) {
        this.past.shift();
      }
    }
    this.present = JSON.parse(JSON.stringify(state));
    this.future = [];
  }

  /**
   * Undo to previous state
   */
  undo() {
    if (this.past.length === 0) return null;
    
    this.future.push(this.present);
    this.present = this.past.pop();
    return this.present;
  }

  /**
   * Redo to next state
   */
  redo() {
    if (this.future.length === 0) return null;

    this.past.push(this.present);
    this.present = this.future.pop();
    return this.present;
  }

  /**
   * Check if can undo
   */
  canUndo() {
    return this.past.length > 0;
  }

  /**
   * Check if can redo
   */
  canRedo() {
    return this.future.length > 0;
  }

  /**
   * Clear history
   */
  clear() {
    this.past = [];
    this.present = null;
    this.future = [];
  }
}

export default History;
