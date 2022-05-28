import { useState } from 'react';
import { DecaySimulator, getMeanLifetime } from '../simulator/DecaySimulator';
import { onIntChange, SimulatorProperties } from './Common';

const DefaultPercentiles = [.1, .2, .25, .5, .66, .75, .8, .9, .95, .99, .999, .9999, .99999];

export default function Decay({ run, report }: SimulatorProperties) {
    const [numItems, setNumItems] = useState<number>(100_000);

    function createSimulator(halfLife: number, timeUnit: string) {
        return new DecaySimulator({
            meanLifetime: getMeanLifetime(halfLife),
            timeUnit,
            timePrecision: 4,
            numItems,
            percentiles: DefaultPercentiles,
            report,
        });
    }

    function create14_C_DecaySimulator() {
        return createSimulator(5730, 'a');
    }

    function create131_I_DecaySimulator() {
        return createSimulator(8.0, 'd');
    }

    function create137_Cs_DecaySimulator() {
        return createSimulator(30.1, 'a');
    }

    function create220_Rn_DecaySimulator() {
        return createSimulator(56.0, 's');
    }

    function create226_Ra_DecaySimulator() {
        return createSimulator(1600, 'a');
    }

    function create238_U_DecaySimulator() {
        return createSimulator(4_500_000_000, 'a');
    }

    return <>
        <h2>Decay Simulator</h2>
        <label>
            <div>Number of Nuclei</div>
            <input type='number' min={1} step={1} value={numItems} onChange={onIntChange(setNumItems)} />
        </label>
        <div className='flex-h space-between'>
            <button type='button' onClick={() => run(create14_C_DecaySimulator())}>Run for <sup>14</sup>C</button>
            <button type='button' onClick={() => run(create131_I_DecaySimulator())}>Run for <sup>131</sup>I</button>
            <button type='button' onClick={() => run(create137_Cs_DecaySimulator())}>Run for <sup>137</sup>Cs</button>
            <button type='button' onClick={() => run(create220_Rn_DecaySimulator())}>Run for <sup>220</sup>Rn</button>
            <button type='button' onClick={() => run(create226_Ra_DecaySimulator())}>Run for <sup>226</sup>Ra</button>
            <button type='button' onClick={() => run(create238_U_DecaySimulator())}>Run for <sup>238</sup>U</button>
        </div>
    </>
}
