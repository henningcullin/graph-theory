class RadioButtonGroup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        ::slotted(label) {
          display: block;
          margin-bottom: 8px;
        }
      </style>
      <slot></slot>
    `;

    this._value = null; // Internal value to track selected radio button
  }

  // Getter for the value property
  get value() {
    return this._value;
  }

  // Setter for the value property
  set value(newValue) {
    this._value = newValue;
    this.updateSelectedRadioButton(newValue);
    this.dispatchChange(newValue);
  }

  connectedCallback() {
    this.addEventListener("change", this.handleChange);
    this.updateSelectedRadioButton(this._value); // Select based on initial value
  }

  disconnectedCallback() {
    this.removeEventListener("change", this.handleChange);
  }

  // Handle radio button change
  handleChange = (event) => {
    if (
      event.target.tagName.toLowerCase() === "input" &&
      event.target.type === "radio"
    ) {
      this.value = event.target.value; // Update value when radio button changes
    }
  };

  // Dispatch a custom event when the selection changes
  dispatchChange(value) {
    const changeEvent = new CustomEvent("selectionChange", {
      detail: { value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);
  }

  // Update the selected radio button programmatically
  updateSelectedRadioButton(newValue) {
    const slot = this.shadowRoot.querySelector("slot");
    const radioButtons = slot
      .assignedNodes()
      .filter((node) => node.tagName === "LABEL");

    radioButtons.forEach((label) => {
      const input = label.querySelector('input[type="radio"]');
      if (input) {
        input.checked = input.value === newValue;
      }
    });
  }

  // Optional: Allow setting a callback for the change event
  set onChange(callback) {
    this._onChange = callback;
    this.addEventListener("selectionChange", this._onChange);
  }

  get onChange() {
    return this._onChange;
  }
}

// Register the custom element
customElements.define("radio-button-group", RadioButtonGroup);
