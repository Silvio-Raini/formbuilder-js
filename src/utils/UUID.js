/**
 * UUID - Generate unique identifiers
 */
export class UUID {
  static generate() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static generateFieldId() {
    return `field_${this.generate()}`;
  }

  static generateSectionId() {
    return `section_${this.generate()}`;
  }
}

export default UUID;
