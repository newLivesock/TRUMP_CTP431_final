
import {chuck} from from 'https://cdn.jsdelivr.net/npm/webchuck/+esm';


let thechuck;

      document.getElementById('action').addEventListener('click', async () => {
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
      });



