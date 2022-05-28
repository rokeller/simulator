# Simulator

This simulator app helps you run simple experiments using simulated timelines. While the app currently offers a basic
set of simulations, the underlying code is flexible enough to handle any sorts of simulations based on discrete events.

## Live demo

For a live demo please visit [flrx39.net/simulator/](https://flrx39.net/simulator/).

## Important

This app does _not_ use background workers or asynchronous processing for simplicity. Accordingly, if you chose
a set of parameters that make for a long running simulation (e.g. millions of events), **the user interface will freeze**
and you might need to kill the tab to recover.

## Simulator models

### Beep

The Beep simulator shows that the order in which events are created / inserted is _not_ relevant and events are
automatically put in the correct order.

### Counter

The Counter simulator shows a simulation where each event is responsible for scheduling the next event (or not, if the
end of the simulation) is reached.

### Decay

The Decay simulator shows the radioactive decay of nuclei and the typical measures of half-life (decay of 50% of the
nuclei) and various other percentiles of decay. It currently does so for a few isotopes:

- $^{14}C$ -- carbon-14 aka radiocarbon
- $^{131}I$ -- iodine-131 aka radioiodine
- $^{137}Cs$ -- caesium-137 aka radiocaesium
- $^{220}Rn$ -- radon-220
- $^{226}Ra$ -- radium-226
- $^{238}U$ -- uranium-238

### Producer/Consumer

The Producer/Consumer simulator shows a configurable system of producer and consumers. Consumers can optionally be
configured to sleep if there's no work. This can be used to evaluate performance of such scenarios under different
loads. The system configuration is currently oversimplified though.

## Future Work

New simulators could include models for the circulation of viruses, or traffic with lights at an intersection and so on.
