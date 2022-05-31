const dxfSerializer = require('@jscad/dxf-serializer');
const svgSerializer = require('@jscad/svg-serializer');
const { info } = require('./info.js');
const FileSaver = require('file-saver');

const DefaultFilename = "export.json";

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}  

function lookupVp(vp) {
    // return an index for a given hp value
    const index = info.vp_options.findIndex(item => item.identifier == vp);
    return index !== -1 ? index : undefined;
}

function lookupHp(hp) {
    // return an index for a given hp value
    const index = info.hp_options.findIndex(item =>  item.hp == hp);
    return index !== -1 ? index : undefined;
}

function lookupHoles(holes) {
    // return an index for a given hole positions array
    const index = info.hole_positions.findIndex(position_info => arraysEqual(position_info.screw_positions, holes) )
    return index !== -1 ? index : undefined;
}

function lookupRelativeTo(relativeTo) {
    if (info.frames_of_reference[relativeTo] !== undefined) {
        return relativeTo;
    }

    return undefined;
}

function filename(prefix, myext, outputext) {
    const date = new Date()
    return `${prefix}-${date.getFullYear()}${date.getFullYear()}${date.getMonth()}${date.getDate()}-${date.getHours()}${date.getMinutes()}.${myext}.${outputext}`
}

function parseFeature(feature) {
    if (!feature.type) {
      return undefined; // no type, no feature.
    }
    
    return {
      type: feature.type,
      size: feature.size || info.feature_size_options[importFeature.type][0].size || 5,
      position: {
        x: feature.position.x || 0,
        y: feature.position.y || 0,
        relative_to: lookupRelativeTo(feature.position.relative_to) || "center",
      }
    }
}

const ImportExport = (create_entities, re_render) => {
    this.saveData = (model) => {
        let outputObj = {};
        outputObj.vp = info.vp_options[model.vp_index].identifier;
        outputObj.hp = info.hp_options[model.hp_index].hp;
        outputObj.hole_positions = info.hole_positions[model.holes_index].screw_positions;
        outputObj.features = model.features.map(function(feature){
          return {
            type: feature.type,
            size: feature.size,
            position: {
              x: feature.position.x,
              y: feature.position.y,
              relative_to: feature.position.relative_to
            }
          }
        });
      
        const outputJSONText = JSON.stringify(outputObj);
        const blob = new Blob([outputJSONText], {type: "application/json;charset=utf-8"});
        const date = new Date();
        FileSaver.saveAs(blob, filename("panel", "crowspanel", "json"));
    }

    this.loadData = (model, event) => {
        if (!event.target.files.length) {
            alert("empty file");
            return;
        }

        let file = event.target.files[0];
        let reader = new FileReader();
        reader.readAsText(file)
        
        reader.onload = (e) => {
            const importData = JSON.parse(e.target.result);
            const looked_up_vp = lookupVp(importData.vp);
            model.vp_index = looked_up_vp == undefined ? model.vp_index : looked_up_vp;
            model.hp_index = lookupHp(importData.hp) || model.hp_index;
            model.holes_index = lookupHoles(importData.hole_positions) || model.holes_index;
            model.features = importData.features.map(parseFeature).filter(anyValue => typeof anyValue !== 'undefined' ) || [];
            re_render(model);
        }
    };

    this.saveSvg = (model) => {
        console.log("saving svg")
        const entities = create_entities(model, true);
        const rawData = svgSerializer.serialize({unit: 'mm'}, entities);
        const blob = new Blob([rawData], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, filename("panel", "crowspanel", "svg"));
    };
    
    this.saveDxf = (model) => {
        console.log("saving dxf")
        const entities = create_entities(model, true);
        const rawData = dxfSerializer.serialize({}, entities)
        const blob = new Blob([rawData], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, filename("panel", "crowspanel", "dxf"));
    };

    return this;
}

module.exports = ImportExport;