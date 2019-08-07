import { primary_map, secondary_map } from './App';

class Legend {
  static test12345(point, param2) {
    try {
      console.log('primary_map');
      console.log(primary_map.feature_dataset.title);
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
