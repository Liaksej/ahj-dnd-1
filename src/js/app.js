import { DomLogic } from "./domLogic.js";

function app() {
  const domLogic = new DomLogic();
  domLogic.headerEvents();
  domLogic.addCardEvents();
  domLogic.cardDrag();
}

app();
