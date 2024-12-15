const app = new PIXI.Application();
globalThis.__PIXI_APP__ = app; // PixiJS DevTools

const cards = [];
let totalCardsMade = 0;
let mode = "m"; // Move
let modeText;

let movingCardId;
let movingCardDelta = {x: null, y: null};

window.onload = async function() {
  await setup()
  createModeIndicator()
  await preload()
  addEventListener("keydown", handleKeyEvent)
  app.ticker.add((time) => {
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
    cards[focusedCard.cardId] = null; // WIP: remove lines too
  } else if (mode === "m" && !movingCardId) {
    focusedCard.parent.setChildIndex(focusedCard, focusedCard.parent.children.length - 1);
    movingCardId = focusedCard.cardId;
    movingCardDelta.x = event.data.getLocalPosition(focusedCard.parent).x - focusedCard.position.x;
    movingCardDelta.y = event.data.getLocalPosition(focusedCard.parent).y - focusedCard.position.y;
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

