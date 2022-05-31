
const Alpine = require('alpinejs').default;

const { booleans, colors, primitives, transforms, extrusions } = require('@jscad/modeling');
const { cube, cuboid, line, sphere, star, rectangle, roundedRectangle, circle } = primitives;
const { translate } = transforms;
const { extrudeLinear } = extrusions;
const { intersect, subtract } = booleans;
const { colorize } = colors;

const { JSCADWrapper } = require('./jscad_wrapper.js');
const { info } = require('./info.js'); // constants like hp & menu options like toggle switch sizes

// ********************
// The design to render.
// ********************

// this function draws features that will be subtracted from the main panel
const renderFeature = (feature, width, height) => {
  if (feature.type == "slidepot") {
    return translate(
      info.frames_of_reference[feature.position.relative_to].fn(feature.position, width, height),
      roundedRectangle({ size: [info.constants.slidepot_width, feature.size], roundRadius: info.constants.slidepot_width/2-0.01 })
    )
  } else {
    return translate(
      info.frames_of_reference[feature.position.relative_to].fn(feature.position, width, height),
      circle({ radius: feature.size/2.0, segments: info.constants.circle_quality})
    )
  }
  return undefined;
}

// this is my main modelling function, the model is created here.
const create_entities = (model, flat_only) => {
  const hp_looked_up = info.hp_options[model.hp_index];
  const holes = info.hole_positions[model.holes_index];
  const actual_width = hp_looked_up.actual;
  const vertical_data = info.vp_options[model.vp_index];
  const panel_height = vertical_data.height;
  const screw_height = vertical_data.screw_height;

  const panel_points = [
    [-actual_width/2, -panel_height/2 ],  // top left
    [actual_width/2 ,  -panel_height/2],  // top right
    [actual_width/2 ,  panel_height/2 ],  // bottom right
    [-actual_width/2, panel_height/2  ],  // bottom left
  ];

  const panel_outline = rectangle({ size: [actual_width, panel_height] });

  const screw_hole_distance = Math.max(0, hp_looked_up.hp - 3) * info.constants.horizontal_pitch_mm;


  let screw_holes_dict;

  if (model.oval_screwholes == false) {
    screw_holes_dict = {
      tl: translate([-screw_hole_distance/2, +screw_height/2, 0], circle({ radius: info.constants.screw_hole_radius, segments: info.constants.circle_quality})),
      tr: translate([+screw_hole_distance/2, +screw_height/2, 0], circle({ radius: info.constants.screw_hole_radius, segments: info.constants.circle_quality})),
      bl: translate([-screw_hole_distance/2, -screw_height/2, 0], circle({ radius: info.constants.screw_hole_radius, segments: info.constants.circle_quality})),
      br: translate([+screw_hole_distance/2, -screw_height/2, 0], circle({ radius: info.constants.screw_hole_radius, segments: info.constants.circle_quality})),
    };
  } else {
    screw_holes_dict = {
      tl: translate([-screw_hole_distance/2, +screw_height/2, 0], roundedRectangle({ size: [info.constants.screw_hole_radius*3, info.constants.screw_hole_radius*2+0.01], roundRadius: info.constants.screw_hole_radius })),
      tr: translate([+screw_hole_distance/2, +screw_height/2, 0], roundedRectangle({ size: [info.constants.screw_hole_radius*3, info.constants.screw_hole_radius*2+0.01], roundRadius: info.constants.screw_hole_radius })),
      bl: translate([-screw_hole_distance/2, -screw_height/2, 0], roundedRectangle({ size: [info.constants.screw_hole_radius*3, info.constants.screw_hole_radius*2+0.01], roundRadius: info.constants.screw_hole_radius })),
      br: translate([+screw_hole_distance/2, -screw_height/2, 0], roundedRectangle({ size: [info.constants.screw_hole_radius*3, info.constants.screw_hole_radius*2+0.01], roundRadius: info.constants.screw_hole_radius })),
    };
  }

  const screw_holes = holes.screw_positions.map(function(location){ return screw_holes_dict[location] });

  let subtract_features = [];
  let non_subtract_features = [];

  model.features.forEach((feature)=>{
    const pos = info.frames_of_reference[feature.position.relative_to].fn(feature.position, actual_width, panel_height);
    const abs_x = Math.abs(pos[0]);
    const abs_y = Math.abs(pos[1]);

    if (abs_x <= actual_width/2 && abs_y <= panel_height/2) {
      subtract_features.push(feature);
    } else {
      non_subtract_features.push(feature);
    }
  });

  const rendered_subtract_features = subtract_features.map(function(feature) {
    return renderFeature(feature, actual_width, panel_height)
  });

  const rendered_non_subtract_features = non_subtract_features.map(function(feature) {
    return renderFeature(feature, actual_width, panel_height)
  });

  const panel = subtract(panel_outline, screw_holes, ...rendered_subtract_features);

  if (flat_only) {
    return [panel, ...rendered_non_subtract_features];
  }

  const body = extrudeLinear({height: 1.6}, panel); // this is where we make it 3D
  const colorBody = colorize([0.05, 0.7, 0.05], body);

  return [colorBody, ...rendered_non_subtract_features];
}

// listen for alpine init, load a default model into the store
// trigger an initial render
document.addEventListener('alpine:init', () => {
  Alpine.store('panel', {
    vp_index: 2, // how many U it is.
    hp_index: 3,
    holes_index: 0,
    oval_screwholes: false,
    features: [],

    addFeature(feature_type) {
      this.features.push({
        type: feature_type,
        size: info.feature_size_options[feature_type][0].size,
        position: {
          x: 0.00,
          y: 0.00,
          relative_to: "center"
        }
      });
      re_render(this);
    },

    deleteFeature(index) {
      this.features.splice(index, 1);
      re_render(this);
    }
  });

  setTimeout(function(){ // timeout to give it a chance to finish loading, otherwise it doesn't render until you move the viewport
    re_render(Alpine.store('panel'));
   }, 100);
});

const containerElement = document.getElementById("jscad");
const jscad = JSCADWrapper(containerElement, create_entities);

window.re_render = jscad.re_render; // make re_render available to alpine scripts in html
window.info = info; // make info available to alpine scripts in html
window.ImportExport = require('./import_export.js')(create_entities, re_render);
//window.Alpine = Alpine;
Alpine.start();

// navigating away warning - right now we only warn if you've got features added
window.onbeforeunload = function(event) {
  if (Alpine.store("panel").features.length > 0) {
    return true;
  }
  return undefined;
};
