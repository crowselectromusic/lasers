# LaserPanel
#### by [Crows Electromusic](https://crowselectromusic.com)

A simple web app to generate front panels for modular synthesizers using a laser cutter. 

Inspired by [MakerCase](https://www.makercase.com/), and based on the simply *amazing* [JSCAD](https://github.com/jscad/OpenJSCAD.org), which is in turn based on the delightful, but desktop-only, [OpenSCAD](https://openscad.org/).

Interface stuff is done with [AlpineJS](https://alpinejs.dev/), because I wanted to take that for a spin. It's a bit opaque and "magical" but it's worked well for quickly developing this.


### DXF/SVG Export progress notes:

DXF/SVG export is possible, but will require packaging this thing via node, I suspect? attempts to use unpkg to deliver this have failed.

- https://unpkg.com/require-unpkg
- https://unpkg.com/@jscad/io

```
npm install @jscad/dxf-serializer
const dxfSerializer = require('@jscad/dxf-serializer')
const rawData = dxfSerializer.serialize({}, geometry
const svgData = serializer({unit: 'mm'}, panel); // don't export the 3d? idk haven't tested either
```

### TODOs:

1. lookup data for features - rotary pot shaft sizes,encoder shaft sizes, slide pot lengths and widths, toggle switch sizes, led size
2. add margins to all my holes, most will need extra space, LEDs might need less?
3. add switch for oval holes
4. look into importing some model files, which could be rendered in place to really get the experience (i.e. not just a panel w holes)
5. add a minimal themeing css library, so it looks less janky
6. work this into a "Framework" of sorts, so I can use it without forking for other projects
7. figure out how / if I can handle the two 1U specs (intellijel and the other one) - currently handled in the UI but NOT handled when you export / import (defaults to the first 1U spec it sees)
8. add a switch to toggle the "doepfer inset" vs nominal width on and off - need this because 1U PulpLogic is pricisely xHP wide, no weird insets - eurorack and intellijel are not

#### Features that would be nice but I am not currently working on (pull requests welcome):

  - graphics / logos
  - knob caps / fader caps
  - displays (LCD, 8-segment)
  - header pins
  - generic hole / round-rect / rect cutouts for whatever you want
  - PCB outline exporting (w or w/o marks for where features should go)
  - laser kerf, adjustable margins
  - re-order features with up & down buttons
  - port the whole thing to typescript for sanity's sake, my god js is a hellhole

## Development Guide

1. If you don't have it already, [install yarn](https://yarnpkg.com/getting-started/install).
2. In the root project directory, run `yarn install`.
3. To run the development server, run `yarn start`.
4. To output build files to the `./dist` directory, run `yarn build`.

## Guidelines for derivative works

This code is licensed under the GPLv3.0

Under the GPL, any work you create that derives from this work MUST be also open source and licensed under the GPL. Share and share-alike!
