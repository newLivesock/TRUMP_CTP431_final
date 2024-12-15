
fun Osc returnOsc(float freq, int num){
    if (num == 0){
        SinOsc a;
        freq => a.freq;
        300 => a.gain;
        return a;
    }
    if (num == 1){
        TriOsc a;
        freq => a.freq;
        300 => a.gain;
        return a;
    }
    if (num == 2){
        SqrOsc a;
        freq => a.freq;
        300 => a.gain;
        return a;
    }
    if (num == 3){
        SawOsc a;
        freq => a.freq;
        300 => a.gain;
        return a;
    } else {
        SinOsc a;
        freq => a.freq;
        300 => a.gain;
        return a;
    }
}


fun Osc genOscList[](float freqs[], int nums[]){
    Osc oscList[0];
    nums.size() => int length;
    <<< "size (before append):", oscList.size() >>>;
    for( 0 => int i; i < length; i++){
        oscList << returnOsc(freqs[i], nums[i]);
        <<< "size (after append):", oscList.size() >>>;
    }
}

[440.0, 220.0, 330.0, 550.0] @=> float exfreqs[];

[0, 1, 2, 3] @=> int exnums[];

genOscList(exfreqs, exnums);

fun void connectOscList(Osc listOfOsc[]){
    listOfOsc.size() => int length;
    listOfOsc[0] => dac;
    1 => listOfOsc[0].gain;
    for (1 => int i; i < length; i++){
        listOfOsc[i] => listOfOsc[i-1];
    }
}

connectOscList(genOscList(exfreqs, exnums));

while( true ) 1::second => now;