// https://chuck.cs.princeton.edu/webchuck/docs/classes/Chuck.html

import { Chuck } from 'https://cdn.jsdelivr.net/npm/webchuck/+esm';

let theChuck; // global variable

async function play(cards, lines) {
  console.log("tried to play, the value of theChuck is " + theChuck);
  // Initialize default ChucK object
  if (theChuck === undefined) {
    theChuck = await Chuck.init([]);
  }
  // Run ChucK code
  theChuck.runCode(`
    SinOsc sin => dac;
    440 => sin.freq;
    1::second => now;
  `);
  if (theChuck.context.state === "suspended") {
    theChuck.context.resume();
  }
}

export { play };

