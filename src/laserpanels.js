
const Alpine = require('alpinejs').default;

const { booleans, colors, primitives, transforms, extrusions } = require('@jscad/modeling');
const { cube, cuboid, line, sphere, star, rectangle, roundedRectangle, circle } = primitives;
const { translate } = transforms;
const { extrudeLinear } = extrusions;
const { intersect, subtract } = booleans;
const { colorize } = colors;

const { JSCADWrapper } = require('./jscad_wrapper.js');
const { info, get_feature_info_by_identifier, ShapeTypes } = require('./info.js'); // constants like hp & menu options like toggle switch sizes
const { rotate } = require('@jscad/modeling/src/operations/transforms');

// ********************
// The design to render.
// ********************

// this function draws features that will be subtracted from the main panel
const renderFeature = (feature, width, height, margin) => {
  const feature_options = get_feature_info_by_identifier(feature.type, feature.identifier);

  if (feature_options.shape == ShapeTypes.Circle) {
    return translate(
      info.frames_of_reference[feature.position.relative_to].fn(feature.position, width, height),
      circle({ radius: feature_options.size/2.0 + margin, segments: info.constants.circle_quality})
    )
  } else if (feature_options.shape == ShapeTypes.Square) {
    return translate(
      info.frames_of_reference[feature.position.relative_to].fn(feature.position, width, height),
      rectangle({size: [feature_options.size + margin*2, feature_options.size + margin*2]})
    )
  } else if (feature_options.shape == ShapeTypes.RoundedRectangle) {
    // check if the feature is flipped or not.
    const rect = { x: feature_options.size[0] + margin*2, y: feature_options.size[1] + margin*2 };
    const smallest_side = rect.x > rect.y ? rect.y : rect.x;
    const shape = roundedRectangle({ size: [rect.x, rect.y], roundRadius: (smallest_side/2.0)-0.01 });
    const shape_in_pos = translate(
      info.frames_of_reference[feature.position.relative_to].fn(feature.position, width, height),
      shape
    );
    const shape_in_pos_rot = feature.rot90 ? rotate([0,0, Math.PI/2], shape_in_pos) : shape_in_pos;
    return shape_in_pos_rot;
  } else if (feature_options.shape == ShapeTypes.Rectangle) {
    // check if the feature is flipped or not.
    const rect = { x: feature_options.size[0] + margin*2, y: feature_options.size[1] + margin*2 };
    const shape = rectangle({ size: [rect.x, rect.y] });
    const shape_in_pos = translate(
      info.frames_of_reference[feature.position.relative_to].fn(feature.position, width, height),
      shape
    );
    const shape_in_pos_rot = feature.rot90 ? rotate([0,0, Math.PI/2], shape_in_pos) : shape_in_pos;
    return shape_in_pos_rot;
  }
  return undefined;
}

// this is my main modelling function, the model is created here.
const create_entities = (model, flat_only) => {
  const hp_looked_up = info.hp_options[model.hp_index];
  const holes = info.hole_positions[model.holes_index];
  const actual_width = model.hp_inset ? hp_looked_up.actual : hp_looked_up.hp * info.constants.horizontal_pitch_mm;
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
    return renderFeature(feature, actual_width, panel_height, model.margin)
  });

  const rendered_non_subtract_features = non_subtract_features.map(function(feature) {
    return renderFeature(feature, actual_width, panel_height, model.margin)
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
    hp_inset: true,
    margin: info.constants.default_margin,
    holes_index: 0,
    oval_screwholes: false,
    features: [],

    addFeature(feature_type) {
      const feature_index = info.feature_defaults[feature_type];
      const feature_size_id = info.feature_size_options[feature_type][feature_index].identifier;
      console.log(`feature type ${feature_type} found feature index ${feature_index} with id ${feature_size_id}`);
      this.features.push({
        type: feature_type,
        identifier: feature_size_id,
        rot90: false,
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

window.can_be_flipped = (type, identifier) => {
  const feature_opts = get_feature_info_by_identifier(type, identifier);
  const shape_is_asym = feature_opts.shape == ShapeTypes.Rectangle || feature_opts.shape == ShapeTypes.RoundedRectangle;
  return shape_is_asym;
}
//window.Alpine = Alpine;
Alpine.start();

// navigating away warning - right now we only warn if you've got features added
window.onbeforeunload = function(event) {
  if (Alpine.store("panel").features.length > 0) {
    return true;
  }
  return undefined;
};
