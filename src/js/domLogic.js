export class DomLogic {
  constructor() {
    this.lists = document.querySelectorAll(".trello-list");
    this.headers = document.querySelectorAll(".list-header");
    this.addCardLinks = document.querySelectorAll(".open-card-composer");
  }

  headerEvents() {
    const textareaOnBlurEventHandler = (e) => {
      if (
        e.type === "blur" ||
        (e.type === "keydown" && (e.key === "Enter" || e.key === "Escape"))
      ) {
        e.currentTarget
          .closest(".trello-list")
          .querySelector("h2").textContent = e.currentTarget.value;
        e.currentTarget.classList.add("noshow");
        e.currentTarget
          .closest(".trello-list")
          .querySelector("h2")
          .classList.remove("noshow");
      }
    };

    const headerOnEventHandler = (e) => {
      const textarea = e.currentTarget.querySelector("textarea");
      textarea.classList.remove("noshow");
      textarea.focus();
      e.currentTarget.querySelector("h2").classList.add("noshow");

      textarea.addEventListener("blur", textareaOnBlurEventHandler);
      textarea.addEventListener("keydown", textareaOnBlurEventHandler);
    };

    const autoResizeHandler = (e) => {
      e.target.style.height = e.target.scrollHeight + "px";
    };

    Array.from(this.headers).forEach((header) =>
      header.addEventListener("click", headerOnEventHandler),
    );

    const allTextareas = document.querySelector("textarea");
    Array.from(allTextareas).forEach((textarea) =>
      textarea.addEventListener("input", autoResizeHandler),
    );
  }

  addCardEvents() {
    const textareaOnBlurEventHandler = (e) => {
      if (e.type === "blur" || (e.type === "keydown" && e.key === "Escape")) {
        if (e.target.value.trim()) {
          this._cardCreator(
            e.target.closest(".list-cards").firstElementChild,
            e.target.value,
          );
          e.target.value = "";
        }
        e.currentTarget
          .closest(".list-content")
          .querySelector(".open-card-composer")
          .classList.remove("noshow");
        e.currentTarget.closest(".list-card").classList.add("noshow");
        e.target
          .closest(".list-content")
          .querySelector(".finish-add-card-btn")
          .classList.add("noshow");
      }
    };
    const addCardLinkHandler = (e) => {
      e.preventDefault();

      e.currentTarget.closest(".open-card-composer").classList.add("noshow");

      const cardComposer = e.target
        .closest(".list-content")
        .querySelector(".list-card");
      cardComposer.classList.remove("noshow");

      e.target
        .closest(".list-content")
        .querySelector(".finish-add-card-btn")
        .classList.remove("noshow");
      const textarea = cardComposer.querySelector("textarea");
      textarea.focus();

      textarea.addEventListener("blur", textareaOnBlurEventHandler);
      textarea.addEventListener("keydown", textareaOnBlurEventHandler);
    };

    Array.from(this.addCardLinks).forEach((addCardLink) => {
      addCardLink.addEventListener("click", addCardLinkHandler);
    });

    const addCardButtonEventHandler = (e) => {
      e.preventDefault();

      const textarea = e.target
        .closest(".list-content")
        .querySelector(".list-card-composer-textarea");

      if (textarea.value.trim()) {
        this._cardCreator(
          textarea.closest(".list-cards").firstElementChild,
          textarea.value,
        );
        textarea.value = "";
      }
    };

    Array.from(this.lists).forEach((list) => {
      list
        .querySelector(".finish-add-card-btn .add-btn")
        ?.addEventListener("mousedown", addCardButtonEventHandler);
    });
  }

  _cardCreator(list, text) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <div class="list-card-details js-card-details">
        <div class="list-card-front-labels-container js-list-card-front-labels-container">
          <div class="js-react-root"></div>
        </div>
        <span class="list-card-title js-card-name" dir="auto">
          <span class="card-short-id hide"></span>${text}
        </span>
        <div class="badges">
          <span class="js-badges"></span>
          <span class="custom-field-front-badges js-custom-field-badges">
            <span></span>
          </span>
          <span class="js-plugin-badges">
            <span></span>
          </span>
        </div>
        <div class="list-card-members js-list-card-members js-list-draggable-card-members"></div>
      </div>`;
    list.appendChild(card);
  }
}
