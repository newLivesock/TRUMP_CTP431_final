// https://chuck.cs.princeton.edu/webchuck/docs/classes/Chuck.html

import { Chuck } from 'https://cdn.jsdelivr.net/npm/webchuck/+esm';

let theChuck;
Chuck.init([]).then((res) => { theChuck = res; });

function checkInit() {
  return theChuck !== undefined;
}

const fmSynthesisCode = `
fun Osc returnOsc(string suit, float freq){
    if (suit == "c"){
        SinOsc a;
        freq => a.freq;
        200 => a.gain;
        return a;
    }
    if (suit == "s"){
        TriOsc a;
        freq => a.freq;
        200 => a.gain;
        return a;
    }
    if (suit == "d"){
        SqrOsc a;
        freq => a.freq;
        200 => a.gain;
        return a;
    }
    if (suit == "h"){
        SawOsc a;
        freq => a.freq;
        200 => a.gain;
        return a;
    } else {
        SinOsc a;
        freq => a.freq;
        200 => a.gain;
        return a;
    }
}

fun void genOscList(string suits[], float freqs[], Osc oscList[]){
    suits.size() => int length;
    <<< "size (before append):", oscList.size() >>>;
    for( 0 => int i; i < length; i++){
        oscList << returnOsc(suits[i], freqs[i]);
        <<< "size (after append):", oscList.size() >>>;
    }
    0.2 => oscList[0].gain;
}

fun Osc LiningOscList(Osc listOfOsc[]){
    listOfOsc.size() => int length;
    for (1 => int i; i < length; i++){
        listOfOsc[i] => listOfOsc[i-1];
        2 => listOfOsc[i-1].sync;
    }
    0.2 => listOfOsc[0].gain;
    return listOfOsc[0];
}

fun void NormalizingLineOsc(Osc lineOscList[]){
    Gain g;
    0.7 => g.gain;
    for(0 => int i; i < lineOscList.size(); i++){
        lineOscList[i] => g;
    }
    0.7 => g.gain;
    g => dac;
}

fun void doEverything(string resultSuit[][], float resultFreq[][]){
    Osc lineOscList[0];
    resultSuit.size() => int n;
    for (0 => int i; i < n; i++){
        Osc oscList[0];
        genOscList(resultSuit[i], resultFreq[i], oscList);
        LiningOscList(oscList);
        lineOscList << oscList[0];
    }
    NormalizingLineOsc(lineOscList);
}

doEverything(resultSuit, resultFreq);

1::second => now;
`

async function playOneSec(resultSuit, resultFreq) {
  if (theChuck === undefined) {
    console.log("ChucK is not yet initialized!");
    return null;
  }

  if (!resultSuit.length) {
    console.log("No cards are connected to the Joker!");
    return null;
  }

  const header = `
${JSON.stringify(resultSuit)} @=> string resultSuit[][];
${JSON.stringify(resultFreq)} @=> float resultFreq[][];
`;

  if (theChuck.context.state === "suspended") {
    theChuck.context.resume();
  }

  theChuck.runCode(header + "\n" + fmSynthesisCode);
  console.log("Played sound for one sec!");
}

export { checkInit, playOneSec };

