const info = {
    constants: {
      screw_hole_radius: 3.2/2.0, //mm
      horizontal_pitch_mm: 5.08, //mm
      slidepot_width: 2.0, // mm
      rotarypot_margin: 0.1, // mm // TODO THIS IS UNUSED
      toggleswitch_margin: 0.1, // mm // TODO THIS IS UNUSED
      patchpoint_margin: 0.1, // mm // TODO THIS IS UNUSED
      circle_quality: 20, // how many segments to render circles with
    },
  
    // vertical pitch options
    // TODO: once i've added the data for vp_options, we may just be able to change screw_height to be calculated (total_height - (3mm*2))  
    vp_options: [ // keyed by model.vp_index
      { display: "1U \"Pulp Logic\" tiles", nominal: 1, height: 43.18, screw_height: 37.19, identifier: "1u-pulp"},
      { display: "1U \"Intellijel\" tiles", nominal: 1, height: 39.65, screw_height: 33.65, identifier: "1u-intellijel"},
      { display: "3U Standard Eurorack Size", nominal: 3, height: 128.50, screw_height: 122.5, identifier: "3u"},
    ],
  
    // the kinds of "features" you can add to a panel
    feature_types: { // keyed by model.features[].type
      patch_point: "Patch Point",
      rotarypot: "Rotary Potentiometer",
      slidepot: "Slide Potentiometer",
      toggle_switch: "Toggle Switch",
      led: "LED"
    },
  
    // horizontal pitch options
    hp_options: [ // keyed by model.hp_index
      {hp: 1   ,  holes: 2, actual: 5.00   },
      {hp: 1.5 ,  holes: 2, actual: 7.50   },
      {hp: 2   ,  holes: 2, actual: 9.80   },
      {hp: 4   ,  holes: 2, actual: 20.00  },
      {hp: 6   ,  holes: 2, actual: 30.00  },
      {hp: 8   ,  holes: 2, actual: 40.30  },
      {hp: 10  ,  holes: 2, actual: 50.50  },
      {hp: 12  ,  holes: 4, actual: 60.60  },
      {hp: 14  ,  holes: 4, actual: 70.80  },
      {hp: 16  ,  holes: 4, actual: 80.90  },
      {hp: 18  ,  holes: 4, actual: 91.30  },
      {hp: 20  ,  holes: 4, actual: 101.30 },
      {hp: 21  ,  holes: 4, actual: 106.30 },
      {hp: 22  ,  holes: 4, actual: 111.40 },
      {hp: 24  ,  holes: 4, actual: 121.60 },
      {hp: 28  ,  holes: 4, actual: 141.90 },
      {hp: 42  ,  holes: 4, actual: 213.00 }
    ],
  
    // the chosen hole placement - this CLOUD be restricted by your choice of HP (hp_options incudes a holes property)
    hole_positions: [ // keyed by model.holes_index
      { screw_positions: ["tl", "br"], display: "\u2801\u00A0\u2804"                    },  // ⠈  ⠄
      { screw_positions: ["tr", "bl"], display: "\u2804\u00A0\u2801"                    },  // ⠄  ⠈
      { screw_positions: ["tr", "br"], display: "\u00A0\u00A0\u00A0\u205A"              },  //    ⠅
      { screw_positions: ["tl", "bl"], display: "\u205A\u00A0\u00A0"                    },  // ⠅
      { screw_positions: ["tl", "tr", "bl", "br"], display: "\u205A\u00A0\u00A0\u205A"  }   // ⠅  ⠅
    ],
  
    // Size choices, arranged by feature
    feature_size_options: {
      patch_point: [
        { display:  "3.5mm / 1/8\"", size: 3.5   },
        { display: "6.35mm / 1/4\"", size: 6.35 }
      ],
      rotarypot: [
        { display:  "6mm shaft", size: 6.0   },
        { display:  "6.3mm shaft", size: 6.3 }
      ],
      slidepot: [
        { display:  "20mm travel", size: 20   },
        { display:  "25mm travel", size: 25   },
        { display:  "30mm travel", size: 30   },
        { display:  "35mm travel", size: 35   },
        { display:  "40mm travel", size: 40   },
        { display:  "45mm travel", size: 45   },
      ],
      toggle_switch: [
        { display:  "TS",   size: 8.0  },
        { display:  "MTS",  size: 6.0  },
        { display:  "SMTS", size: 6.3  } // sice SIZE is the key, these need to be unique
      ],
      led: [
        { display:  "Standard Xmm", size: 4  },
        { display:  "Weird small",  size: 2  },
        { display:  "Weird big",    size: 6  }
      ]
    },
  
    // these are potential positioning frames of reference.
    frames_of_reference: { // keyed by model.feature[].position.relative_to
      center      : { display: "Center",              fn: (pos, width, height) => [pos.x, pos.y, 0]                  },
      topcenter   : { display: "Top side, center",    fn: (pos, width, height) => [pos.x, pos.y+height/2, 0]         },
      bottomcenter: { display: "Bottom side, center", fn: (pos, width, height) => [pos.x, pos.y-height/2, 0]         },
      leftcenter  : { display: "Left side, center",   fn: (pos, width, height) => [pos.x-width/2, pos.y, 0]          },
      rightcenter : { display: "Right side, center",  fn: (pos, width, height) => [pos.x+width/2, pos.y, 0]          },
      topleft     : { display: "Top left corner",     fn: (pos, width, height) => [pos.x-width/2, pos.y+height/2, 0] },
      topright    : { display: "Top right corner",    fn: (pos, width, height) => [pos.x+width/2, pos.y+height/2, 0] },
      bottomleft  : { display: "Bottom left corner",  fn: (pos, width, height) => [pos.x-width/2, pos.y-height/2, 0] },
      bottomright : { display: "Bottom right corner", fn: (pos, width, height) => [pos.x+width/2, pos.y-height/2, 0] },
    },
  }

  module.exports = {
      info
  };
  