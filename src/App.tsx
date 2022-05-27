import React, { useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import BeepSimulator from './simulator/BeepSimulator';
import CounterSimulator from './simulator/CounterSimulator';
import { DecaySimulator, getMeanLifetime } from './simulator/DecaySimulator';
import ProducerConsumerSimulator from './simulator/ProducerConsumerSimulator';
import Simulator, { RunResult } from './simulator/Simulator';

const DefaultPercentiles = [.1, .2, .25, .5, .66, .75, .8, .9, .95, .99, .999, .9999, .99999];

function onIntChange(callback: (newVal: number) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => callback(Number.parseInt(e.target.value, 10));
}

function onFloatChange(callback: (newVal: number) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => callback(Number.parseFloat(e.target.value));
}

function onStringChange(callback: (newVal: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => callback(e.target.value);
}

function onMultiStringChange(callback: (newVal: string) => void) {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) => callback(e.target.value);
}

interface SimulatorProperties {
    run: (s: Simulator) => void;
    appendToOutput: (t: string) => void;
}

function App() {
    const [output, setOutput] = useState<string>('');

    function clearOutput() {
        setOutput('');
    }

    function appendToOutput(text: string) {
        setOutput((old) => old + text + '\n');
    }

    function run(s: Simulator, callback?: (result: RunResult) => void) {
        clearOutput();
        setTimeout(() => {
            const result = s.setup().run();
            if (callback) {
                callback(result);
            }
            appendToOutput(`\nSimulation took ${result.runtimeMs} ms.`);
        }, 1);
    }

    function selectClass(props: { isActive: boolean; }) {
        return props.isActive ? 'active' : '';
    }

    return (
        <div className='app'>
            <header className='app-header'>
                Simulator
            </header>
            <div className='content-container flex-h'>
                <div className='topics'>
                    <h2>Topics</h2>
                    <ul>
                        <li><NavLink to='/' className={selectClass}>Getting Started</NavLink></li>
                        <li><NavLink to='beep' className={selectClass}>Beep</NavLink></li>
                        <li><NavLink to='counter' className={selectClass}>Counter</NavLink></li>
                        <li><NavLink to='decay' className={selectClass}>Decay</NavLink></li>
                        <li><NavLink to='producer-consumer' className={selectClass}>Producer/Consumer</NavLink></li>
                    </ul>
                </div>
                <div className='options'>
                    <Routes>
                        <Route path='/' element={<div className='text'>
                            <h2>Getting Started</h2>
                            <p>
                                <strong>Important</strong>: This app does <em>not</em> use background workers or
                                asynchronous processing for simplicity. Accordingly, if you chose a set of parameters
                                that make for a long running simulation (e.g. millions of events), <strong>the user
                                interface will freeze</strong> and you might need to kill the tab to recover.
                            </p>
                            <p>
                                This simulator helps you run simple experiments using simulated timelines.
                                The <em><Link to='beep'>Beep</Link></em> simulator for instance shows that the order
                                in which events are created / inserted is not relevant and events are automatically put
                                in the correct order.
                            </p>
                            <p>
                                The <em><Link to='counter'>Counter</Link></em> simulator shows a simulation where each
                                event is responsible for scheduling the next event (or not, if the end of the simulation)
                                is reached.
                            </p>
                            <p>
                                The <em><Link to='decay'>Decay</Link></em> simulator shows the radioactive decay of
                                nuclei and the typical measures of half-life (decay of 50% of the nuclei) and various
                                other percentiles of decay.
                            </p>
                            <p>
                                The <em><Link to='producer-consumer'>Producer/Consumer</Link></em> simulator shows a
                                configurable system of producer and consumers. Consumers can optionally be configured
                                to sleep if there's no work. This can be used to evaluate performance of such scenarios
                                under different loads. The system configuration is oversimplified.
                            </p>
                        </div>} />
                        <Route path='beep' element={<Beep run={run} appendToOutput={appendToOutput} />} />
                        <Route path='counter' element={<Counter run={run} appendToOutput={appendToOutput} />} />
                        <Route path='decay' element={<Decay run={run} appendToOutput={appendToOutput} />} />
                        <Route path='producer-consumer' element={<ProducerConsumer run={run} appendToOutput={appendToOutput} />} />
                    </Routes>
                </div>
                <div className='output'>
                    <h2>Output</h2>
                    <div><pre>{output}</pre></div>
                </div>
            </div>
        </div>
    );
}

function Beep({ run, appendToOutput }: SimulatorProperties) {
    const [rawTimes, setRawTimes] = useState<string>('4\n1\n1.5\n2');

    function createBeepSimulator() {
        const times: number[] = [];
        rawTimes.split(/[\r\n]+/gi).forEach((rawTime) => times.push(Number.parseFloat(rawTime)));
        return new BeepSimulator({ times, timeUnit: ' ticks', report: appendToOutput, });
    }

    return <>
        <h2>Beep Simulator</h2>
        Beep times (any order, one number per line):
        <div>
            <textarea aria-multiline={true} cols={10} rows={10} onChange={onMultiStringChange(setRawTimes)} value={rawTimes} />
        </div>
        <button type='button' onClick={() => run(createBeepSimulator())}>Run</button>
    </>;
}

function Counter({ run, appendToOutput }: SimulatorProperties) {
    const [increment, setIncrement] = useState<number>(1);
    const [upperBound, setUpperBound] = useState<number>(20);

    function createCounterSimulator() {
        return new CounterSimulator({ increment, upperBound, timeUnit: ' ticks', report: appendToOutput });
    }

    return <>
        <h2>Counter Simulator</h2>
        <div>
            <label>
                Count using increment of{' '}
                <input type='number' min={1} step={1} value={increment} onChange={onIntChange(setIncrement)} />
            </label>
        </div>
        <div>
            <label>
                Count as long as time is less than{' '}
                <input type='number' min={1} step={1} value={upperBound} onChange={onIntChange(setUpperBound)} />
            </label>
        </div>
        <button type='button' onClick={() => run(createCounterSimulator())}>Run</button>
    </>;
}

function Decay({ run, appendToOutput }: SimulatorProperties) {
    const [numItems, setNumItems] = useState<number>(100_000);

    function create14_C_DecaySimulator() {
        return new DecaySimulator({
            meanLifetime: getMeanLifetime(5730),
            timeUnit: 'a',
            timePrecision: 4,
            numItems,
            percentiles: DefaultPercentiles,
            report: appendToOutput,
        });
    }

    function create131_I_DecaySimulator() {
        return new DecaySimulator({
            meanLifetime: getMeanLifetime(8.0),
            timeUnit: 'd',
            timePrecision: 4,
            numItems,
            percentiles: DefaultPercentiles,
            report: appendToOutput,
        });
    }

    function create137_Cs_DecaySimulator() {
        return new DecaySimulator({
            meanLifetime: getMeanLifetime(30.1),
            timeUnit: 'a',
            timePrecision: 4,
            numItems,
            percentiles: DefaultPercentiles,
            report: appendToOutput,
        });
    }

    function create220_Rn_DecaySimulator() {
        return new DecaySimulator({
            meanLifetime: getMeanLifetime(56.0),
            timeUnit: 's',
            timePrecision: 4,
            numItems,
            percentiles: DefaultPercentiles,
            report: appendToOutput,
        });
    }

    function create226_Ra_DecaySimulator() {
        return new DecaySimulator({
            meanLifetime: getMeanLifetime(1600),
            timeUnit: 'a',
            timePrecision: 4,
            numItems,
            percentiles: DefaultPercentiles,
            report: appendToOutput,
        });
    }

    function create238_U_DecaySimulator() {
        return new DecaySimulator({
            meanLifetime: getMeanLifetime(4_500_000_000),
            timeUnit: 'a',
            timePrecision: 4,
            numItems,
            percentiles: DefaultPercentiles,
            report: appendToOutput,
        });
    }

    return <>
        <h2>Decay Simulator</h2>
        <div>
            <label>
                Number of Nuclei{' '}
                <input type='number' min={1} step={1} value={numItems} onChange={onIntChange(setNumItems)} />
            </label>
        </div>
        <button type='button' onClick={() => run(create14_C_DecaySimulator())}>Run for <sup>14</sup>C</button>
        <button type='button' onClick={() => run(create131_I_DecaySimulator())}>Run for <sup>131</sup>I</button>
        <button type='button' onClick={() => run(create137_Cs_DecaySimulator())}>Run for <sup>137</sup>Cs</button>
        <button type='button' onClick={() => run(create220_Rn_DecaySimulator())}>Run for <sup>220</sup>Rn</button>
        <button type='button' onClick={() => run(create226_Ra_DecaySimulator())}>Run for <sup>226</sup>Ra</button>
        <button type='button' onClick={() => run(create238_U_DecaySimulator())}>Run for <sup>238</sup>U</button>
    </>
}

function ProducerConsumer({ run, appendToOutput }: SimulatorProperties) {
    const [endTime, setEndTime] = useState<number>(3600);
    const [timeUnit, setTimeUnit] = useState<string>('s');
    const [numConsumers, setNumConsumers] = useState<number>(1);
    const [consumersBatchSize, setConsumersBatchSize] = useState<number>(1);
    const [consumersMaxIdleTime, setConsumersMaxIdleTime] = useState<number>();
    const [consumersSleepTime, setConsumersSleepTime] = useState<number>();
    const [meanProcessingTime, setMeanProcessingTime] = useState<number>(1);
    const [meanArrivalTime, setMeanArrivalTime] = useState<number>(30);

    function createSimulator() {
        return new ProducerConsumerSimulator({
            endTime,
            consumers: {
                count: numConsumers,
                batchSize: consumersBatchSize,
                maxIdleTime: consumersMaxIdleTime || undefined,
                sleepTime: consumersSleepTime || undefined,
                meanProcessingTime,
            },
            numProducers: 1,
            meanArrivalTime,
            timeUnit,
            timePrecision: 6,
            report: appendToOutput,
        });
    }

    return <>
        <h2>Producer/Consumer Simulator</h2>
        <div><h3>Producers</h3></div>
        <div>
            <label>
                Mean arrival time{' '}
                <input type='number' min={0.1} step={0.1} value={meanArrivalTime} onChange={onFloatChange(setMeanArrivalTime)} />
                {' ' + timeUnit}
            </label>
        </div>
        <hr />
        <div><h3>Consumers</h3></div>
        <div>
            <label>
                Count{' '}
                <input type='number' min={1} step={1} value={numConsumers} onChange={onIntChange(setNumConsumers)} />
            </label>
        </div>
        <div>
            <label>
                Batch size{' '}
                <input type='number' min={1} step={1} value={consumersBatchSize} onChange={onIntChange(setConsumersBatchSize)} />
            </label>
        </div>
        <div>
            <label>
                Max idle time{' '}
                <input type='number' value={consumersMaxIdleTime} onChange={onIntChange(setConsumersMaxIdleTime)} />
                {' ' + timeUnit}
            </label>
        </div>
        <div>
            <label>
                Sleep time{' '}
                <input type='number' value={consumersSleepTime} onChange={onIntChange(setConsumersSleepTime)} />
                {' ' + timeUnit}
            </label>
        </div>
        <div>
            <label>
                Mean processing time{' '}
                <input type='number' value={meanProcessingTime} min={0.1} step={0.1} onChange={onFloatChange(setMeanProcessingTime)} />
                {' ' + timeUnit}
            </label>
        </div>
        <hr />
        <div>
            <label>
                End time{' '}
                <input type='number' min={1} value={endTime} onChange={onIntChange(setEndTime)} />
                {' ' + timeUnit}
            </label>
        </div>
        <div>
            <label>
                Time unit{' '}
                <input type='text' value={timeUnit} onChange={onStringChange(setTimeUnit)} />
            </label>
        </div>
        <button type='button' onClick={() => run(createSimulator())}>Run</button>
    </>
}

export default App;
