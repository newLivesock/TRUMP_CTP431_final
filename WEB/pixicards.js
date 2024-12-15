"use strict";

import { theChuck, play } from "./webchuck.js"

const app = new PIXI.Application();
globalThis.__PIXI_APP__ = app; // PixiJS DevTools

let mode = "m"; // Move
let modeText;

let lines = {};

window.onload = async function() {
  await setup()
  createModeIndicator()
  await preload()
  addEventListener("keydown", handleKeyEvent)
  let elapsed = 0.0;
  app.ticker.add((time) => {
    elapsed += time.deltaTime;
    for (let lineId in lines) {
      updateLine(lineId);
    }
    if (elapsed > 300) {
      elapsed -= 300;
      play(0, 0);
    }
  })
}

// // // // // // // // // // // // // // // // https://pixijs.com/8.x/tutorials/fish-pond

async function setup() {
  await app.init({ background: "#3e8f74", resizeTo: window });
  const canvas = document.body.appendChild(app.canvas);
}

async function preload() {
  const assets = [];
  for (let suit of "SDHC") {
    for (let value = 1; value <= 13; value++) {
      const cardName = suit + value;
      assets.push({ alias: cardName, src: `./Image_trumpcards/${cardName}.png` });
    }
  }
  const textures = await PIXI.Assets.load(assets)
  for (const alias in textures) {
    textures[alias].source.scaleMode = "nearest";
  }
}

// // // // // // // // // // // // // // // //

parsePrompt(text) {
  const args = text.split(" "); // WIP
  const valueWord = args[0];
  const suitWord = args[2];

  let value;
  if (valueWord == "ace") {
    value = 1;
  } else {
    value = parseInt(valueWord);
  }

  return [suitWord, value];
}

class Card extends PIXI.Container {
  static movingCardDelta = null;
  static startConnectionCard = null;

  constructor(joker = false, faceWidth = 90, borderWidth = 2) {
    super();

    this.x = app.screen.width / 2;
    this.y = app.screen.height / 2;

    [this.suit, this.value] = parsePrompt(prompt("🃏"));

    this.face = PIXI.Sprite.from(this.suit[0].toUpperCase() + this.value);
    this.face.anchor.set(0.5);
    this.face.width = faceWidth;
    this.face.scale.y = this.face.scale.x;
    const faceHeight = this.face.height;

    this.border = new PIXI.Graphics().roundRect(-borderWidth, -borderWidth, faceWidth + 2*borderWidth, faceHeight + 2*borderWidth, 2*borderWidth).fill("214e3e");
    this.border.pivot.set(faceWidth / 2, faceHeight / 2);

    this.addChild(this.border);
    this.addChild(this.face);

    this.eventMode = "static";
    this.cursor = "pointer";
    this
      .on("pointerdown", Card.focusCard)
      .on("pointerup", Card.unselectCard)
      .on("pointerleave", Card.unselectCard)
      .on("pointermove", Card.updateMovingCard);

    this.joker = joker;
    this.next = null;
    this.prevs = [];

    this.selected = false;
  }

  static focusCard(event) {
    let focusedCard = event.currentTarget;
    if (mode === "x") {
      focusedCard.parent.removeChild(focusedCard); // WIP: remove lines
    } else if (mode === "m" && !Card.movingCardDelta) {
      focusedCard.parent.setChildIndex(focusedCard, focusedCard.parent.children.length - 1);
      focusedCard.selected = true;
      Card.movingCardDelta = {
        x: event.data.getLocalPosition(focusedCard.parent).x - focusedCard.position.x,
        y: event.data.getLocalPosition(focusedCard.parent).y - focusedCard.position.y
      };
    } else if (mode === "c") {
      if (!Card.startConnectionCard) { // start connection
        if (!focusedCard.next) {
          Card.startConnectionCard = focusedCard;
          focusedCard.seletcted = true;
        }
      } else {
        if (focusedCard.joker || focusedCard.prevs.length == 0) {
          toggleLine(Card.startConnectionCard, focusedCard);
          Card.startConnectionCard = null; // finished connection
        }
      }
    }
  }

  static unselectCard(event) {
    event.currentTarget.selected = false;
    Card.movingCardDelta = null;
  }

  static updateMovingCard(event) {
    let focusedCard = event.currentTarget;
    if (focusedCard.selected) {
      focusedCard.position.x = event.data.getLocalPosition(focusedCard.parent).x - Card.movingCardDelta.x;
      focusedCard.position.y = event.data.getLocalPosition(focusedCard.parent).y - Card.movingCardDelta.y;
    }
  }
}

function addCardSprite() {
  app.stage.addChild(new Card());
}



// // // // // // // // // // // // // // // //

function verboseMode(mode) {
  return { "m": "Move", "x": "Delete", "c": "Connect" }[mode]
}

function handleKeyEvent(event) {
  if (event.key === "n") { // New card
    addCardSprite();
  } else if ("mxc".includes(event.key)) {
    mode = event.key;
  }
  modeText.text = verboseMode(mode)
  if (theChuck === undefined) {
    modeText.text += "\nWaiting for WebChucK";
  }
}

function createModeIndicator() {
  let modeIndicator = new PIXI.Container()
  modeIndicator.x = 10
  modeIndicator.y = 10
  modeIndicator.alpha = 0.5

  modeText = new PIXI.Text({
    text: verboseMode(mode),
    style: {
      fill: "white",
      fontFamily: "monospace",
      padding: 10
    }
  });
  modeIndicator.addChild(modeText);
  app.stage.addChild(modeIndicator);
}

// // // // // // // // // // // // // // // //


// // // // // // // // // // // // // // // //

function getLineId(startCard, endCard) {
  return `${startCard.cardId}->${endCard.cardId}`;
}

function toggleLine(startCard, endCard) {
  const lineId = getLineId(startCard, endCard);
  if (lines[lineId]) {
    removeLine(lineId)
  } else {
    lines[lineId] = createLine(startCard, endCard)
  }
}

function removeLine(lineId) {
  if (lines[lineId]) {
    lines[lineId].parent.removeChild(lines[lineId]);
    lines[lineId] = null;
  }
}

function createLine(startCard, endCard) {
  let line = new PIXI.Container();
  const green = "214e3e88";

  const startCircle = new PIXI.Graphics().circle(0, 0, 36).fill(green);
  startCircle.position = startCard.position;
  line.addChild(startCircle);

  const endCircle = new PIXI.Graphics().circle(0, 0, 24).fill(green);
  endCircle.position = endCard.position;
  line.addChild(endCircle);

  const arrowBody = new PIXI.Graphics().moveTo(startCard.position.x, startCard.position.y).lineTo(endCard.position.x, endCard.position.y);
  arrowBody.stroke({ width: 8, color: green });
  line.addChild(arrowBody);

  app.stage.addChild(line);

  line.startCard = startCard;
  line.endCard = endCard;

  let lineId = getLineId(startCard, endCard);
  startCard.connectedLines.push(lineId);
  endCard.connectedLines.push(lineId);

  return line
}

function updateLine(lineId) {
  let line = lines[lineId];
  if (line) {
    line.getChildAt(0).position = line.startCard.position;
    line.getChildAt(1).position = line.endCard.position;
    line.getChildAt(2).clear().moveTo(line.startCard.position.x, line.startCard.position.y).lineTo(line.endCard.position.x, line.endCard.position.y).stroke({ width: 8, color: "214e3e88" });
  }
}

