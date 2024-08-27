export class Popup {
  constructor() {
    // Create the dialog element and add it to the body
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
    this.closeButton = document.createElement("button");
    this.closeButton.textContent = "Close";
    this.closeButton.addEventListener("click", () => this.close());
    this.dialog.appendChild(this.closeButton);

    // Add options container
    this.optionsContainer = document.createElement("div");
    this.dialog.appendChild(this.optionsContainer);
  }

  setContent(options) {
    // Clear existing content
    this.optionsContainer.innerHTML = "";

    // Add buttons based on provided options
    options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option.label;
      button.addEventListener("click", option.action);
      this.optionsContainer.appendChild(button);
    });
  }

  show() {
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }
}
