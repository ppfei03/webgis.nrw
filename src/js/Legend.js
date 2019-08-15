import { primary_map, secondary_map } from './App';
import { allInstances } from './Map';

class Legend {
  static name;
  constructor() {}
  legendActivate() {
    $('#legend-heading').html(this.name)
  }


  legendForDualSplitView(point, param2){
      console.log(allInstances)

      const primary_map_data = primary_map.map.queryRenderedFeatures(
          point,
          param2
      );
      const secondary_map_data = secondary_map.map.queryRenderedFeatures(
          point,
          param2
      );


      let unit;
      if (
          typeof primary_map_data[0].properties[primary_map.feature_dataset.title] ===
          'string'
      ) {
          unit = '';
      } else {
          unit = primary_map.feature_dataset.unit;
      }


     let myString =
          `<h4 class="col-md-12"><strong>${
              primary_map_data[0].properties.Gemeindename
              }</strong></h4>` +
          `<p class="col-md-6">links : <strong><em>${
              primary_map_data[0].properties[primary_map.feature_dataset.title]

              }</strong> ${unit}</em></p>`+
          `<p class="col-md-6">rechts : <strong><em>${
              secondary_map_data[0].properties[secondary_map.feature_dataset.title]

              }</strong> ${unit}</em></p>`;

      document.getElementById('pd').innerHTML = myString;


  }

  legendForStandardView(point, param2){
      console.log(this)
      console.log(allInstances)

      const primary_map_data = primary_map.map.queryRenderedFeatures(
          point,
          param2
      );

      let unit;
      if (
          typeof primary_map_data[0].properties[primary_map.feature_dataset.title] ===
          'string'
      ) {
          unit = '';
      } else {
          unit = primary_map.feature_dataset.unit;
      }

     let myString =
          `<h4 class="col-md-12"><strong>${
              primary_map_data[0].properties.Gemeindename
              }</strong></h4>` +
          `<p class="col-md-6">links : <strong><em>${
              primary_map_data[0].properties[primary_map.feature_dataset.title]

              }</strong> ${unit}</em></p>`;

      document.getElementById('pd').innerHTML = myString;

  }
  static test12345(point, param2) {
    try {
      console.log('primary_map');
      console.log(primary_map.feature_dataset.title);
      console.log(primary_map.legende.name);
      const primary_map_data = primary_map.map.queryRenderedFeatures(
        point,
        param2
      );
      console.log('primary_map Title');
      console.log(
        primary_map_data[0].properties[primary_map.feature_dataset.title]
      );
      const secondary_map_data = secondary_map.map.queryRenderedFeatures(
        point,
        param2
      );
      console.log('secondary_map');
      console.log(secondary_map.feature_dataset.title);
      console.log(secondary_map.legende.name);

      console.log('secondary_map Title');
      console.log(
        secondary_map_data[0].properties[secondary_map.feature_dataset.title]
      );
    } catch (error) {
      //console.log(error);
    }
  }


}

export default Legend;
