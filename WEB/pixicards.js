"use strict";

import { play } from "./webchuck.js"

const app = new PIXI.Application();
globalThis.__PIXI_APP__ = app; // PixiJS DevTools

const cards = [];
let totalCardsMade = 0;
let mode = "m"; // Move
let modeText;

let movingCardId;
let movingCardDelta = {x: null, y: null};

let startConnectionCard;
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

function addCardSprite(faceWidth = 90, borderWidth = 2) {

  let card = new PIXI.Container();
  card.x = app.screen.width / 2;
  card.y = app.screen.height / 2;

  let cardFace = PIXI.Sprite.from(prompt());
  cardFace.anchor.set(0.5);
  cardFace.width = faceWidth;
  cardFace.scale.y = cardFace.scale.x;
  const faceHeight = cardFace.height

  let cardBorder = new PIXI.Graphics().roundRect(-borderWidth, -borderWidth, faceWidth + 2*borderWidth, faceHeight + 2*borderWidth, 2*borderWidth).fill("214e3e");
  cardBorder.pivot.set(faceWidth / 2, faceHeight / 2);

  card.addChild(cardBorder);
  card.addChild(cardFace);

  card.eventMode = "static";
  card.cursor = "pointer";
  card
    .on("pointerdown", focusCard)
    .on("pointerup", unfocusCard)
    .on("pointerleave", unfocusCard)
    .on("pointermove", updateMovingCard)

  card.cardId = totalCardsMade++;
  app.stage.addChild(card);
  cards.push(card);

  card.connectedLines = [];
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

function focusCard(event) {
  let focusedCard = event.currentTarget;
  if (mode === "x") {
    focusedCard.parent.removeChild(focusedCard);
    cards[focusedCard.cardId] = null;
    for (let lineId of focusedCard.connectedLines) {
      removeLine(lineId)
    }
  } else if (mode === "m" && !movingCardId) {
    focusedCard.parent.setChildIndex(focusedCard, focusedCard.parent.children.length - 1);
    movingCardId = focusedCard.cardId;
    movingCardDelta.x = event.data.getLocalPosition(focusedCard.parent).x - focusedCard.position.x;
    movingCardDelta.y = event.data.getLocalPosition(focusedCard.parent).y - focusedCard.position.y;
  } else if (mode === "c") {
    if (!startConnectionCard) { // start connection
      startConnectionCard = focusedCard;
    } else {
      toggleLine(startConnectionCard, focusedCard);
      startConnectionCard = null; // finished connection
    }
  }
}

function unfocusCard(event) {
  movingCardId = null;
  movingCardDelta.x = null;
  movingCardDelta.y = null;
}

function updateMovingCard(event) {
  let focusedCard = event.currentTarget;
  if (movingCardId == focusedCard.cardId) {
    focusedCard.position.x = event.data.getLocalPosition(focusedCard.parent).x - movingCardDelta.x;
    focusedCard.position.y = event.data.getLocalPosition(focusedCard.parent).y - movingCardDelta.y;
  }
}

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

