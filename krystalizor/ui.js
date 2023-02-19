export class Modal {
  /**
   * @param {Object} settings
   * @param {string} settings.id
   * @param {[string]} settings.title
   * @param {[string]} settings.body
   * @param {[string]} settings.footer
   * @param {[string[]]} settings.buttonIds
   */
  constructor(settings = {}) {
    this.construct(settings);
    this.bindEvents(settings);
  }

  construct({ id, title, body, footer }) {
    title = title
      ? `
      <div class="modal-header">
        <span class="modal-close">&times;</span>
        <h2>${title}</h2>
      </div>`
      : "";
    body = body
      ? `
      <div class="modal-body">
        ${body}
      </div>`
      : "";
    footer = footer
      ? `
      <div class="modal-footer">
        ${footer}
      </div>`
      : "";

    const modal = document.createElement("div");
    modal.id = id;
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        ${title}
        ${body}
        ${footer}
      </div>`;
    document.body.querySelector("script").before(modal);
    this.modal = modal;
  }

  bindEvents({ buttonIds }) {
    for (let i = 0; i < buttonIds.length; i++) {
      const btn = document.getElementById(buttonIds[i]);
      if (!btn) continue;
      btn.addEventListener("click", () => this.open());
    }

    const closeBtns = this.modal.querySelectorAll("span.modal-close");
    for (let i = 0; i < closeBtns.length; i++) {
      const btn = closeBtns[i];
      btn.addEventListener("click", () => this.close());
    }
  }

  open() {
    this.modal.style.display = "block";
    this.outsideClickEvent = (e) => {
      if (e.target === this.modal) this.close();
    };
    this.keyupEvent = (e) => {
      if (e.key === "Escape") this.close();
    };

    window.addEventListener("click", this.outsideClickEvent);
    document.addEventListener("keyup", this.keyupEvent);
  }

  close() {
    this.modal.style.display = "none";
    window.removeEventListener("click", this.outsideClickEvent);
    window.removeEventListener("click", this.keyupEvent);
  }

  destroy() {
    document.body.removeChild(this.modal);
  }
}

export class ConfirmModal extends Modal {
  /**
   * @param {Object} settings
   * @param {string} settings.id
   * @param {[string]} settings.title
   * @param {[string]} settings.body
   * @param {[string[]]} settings.buttonIds
   * @param {[() => void]} settings.okText
   * @param {[string]} settings.onOk
   * @param {[() => void]} settings.onCancel
   * @param {[string]} settings.cancelText
   */
  constructor(settings = {}) {
    super(settings);
  }

  construct({ id, title, body, okText = "Confirm", cancelText = "Cancel" }) {
    const footer = `
      <div class="panel__actions">
        <button class="btn btn-sm modal-confirm">${okText}</button>
        <button class="btn btn-sm modal-cancel">${cancelText}</button>
      </div>
    `;
    super.construct({ id, title, body, footer });
  }

  bindEvents({ buttonIds, onOk, onCancel }) {
    super.bindEvents({ buttonIds });

    const noop = () => null;
    onOk ??= noop;
    onCancel ??= noop;

    const closeBtns = this.modal.querySelectorAll(".modal-close");
    for (let i = 0; i < closeBtns.length; i++) {
      const btn = closeBtns[i];
      btn.addEventListener("click", (e) => onCancel(e));
    }

    const cancelBtn = this.modal.querySelector(".modal-cancel");
    const confirmBtn = this.modal.querySelector(".modal-confirm");

    cancelBtn.addEventListener("click", (e) => {
      onCancel(e);
      this.close();
    });
    confirmBtn.addEventListener("click", (e) => {
      onOk(e);
      this.close();
    });
  }
}
