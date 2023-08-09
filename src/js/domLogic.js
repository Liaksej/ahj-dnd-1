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
      textarea.value = e.currentTarget.querySelector("h2").textContent;
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

    const allTextAreas = document.querySelectorAll("textarea");
    Array.from(allTextAreas).forEach((textarea) =>
      textarea.addEventListener("input", autoResizeHandler),
    );
  }

  addCardEvents() {
    const textareaOnBlurEventHandler = (e) => {
      if (e.type === "blur") {
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
    const textareaOnKeyEventHandler = (e) => {
      if (e.key === "Escape") {
        e.target.value = "";
        e.currentTarget.blur();
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (e.target.value.trim()) {
          addCardButtonEventHandler(e);
        }
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
      textarea.addEventListener("keydown", textareaOnKeyEventHandler);
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

  cardRemove() {
    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("cancel")) {
        const cardForRemove = event.target.closest(".card");
        cardForRemove.remove();
      }
    });
  }

  cardDrag() {
    let actualElement;
    let marker;

    let mouseDownX = 0,
      mouseDownY = 0;

    Array.from(document.querySelectorAll(".cards-room")).forEach(
      (cardsContainer) => {
        cardsContainer.addEventListener("mousedown", (e) => {
          // Check if the target is cancel button
          if (e.target.classList.contains("cancel")) {
            return;
          }

          if (e.target.classList.contains("card")) {
            actualElement = e.target;
          }

          if (
            !e.target.classList.contains("card") &&
            e.target.closest(".card")
          ) {
            actualElement = e.target.closest(".card");
          }

          const cardsRoom = e.target
            ?.closest(".list-content")
            ?.querySelector(".cards-room");

          marker = document.createElement("div");
          marker.id = "dragMarker";
          marker.style.height = `${actualElement?.offsetHeight - 10}px`;

          if (actualElement) {
            mouseDownX = e.clientX - actualElement.getBoundingClientRect().left;
            mouseDownY = e.clientY - actualElement.getBoundingClientRect().top;

            document.body.style.cursor = "grab";

            actualElement.classList.add("dragged");
            cardsRoom.insertBefore(marker, actualElement);

            document.documentElement.addEventListener(
              "mouseup",
              onMouseUpHandler,
            );
            document.documentElement.addEventListener(
              "mousemove",
              onMouseMoveHandler,
            );
          }
        });
      },
    );

    const onMouseMoveHandler = (e) => {
      e.preventDefault();

      if (actualElement) {
        actualElement.style.top = `${e.clientY - mouseDownY}px`;
        actualElement.style.left = `${e.clientX - mouseDownX}px`;

        actualElement.style.pointerEvents = "none";

        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);

        const cardsRoom = elementBelow
          ?.closest(".list-content")
          ?.querySelector(".cards-room");

        actualElement.style.pointerEvents = "auto";

        if (cardsRoom) {
          const { top: listTop, bottom: listBottom } =
            cardsRoom.getBoundingClientRect();
          if (e.clientY < listTop) {
            cardsRoom.prepend(marker);
          }
          if (e.clientY > listBottom) {
            cardsRoom.appendChild(marker);
          } else {
            if (cardsRoom.childElementCount > 0) {
              const items = Array.from(cardsRoom.childNodes);

              for (const item of items) {
                actualElement.style.display = "none";
                const { top: itemTop, bottom: itemBottom } =
                  item.getBoundingClientRect();
                actualElement.style.display = "block";

                if (e.clientY > itemTop) {
                  cardsRoom.insertBefore(marker, item);
                }

                if (e.clientY < itemBottom) {
                  cardsRoom.insertBefore(marker, item.nextSibling);
                  break;
                }
              }
            }
          }
        }
      }
    };

    const onMouseUpHandler = (e) => {
      actualElement.classList.remove("dragged");

      const elementBelow = document.elementFromPoint(e.clientX, e.clientY);

      if (actualElement && elementBelow.closest(".trello-list")) {
        const cardsRoom = elementBelow
          .closest(".list-content")
          .querySelector(".cards-room");
        if (marker.parentNode === cardsRoom) {
          cardsRoom.replaceChild(actualElement, marker);
        }
      }

      if (marker) {
        marker.remove();
      }

      actualElement.style.top = "";
      actualElement.style.left = "";

      document.body.style.cursor = "default";
      actualElement = undefined;
      marker = undefined;
      mouseDownX = 0;
      mouseDownY = 0;

      document.documentElement.removeEventListener(
        "mousemove",
        onMouseMoveHandler,
      );
      document.documentElement.removeEventListener("mouseup", onMouseUpHandler);
    };
  }

  _cardCreator(currentList, text) {
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
        <button class="cancel">X
        </button>
        <div class="list-card-members js-list-card-members js-list-draggable-card-members"></div>
      </div>`;
    currentList.appendChild(card);
  }

  saveToLocalStorage() {
    window.addEventListener("beforeunload", () => {
      const kanbanData = {};

      let listCount = 0;

      this.lists.forEach((list) => {
        const listName = listCount++;
        const listHeader = list.querySelector(
          ".list-header-name-assist",
        ).textContent;
        if (listHeader.trim()) {
          kanbanData[`${listName}`] = { header: listHeader };
        }

        const cardsRoom = list.querySelector(".cards-room");
        if (cardsRoom.childElementCount > 0) {
          const cards = cardsRoom.querySelectorAll(".card");
          const listOfCardsNames = [];
          Array.from(cards).forEach((card) => {
            listOfCardsNames.push(
              card.querySelector(".list-card-title").textContent,
            );
          });
          kanbanData[`${listName}`].cards = listOfCardsNames;
        }
      });
      localStorage.setItem("kanbanData", JSON.stringify(kanbanData));
    });

    document.addEventListener("DOMContentLoaded", () => {
      const json = localStorage.getItem("kanbanData");

      let kanbanData;

      try {
        kanbanData = JSON.parse(json);
      } catch (error) {
        console.log(error);
      }

      if (kanbanData) {
        Object.keys(kanbanData).forEach((key) => {
          const currentList = Array.from(this.lists)[+key];
          if (kanbanData[key].header) {
            currentList.querySelector(".list-header-name-assist").textContent =
              kanbanData[key].header;
          }
          if (kanbanData[key].cards) {
            const cardsRoom = currentList.querySelector(".cards-room");
            kanbanData[key].cards.forEach((card) => {
              this._cardCreator(cardsRoom, card.trim());
            });
          }
        });
      }
    });
  }
}
