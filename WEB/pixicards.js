let addCardSprite = function(obj, x, y, suit, value) {
  let color;
  if (suit == "S") {
    color = 0x000;
  } else if (suit == "H") {
    color = 0xf00;
  } else if (suit == "D") {
    color = 0x804;
  } else if (suit == "C") {
    color= 0x448;
  }

  let card = new PIXI.Graphics()
  .rect(-45, -60, 90, 120)
  .fill(color)

  card.x = x;
  card.y = y;

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

  obj.addChild(card);
}

window.onload = async function() {
  const app = new PIXI.Application(); 
  await app.init({ background: "white", resizeTo: window });
  const canvas = document.body.appendChild(app.canvas);
  canvas.oncontextmenu = () => { return false; };

  app.stage.eventMode = "static";
  addCardSprite(app.stage, 100, 100, "C", 12);
  app.stage.hitArea = app.screen;
  app.stage
    .on("rightdown", (event) => {
      addCardSprite(app.stage, 100, 100, "C", 12)
    })
}
