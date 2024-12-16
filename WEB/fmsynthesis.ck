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

/*
[["d"], [ "h", "s", "c" ], [ "h", "s", "d" ]] @=> string exampleResultSuit[][];

[[69.29524314966407], [65.406, 327.03000000000003, 457.84200000000004], [123.4700865905177, 123.4700865905177, 1111.2307793146592]] @=> float exampleResultFreq[][];

doEverything(exampleResultSuit, exampleResultFreq);
*/

/*
[ "h", "s", "c" ] @=> string exampleSuit1[];
[ 200.0, 1040, 573] @=> float exampleFreq1[];

[ "d" ] @=> string exampleSuit2[];
[ 148.29524314966407 ] @=> float exampleFreq2[];

Osc exampleOscListList[0];

Osc exampleOscList1[0];
Osc exampleOscList2[0];


genOscList(exampleSuit1, exampleFreq1, exampleOscList1);
genOscList(exampleSuit2, exampleFreq2, exampleOscList2);

LiningOscList(exampleOscList1);
LiningOscList(exampleOscList2);

exampleOscList1[0] => dac;

exampleOscListList << exampleOscList1[0];
exampleOscListList << exampleOscList2[0];

NormalizingLineOsc(exampleOscListList);
*/
// while( true ) 1::second => now;