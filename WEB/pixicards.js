"use strict";

import { theChuck, play } from "./webchuck.js"

const app = new PIXI.Application();
globalThis.__PIXI_APP__ = app; // PixiJS DevTools

const allCardsContainer = new PIXI.Container;
app.stage.addChild(allCardsContainer);
const allArrowsContainer = new PIXI.Container;
app.stage.addChild(allArrowsContainer);

let mode = "m"; // Move
let modeText;

window.onload = async function() {
  await setup()
  createModeIndicator()
  await preload()
  addEventListener("keydown", handleKeyEvent)
  const joker = new Card(true);
  allCardsContainer.addChild(joker);
  let elapsed = 0.0;
  app.ticker.add((time) => {
    elapsed += time.deltaTime;
    updateArrowVisual();
    if (elapsed > 60) { // 1/60
      elapsed -= 60;
      // play(0, 0);
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
  assets.push({ alias: "joker", src: "./Image_trumpcards/joker.jpg" });
  const textures = await PIXI.Assets.load(assets)
  for (const alias in textures) {
    textures[alias].source.scaleMode = "nearest";
  }
}

function parsePrompt(text) {
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
  static selectedCard = null;

  constructor(joker = false, faceWidth = 90, borderWidth = 2) {
    super();

    this.joker = joker;
    this.faceWidth = faceWidth;
    this.borderWidth = borderWidth;

    this.next = null;
    this.prevs = [];
    this.selected = false;
    this.movingDelta = { x: null, y: null };

    this.x = app.screen.width / 2;
    this.y = app.screen.height / 2;

    if (!this.joker) {
      [this.suit, this.value] = parsePrompt(prompt("🃏"));
      this.face = PIXI.Sprite.from(this.suit[0].toUpperCase() + this.value);
    } else {
      this.face = PIXI.Sprite.from("joker");
    }

    this.face.anchor.set(0.5);
    this.face.width = this.faceWidth;
    this.face.scale.y = this.face.scale.x;
    this.faceHeight = this.face.height;

    this.border = new PIXI.Graphics();
    this.updateBorderVisual("214e3e");

    this.addChild(this.border);
    this.addChild(this.face);

    this.eventMode = "static";
    this.cursor = "pointer";
    this
      .on("pointerdown", (event) => {
        let card = event.currentTarget;
        if (mode === "x" && !card.joker) {
          card.parent.removeChild(card);
          removeArrowFrom(card);
          removeArrowsTo(card);
        } 
        else if (mode === "m" && !Card.selectedCard) {
          card.parent.setChildIndex(card, card.parent.children.length - 1);
          card.select();
          card.movingDelta = {
            x: event.data.getLocalPosition(card.parent).x - card.position.x,
            y: event.data.getLocalPosition(card.parent).y - card.position.y
          };
        } else if (mode === "c") {
          if (!Card.selectedCard && !card.joker) { // start connection
            card.select();
          } else {
            toggleArrow(Card.selectedCard, card);
            Card.unselect();
          }
        }
      })
      .on("pointerup",  (event) => {
        if (mode === "m" && Card.selectedCard) {
          Card.unselect();
        }
      })
      .on("pointerleave", (event) => {
        if (mode === "m" && Card.selectedCard) {
          Card.unselect();
        }
      })
      .on("pointermove", (event) => {
        let card = event.currentTarget;
        if (mode === "m" && card.selected) {
          if (card.selected) {
            card.position.x = event.data.getLocalPosition(card.parent).x - card.movingDelta.x;
            card.position.y = event.data.getLocalPosition(card.parent).y - card.movingDelta.y;
          }
        }
      });
  }

  updateBorderVisual(color) {
    this.border
      .clear()
      .roundRect(-this.borderWidth, -this.borderWidth, this.faceWidth + 2*this.borderWidth, this.faceHeight + 2*this.borderWidth, 2*this.borderWidth)
      .fill(color);
    this.border.pivot.set(this.faceWidth / 2, this.faceHeight / 2);
  }

  select() {
    if (Card.selectedCard) { Card.unselect(); }
    this.selected = true;
    this.updateBorderVisual("81ae7e");
    Card.selectedCard = this;
  }

  static unselect() {
    Card.selectedCard.selected = false;
    Card.selectedCard.updateBorderVisual("214e3e");
    Card.selectedCard = null;
  }
}

// // // // // // // // // // // // // // // //

class Arrow extends PIXI.Container {
  constructor(prevCard, nextCard) {
    super();
    const green = "214e3e88";

    const prevCircle = new PIXI.Graphics().circle(0, 0, 36).fill(green);
    prevCircle.position = prevCard.position;
    this.addChild(prevCircle);

    const nextCircle = new PIXI.Graphics().circle(0, 0, 24).fill(green);
    nextCircle.position = nextCard.position;
    this.addChild(nextCircle);

    const arrowBody = new PIXI.Graphics().moveTo(prevCard.position.x, prevCard.position.y).lineTo(nextCard.position.x, nextCard.position.y);
    arrowBody.stroke({ width: 8, color: green });
    this.addChild(arrowBody);
  }
}

function removeArrowFrom(card) {
  card.next.prevs = card.next.prevs.filter((c) => !Object.is(c, card));
  card.next = null;
}

function removeArrowsTo(card) {
  for (let prevCard of card.prevs) {
    prevCard.next = null;
  }
}

function addArrow(prevCard, nextCard) {
  prevCard.next = nextCard;
  nextCard.prevs.push(prevCard);
}

function toggleArrow(prevCard, nextCard) {
  if (prevCard.next && Object.is(prevCard.next, nextCard)) {
    removeArrowFrom(prevCard);
  } else if (prevCard.next) {
    if (nextCard.joker || nextCard.prevs.length == 0) {
      removeArrowFrom(prevCard);
      addArrow(prevCard, nextCard);
    }
  } else {
    if (nextCard.joker || nextCard.prevs.length == 0) {
      addArrow(prevCard, nextCard);
    }
  }
}

function updateArrowVisual() {
  allArrowsContainer.removeChildren()
  for (let endCard of allCardsContainer.children) {
    if (endCard.next) {
      allArrowsContainer.addChild(new Arrow(endCard, endCard.next));
    }
  }
}

// // // // // // // // // // // // // // // //

const tonicFreq = 65.406 // Hz
const scaleList = [];
for (let i = 0; i < 13; i++) {
  scaleList.push(tonicFreq * Math.pow(2, i / 12));
}

function valueToFreq(values) {
  const fundFreq = scaleList[values[0] - 1];
  let freqs = [ fundFreq ];
  for (let i = 1; i < values.length; i++) {
    freqs.push(fundFreq * values[i]);
  }
  return freqs;
}

function generateListForChucK(joker) {
  let resultSuit = [];
  let resultFreq = [];
  for (let c of joker.prevs) {
    let suits = [c.suit];
    let values = [c.value];
    while (c.prevs[0]) {
      c = c.prevs[0];
      suits.push(c.suit);
      values.push(c.value);
    }
    resultSuit.push(suits);
    resultFreq.push(valueToFreq(values));
  }
  return [resultSuit, resultFreq];
}

// // // // // // // // // // // // // // // //

function verboseMode(mode) {
  return { "m": "Move", "x": "Delete", "c": "Connect" }[mode]
}

function handleKeyEvent(event) {
  if (event.key === "n") { // New card
    allCardsContainer.addChild(new Card());
  } else if ("mxc".includes(event.key) && mode !== event.key) {
    mode = event.key;
    if (Card.selectedCard) {
      Card.unselect();
    }
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

