/**
 * Represents a popup dialog.
 */
export class Popup {
  /**
   * Creates a new Popup instance.
   */
  constructor() {
    // Create the dialog element and add it to the body
    /** @type {HTMLDialogElement} */
    this.dialog = document.createElement("dialog");
    this.dialog.setAttribute("class", "popup-dialog");
    document.body.appendChild(this.dialog);

    // Style the dialog
    this.dialog.style.width = "300px";
    this.dialog.style.padding = "20px";
    this.dialog.style.border = "1px solid #ccc";
    this.dialog.style.borderRadius = "5px";
    this.dialog.style.backgroundColor = "#fff";
    this.dialog.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";

    // Add a close button
    /** @type {HTMLButtonElement} */
    this.closeButton = document.createElement("button");
    this.closeButton.textContent = "Close";
    this.closeButton.addEventListener("click", () => this.close());
    this.dialog.appendChild(this.closeButton);

    // Add options container
    /** @type {HTMLDivElement} */
    this.optionsContainer = document.createElement("div");
    this.dialog.appendChild(this.optionsContainer);
  }

  /**
   * Sets the content of the popup dialog with action options.
   * @param {Array<{label: string, action: () => void}>} options - An array of options for the popup.
   */
  setContent(options) {
    // Clear existing content
    this.optionsContainer.innerHTML = "";

    // Add buttons based on provided options
    options.forEach((option) => {
      /** @type {HTMLButtonElement} */
      const button = document.createElement("button");
      button.textContent = option.label;
      button.addEventListener("click", option.action);
      this.optionsContainer.appendChild(button);
    });
  }

  /**
   * Shows the popup dialog.
   */
  show() {
    this.dialog.showModal();
  }

  /**
   * Closes the popup dialog.
   */
  close() {
    this.dialog.close();
  }
}
