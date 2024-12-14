let addCardSprite = function(obj, x, y, suit, value) {
  if (value < 2) {
    value = 2;
  } else if (value > 10) {
    value = 10;
  }

  let cardContainer = new PIXI.Container();

  let card = PIXI.Sprite.from("Image_trumpcards/H" + value + ".png");
  card.scale.set(3);
  card.anchor.set(0.5);

  let bW = 2;
  let cardBorder = new PIXI.Graphics()
  .roundRect(-45 - bW, -60 - bW, 90 + 2 * bW, 120 + 2 * bW, 2 * bW)
  .fill("#666");

  cardContainer.addChild(cardBorder);
  cardContainer.addChild(card);
  cardContainer.x = x;
  cardContainer.y = y;

  cardContainer.eventMode = "static";
  cardContainer.cursor = "pointer";
  cardContainer
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

  obj.addChild(cardContainer);
}

window.onload = async function() {
  const app = new PIXI.Application(); 
  globalThis.__PIXI_APP__ = app;
  await app.init({ background: "white", resizeTo: window });
  const canvas = document.body.appendChild(app.canvas);
  canvas.oncontextmenu = () => { return false; };

  for (let i = 2; i < 11; i++) {
    let texture = await PIXI.Assets.load("Image_trumpcards/H" + i + ".png");
    texture.source.scaleMode = "nearest";
  }

  app.stage.eventMode = "static";
  addCardSprite(app.stage, 100, 100, "H", 5);
  app.stage.hitArea = app.screen;
  app.stage
    .on("rightdown", (event) => {
      addCardSprite(app.stage, 100, 100, "H", 7)
    })
}
