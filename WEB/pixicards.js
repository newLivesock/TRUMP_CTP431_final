const app = new PIXI.Application();
globalThis.__PIXI_APP__ = app; // PixiJS DevTools

const cards = [];

window.onload = async function() {
  await setup()
  await preload()
}



// https://pixijs.com/8.x/tutorials/fish-pond

async function setup() {
  await app.init({ background: "#3e8f74", resizeTo: window });
  const canvas = document.body.appendChild(app.canvas);
  canvas.oncontextmenu = () => { return false; };

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage
    .on("rightdown", (event) => {
      addCardSprite()
    })
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



function addCardSprite(faceWidth = 90, borderWidth = 2) {

  let card = new PIXI.Container();
  card.x = app.screen.width / 2;
  card.y = app.screen.height / 2;

  let cardFace = PIXI.Sprite.from(window.prompt());
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
    .on("pointerdown", (event) => {
      event.currentTarget.dragging = 1;
    })
    .on("pointermove", (event) => {
      let obj = event.currentTarget;
      if (obj.dragging == 1) {
        obj.position.x = event.data.getLocalPosition(obj.parent).x;
        obj.position.y = event.data.getLocalPosition(obj.parent).y;
      }
    })
    .on("pointerup", (event) => {
      event.currentTarget.dragging = 0;
    })

  app.stage.addChild(card);
  cards.push(card);
}

