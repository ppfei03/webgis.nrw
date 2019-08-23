import { primary_map, secondary_map } from './App';
import { allInstances } from './Map';

class Legend {
  static name;
  static feature_dataset;
  constructor() {}
  legendActivate() {
console.log('name')
console.log(name)
console.log('this.name')
console.log(this.name)
    /**if($("#" + this.name).length == 0) {
      //it doesn't exist
          $('#legend-heading').append('<h3 id=\''+this.name+'\' ' +
          'class=\'legend-title editable\'>Titel deiner Karte</h3>')
    }else{
      $("#demo").empty();
    }**/
      $('#legend-heading').html(this.feature_dataset.title)
  }


  legendForDualSplitView(point, param2){
      //console.log(allInstances)
    try{
      const primary_map_data = primary_map.map.queryRenderedFeatures(
          point,
          param2
      );
      const secondary_map_data = secondary_map.map.queryRenderedFeatures(
          point,
          param2
      );


      let unit1;
      let unit2;
      if (
          typeof primary_map_data[0].properties[primary_map.feature_dataset.title] ===
          'string'
      ) {
        unit1 = '';
      } else {
          unit1 = primary_map.feature_dataset.unit;
      }legend
      if (
          typeof secondary_map_data[0].properties[secondary_map.feature_dataset.title] ===
          'string'
      ) {
        unit2 = '';
      } else {
          unit2 = secondary_map.feature_dataset.unit;
      }


     let myString =
          `<h4 class="col-md-12"><strong>${
              primary_map_data[0].properties.Gemeindename
              }</strong></h4>` +
          `<p class="col-md-6">links : <strong><em>${
              primary_map_data[0].properties[primary_map.feature_dataset.title]

              }</strong> ${unit1}</em></p>`+
          `<p class="col-md-6">rechts : <strong><em>${
              secondary_map_data[0].properties[secondary_map.feature_dataset.title]

              }</strong> ${unit2}</em></p>`;

      document.getElementById('pd').innerHTML = myString;
  }catch(error){
      console.log(error)
    }

  }

  legendForStandardView(point, param2){
      //console.log(this)
      //console.log(allInstances)
    try{
      //$('#legend-heading').html(primary_map.feature_dataset.title)

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
    }catch(error){
      console.log(error)

    }
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
