import React, { useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import Beep from './components/Beep';
import Counter from './components/Counter';
import Decay from './components/Decay';
import ProducerConsumer from './components/ProducerConsumer';
import Simulator, { RunResult } from './simulator/Simulator';

export default function App() {
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
            <div className='content-container flex-h space-between'>
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
                            <a href="https://github.com/rokeller/simulator" target='_blank' rel='noreferrer'>Sources on GitHub</a>
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
                        <Route path='beep' element={<Beep run={run} report={appendToOutput} />} />
                        <Route path='counter' element={<Counter run={run} report={appendToOutput} />} />
                        <Route path='decay' element={<Decay run={run} report={appendToOutput} />} />
                        <Route path='producer-consumer' element={<ProducerConsumer run={run} report={appendToOutput} />} />
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
