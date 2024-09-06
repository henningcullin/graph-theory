/**
 * @typedef {Object} SelectionChangeDetail
 * @property {string} value - The selected value from the radio button group.
 */

/**
 * A custom event triggered when the selected radio button changes.
 *
 * @event RadioButtonGroup#selectionChange
 * @type {CustomEvent<SelectionChangeDetail>}
 * @property {SelectionChangeDetail} detail - The details of the selection change.
 */

/**
 * A custom element that represents a group of radio buttons. It allows for
 * selecting one value from the group and dispatches a custom event when the selection changes.
 *
 * @fires RadioButtonGroup#selectionChange
 * @property {string|null} value - The currently selected radio button value.
 * @property {(Function|null)} onChange - Optional callback for the selection change event.
 */
class RadioButtonGroup extends HTMLElement {
  constructor() {
    super();

    /** @private {string|null} _value - The internal value of the selected radio button. */
    this._value = null;

    /** @private {(Function|null)} _onChange - Optional callback for the selection change event. */
    this._onChange = null;

    this.attachShadow({ mode: "open" });

    if (!this.shadowRoot) {
      throw new Error("Shadow root not supported");
    }

    this.shadowRoot.innerHTML = `
      <style>
        ::slotted(label) {
          display: block;
          margin-bottom: 8px;
        }
      </style>
      <slot></slot>
    `;
  }

  /**
   * Getter for the value property.
   *
   * @returns {string|null} - The currently selected value.
   */
  get value() {
    return this._value;
  }

  /**
   * Setter for the value property.
   *
   * @param {string} newValue - The new value to set as the selected radio button.
   * @throws {Error} If the new value is not a string.
   */
  set value(newValue) {
    if (typeof newValue !== "string") {
      throw new Error("Value must be a string");
    }

    this._value = newValue;
    this.updateSelectedRadioButton(newValue);
    this.dispatchChange(newValue);
  }

  /**
   * Lifecycle method called when the element is connected to the DOM.
   * Sets up event listeners and initializes the selected value.
   */
  connectedCallback() {
    this.addEventListener("change", this.handleChange);
    this.updateSelectedRadioButton(this._value); // Select based on initial value
  }

  /**
   * Lifecycle method called when the element is disconnected from the DOM.
   * Cleans up event listeners.
   */
  disconnectedCallback() {
    this.removeEventListener("change", this.handleChange);
  }

  /**
   * Handle the change event for radio buttons.
   *
   * @param {Event} event - The change event from the radio button group.
   * @private
   */
  handleChange = (event) => {
    const target = /** @type {HTMLInputElement|null} */ (event.target);

    if (
      target &&
      target.tagName.toLowerCase() === "input" &&
      target.type === "radio"
    ) {
      this.value = target.value; // Update value when radio button changes
    }
  };

  /**
   * Dispatch a custom event when the selected value changes.
   *
   * @param {string} value - The new value that was selected.
   * @fires RadioButtonGroup#selectionChange
   * @private
   */
  dispatchChange(value) {
    /** @type {CustomEvent<SelectionChangeDetail>} */
    const changeEvent = new CustomEvent("selectionChange", {
      detail: { value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);
  }

  /**
   * Update the selected radio button programmatically.
   *
   * @param {string|null} newValue - The value to mark as selected.
   * @private
   */
  updateSelectedRadioButton(newValue) {
    const slot = this.shadowRoot?.querySelector("slot");
    if (!slot) return;

    const radioButtons = /** @type {HTMLLabelElement[]} */ (
      Array.from(slot.assignedNodes()).filter(
        (node) => node instanceof HTMLLabelElement
      )
    );

    radioButtons.forEach((label) => {
      const input = /** @type {HTMLInputElement|null} */ (
        label.querySelector('input[type="radio"]')
      );
      if (input) {
        input.checked = input.value === newValue;
      }
    });
  }

  /**
   * Set a callback for the selection change event.
   *
   * @param {Function} callback - The callback to execute when the selection changes.
   */
  set onChange(callback) {
    if (typeof callback !== "function") {
      throw new Error("onChange must be a function");
    }
    // Remove the previous event listener, if it exists
    if (this._onChange) {
      // @ts-ignore
      this.removeEventListener("selectionChange", this._onChange);
    }

    // Set the new callback and add the new event listener
    this._onChange = callback;
    // @ts-ignore
    this.addEventListener("selectionChange", this._onChange);
  }

  /**
   * Get the current callback for the selection change event.
   *
   * @returns {Function|null} - The current onChange callback or null if not set.
   */
  get onChange() {
    return this._onChange;
  }
}

// Register the custom element
customElements.define("radio-button-group", RadioButtonGroup);
