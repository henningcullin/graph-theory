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
  }

  connectedCallback() {
    this.addEventListener("change", this.handleChange);
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
      this.dispatchChange(event.target.value);
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
