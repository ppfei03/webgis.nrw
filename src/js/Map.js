import mapboxgl from 'mapbox-gl';
import 'whatwg-fetch';
import * as d3 from 'd3';
//import geostats from 'geostats';

import colorLerp from 'color-lerp';

import Statistics from './Statistics.js';

// const KreiseNRW_source = require('./../data/landkreise_simplify0.json');
import { mapboxToken, wmsLayerUrls } from './../config.js';
import CSVParser from './CSVParser.js';
import App from './App';

let KreiseNRW;
//let this.feature_dataset;
let current_year;
let current_legend = $('.scale-legend')[0];

let showLegendOnStart = false;

// min and max colors
let lowColor = '#80BCFF';
let highColor = '#1A5FAC';

const statistics_state = {
  enabled: false,
  type: '',
  colorStops: []
};

// set the dimensions and margins of the graph
const width = 350,
  height = 350,
  margin = 40;

// The radius of the pieplot is half the width or half the height (smallest one). I substract a bit of margin.
const radius = Math.min(width, height) / 2 - margin;

const svg = d3
  .select('#my_dataviz')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`);
/**
  .call(
    d3
      .zoom()
      .scaleExtent([1, 15])
      .on('zoom', zoom)
  );

function zoom() {
  svg.attr('transform', d3.event.transform);
}
**/
// create 2 data_set
const data1 = {
  Wahlbeteiligung: 'Wahlbeteiligung',
  Ungueltige_Stimmen: 'Ungültige_Stimmen',
  Gueltige_Stimmen: 'Gültige_Stimmen',
  Gewinner: 'Gewinner'
};
//const data2 = { a: 6, b: 16, c: 20, d: 14, e: 19, f: 12 };

// set the color scale
const color = d3
  .scaleOrdinal()
  //.domain(['a', 'b', 'c', 'd', 'e', 'f'])
  .range(d3.schemeDark2);

//const map = undefined;

export default class Map {
  /**
   *
   * @param {String} container HTML div for the map
   * @param {Array} center [lat, lon] center of map
   * @param {Number} zoom initial zoom level
   * @param {function} loadDone callback function when load was successful
   */
  constructor(container, center, zoom, loadDone) {
    mapboxgl.accessToken = mapboxToken;
    this.map = new mapboxgl.Map({
      container: container,
      center: center,
      zoom: zoom,
      style: 'mapbox://styles/mapbox/light-v9',
      preserveDrawingBuffer: true // to print map
    });

    this._updatePipe(data1);

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // Add home button (Small hack since Mapbox is not supporting this..)
    // const zoomOutBtn = $('.mapboxgl-ctrl-zoom-out');
    // const homeButton = $('.mapboxgl-ctrl-zoom-out').clone();
    // homeButton.on('click', () => {
    //   this.map.flyTo({
    //     center: center,
    //     zoom: zoom
    //   });
    // });
    // homeButton.removeClass('mapboxgl-ctrl-zoom-out');
    // homeButton.append('<span class="material-icons">home</span>');
    // homeButton.removeAttr('aria-label');
    // zoomOutBtn.after(homeButton);

    // map.on('load', () => {
    //   this.map.fitBounds(
    //     // Boundary of NRW
    //     new mapboxgl.LngLatBounds([5.8664, 50.3276], [9.4623, 52.5325]),
    //     {
    //       padding: 20
    //     }
    //   );

    this.map.on('load', () => {
      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      this.map.on('click', 'kreisgrenzen', e => {
        if (e.features.length > 0) {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.Gemeindename)
            .addTo(this.map);
        }
        if (!this.getMoveOverViewSetting()) {
          const states = this.map.queryRenderedFeatures(e.point, {
            layers: ['kreisgrenzen']
          });
          this._updatePipe(JSON.parse(states[0].properties.dataArray));
        }

        App.test12345(e.point, {
          layers: ['kreisgrenzen']
        })
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      this.map.on('mouseenter', function() {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', function() {
        this.map.getCanvas().style.cursor = '';
      });
    });

    this.map.on('style.load', () => {
      // load initial NRW data and callback when load is done
      this.loadData(loadDone);

      // show current Kreis on legend overlay
      this.map.on('mousemove', e => {
        //console.log(e)

        //this.map.on('click', e => {
        if (this.map.getLayer('kreisgrenzen')) {
          const states = this.map.queryRenderedFeatures(e.point, {
            layers: ['kreisgrenzen']
          });

          if (states.length > 0) {
            let myString = '';
            if (
              this.feature_dataset &&
              states[0].properties[this.feature_dataset.title]
            ) {
              myString =
                `<h4><strong>${
                  states[0].properties.Gemeindename
                }</strong></h4>` +
                `<p><strong><em>${
                  states[0].properties[this.feature_dataset.title]
                }</strong> ${this.feature_dataset.unit}</em></p>`;
            } else {
              myString = `<h3><strong>${
                states[0].properties.Gemeindename
              }</strong></h3>`;
            }
            document.getElementById('pd').innerHTML = myString;
            //const data1 = {a: 9, b: 20, c:30, d:8, e:12}

            if (states[0].properties.dataArray !== undefined) {
              if (this.getMoveOverViewSetting()) {
                this._updatePipe(JSON.parse(states[0].properties.dataArray));
              }
            }
          } else {
            document.getElementById('pd').innerHTML =
              '<p>Bewege die Maus über die Kreise</p>';
          }
        }
      });
    });
    // map.on('mouseleave', 'kreisgrenzen', function() {
    //   map.setFilter('kreis-border-hover', ['==', 'Gemeindename', '']);
    // });

    this.featureDataset = this.feature_dataset;
console.log(this.featureDataset)
console.log(this.feature_dataset)
  }

  getMap() {
    return this.map;
  }

  getTitle() {
    return this.feature_dataset.title;
  }

  getYear() {
    return current_year;
  }

  getMinMaxSetting() {
    return document.getElementById('checkbox1').checked;
  }
  getMoveOverViewSetting() {
    return document.getElementById('checkbox2').checked;
  }

  /**
   * @description Loads data in the map
   * @param {function} loadDone called when data was fetched successful
   */
  loadData(loadDone) {
    // fetch('/assets/data/nw_dvg2_krs.json')
    //   .then(function(response) {
    //     response.json().then(function(data) {
    //       KreiseNRW = data;
    //     });
    //   })
    //   .catch(function(ex) {
    //     console.log('parsing failed', ex);
    //   });

    /* eslint-disable global-require */
    KreiseNRW = require('./../data/nw_dvg2_krs.json');
    if (this.map.getLayer('kreisgrenzen')) {
      this.map.removeLayer('kreisgrenzen');
    }
    try {
      this.map.addSource('KreiseNRW', {
        type: 'geojson',
        data: KreiseNRW
      });
    } catch (e) {}
    this.map.addLayer({
      id: 'kreisgrenzen',
      type: 'fill',
      source: 'KreiseNRW',
      paint: {
        'fill-opacity': 0.8,
        'fill-color': '#5266B8',
        'fill-outline-color': '#5266B8'
      }
    });
    try {
      loadDone(true);
    } catch (e) {}
  }

  /**
   * @description centers the the map around NRW to fit the viewport
   */
  center() {
    this.map.resize();
    this.map.fitBounds(
      // Fit around the center of Northrhine-Westphalia
      new mapboxgl.LngLatBounds([5.8664, 50.3276], [9.4623, 52.5325], {
        padding: 20
      })
    );
  }

  /**
   * @description changes the map style
   * TODO: choosen feature gets lost on style change
   * @param {String} style style to be applied to the map
   */
  changeStyle(style) {
    const layers = Object.keys(wmsLayerUrls);
    if (layers.includes(style)) {
      if (!this.map.getLayer(style)) {
        this.map.addLayer(
          {
            id: style,
            paint: {},
            type: 'raster',
            source: {
              type: 'raster',
              tileSize: 256,
              tiles: wmsLayerUrls[style]
            }
          },
          'kreisgrenzen'
        );
      } else {
        this.map.setLayoutProperty(style, 'visibility', 'visible');
      }
      layers.splice(layers.findIndex(l => l === style), 1);
    } else if (style === 'empty') {
      this.map.setStyle('mapbox://styles/felixaetem/cjdncto7a081u2qsbfwe2750v');
    } else {
      this.map.setStyle(`mapbox://styles/mapbox/${style}-v9`);
    }

    for (const l of layers) {
      if (this.map.getLayer(l)) {
        this.map.setLayoutProperty(l, 'visibility', 'none');
      }
    }
  }

  /**
   * @description changes transparency of overlay
   * @param {Number} transparency transparency value between 0 and 100
   */
  changeTransparency(transparency) {
    this.map.setPaintProperty(
      'kreisgrenzen',
      'fill-opacity',
      transparency / 100
    );
  }

  /**
   * @description returns the overlay transperency
   */
  getTransparency() {
    return this.map.getPaintProperty('kreisgrenzen', 'fill-opacity');
  }

  /**
   * @description changes low or high color value
   * @param {string} type "low" or "high"
   * @param {string} value hexadecimal value
   */
  changeColor(type, value) {
    if (type === 'low') {
      lowColor = value;
    } else if (type === 'high') {
      highColor = value;
    }

    if (this.feature_dataset.title) {
      if (this.map.getLayer('kreisgrenzen')) {
        this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
          property: this.feature_dataset.title,
          stops: [
            [
              this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
              lowColor
            ],
            [
              this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
              highColor
            ]
          ]
        });
      }
    }
    if (this.map.getLayer('feinstaub_band_layer')) {
      this.map.setPaintProperty('feinstaub_band_layer', 'fill-color', {
        property: 'DN',
        stops: [[0, lowColor], [45, highColor]]
      });
    }

    document.getElementById('legend-min').innerHTML = this._getMinFeature(
      KreiseNRW,
      this.feature_dataset.title,
      'MIN'
    );
    document.getElementById('legend-max').innerHTML = this._getMaxFeature(
      KreiseNRW,
      this.feature_dataset.title,
      'MAX'
    );
    document.getElementById(
      'legend-bar'
    ).style.background = `linear-gradient(to right, ${lowColor}, ${highColor})`;
  }

  /**
   * @description gets data from data folder and sets styling
   * @param {string} data_source file name of json data source inside of the data folder
   * @param {string} feature name of the feature e.g. arbeitslose
   */
  setData(data_source) {
    if (!showLegendOnStart) {
      $('.legend-info-wrapper').show();
      $('.legend').collapse('show');
      showLegendOnStart = true;
    }
    // const url = `./../data/${data_source}.json`;

    /* eslint-disable global-require */
    const _data = require(`./../data/${data_source}.json`);
    console.log('_data');
    console.log(_data);
    console.log('_data.unit');
    console.log(_data.unit);
    if (_data.title === 'Europawahl') {
      //_data.unit = '%';
      this._setElectionDataFromJSON(_data);
    } else {
      this._setDataFromJSON(_data);
    }

    // fetch(url)
    //   .then(response => {
    //     response.json().then(_data => {
    //       /* eslint-enable global-require */
    //       return this.this.feature_dataset.data(_data, feature);
    //     });
    //   })
    //   .catch(ex => {
    //     console.log('parsing failed', ex);
    //   });
  }

  setPointData(data_source) {
    /* eslint-disable global-require */
    const _data = require(`./../data/${data_source}.json`);

    if (this.containsLayer('KiTasNRW')) {
      this.map.removeLayer('KiTasNRW');
      this.map.removeSource('KiTasNRW');
    } else {
      this.map.addSource('KiTasNRW', {
        type: 'geojson',
        data: _data
      });

      this.map.addLayer({
        id: 'KiTasNRW',
        type: 'circle',
        source: 'KiTasNRW',
        paint: {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': {
            base: 1.5,
            stops: [[12, 3], [22, 180]]
          },
          // color circles by ethnicity, using a match expression
          // https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
          'circle-color': '#ffff00',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ababab'
        }
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      this.map.on('click', 'KiTasNRW', e => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] =
            coordinates[0] + (e.lngLat.lng > coordinates[0] ? 360 : -360);
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `
            <strong>${description.Name}</strong>
            <p>${description.Strasse}, ${description.PLZ} ${description.Ort}</p>
            <p>Landesgefördert:    ${
              description.landesgefoerdert ? 'Ja' : 'Nein'
            }<br>
            U3 Plätze:          ${
              description.U3Plaetze === -1
                ? 'Keine Daten'
                : description.U3Plaetze
            }<br>
            Ü3 Plätze:          ${
              description.UE3Plaetze === -1
                ? 'Keine Daten'
                : description.UE3Plaetze
            }<br>
            Plätze Schulkinder: ${
              description.PlaetzeSchulkinder === -1
                ? 'Keine Daten'
                : description.PlaetzeSchulkinder
            }</p>
          `
          )
          .addTo(this.map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      this.map.on('mouseenter', 'KiTasNRW', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', 'KiTasNRW', () => {
        this.map.getCanvas().style.cursor = '';
      });
    }
  }

  enableHeatmap() {
    if (
      this.containsLayer('KiTasNRW') &&
      !this.containsLayer('KiTasNRW_Heat')
    ) {
      this.map.addLayer({
        id: 'KiTasNRW_Heat',
        type: 'heatmap',
        source: 'KiTasNRW',
        maxzoom: 8,
        paint: {
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            lowColor,
            1,
            highColor
          ],
          // Transition from heatmap to circle layer by zoom level
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 4, 1, 8, 0]
        }
      });
    }
  }

  disableHeatmap() {
    if (this.containsLayer('KiTasNRW_Heat'))
      this.map.removeLayer('KiTasNRW_Heat');
  }

  setPointColor(parameter) {
    if (parameter === '') {
      // default
      this.map.setPaintProperty('KiTasNRW', 'circle-color', '#ffff00');
      this.map.setPaintProperty('KiTasNRW', 'circle-stroke-width', 1);
    } else {
      const max = {
        U3Plaetze: 54,
        UE3Plaetze: 99,
        PlaetzeSchulkinder: 64
      };
      this.map.setPaintProperty('KiTasNRW', 'circle-color', {
        property: parameter,
        stops: [[0, lowColor], [max[parameter], highColor]]
      });
      this.map.setPaintProperty('KiTasNRW', 'circle-stroke-width', 0);
    }
  }

  setPointRadius(parameter) {
    if (parameter === '') {
      // default
      this.map.setPaintProperty('KiTasNRW', 'circle-radius', {
        base: 1.5,
        stops: [[12, 3], [22, 180]]
      });
    } else {
      const max = {
        U3Plaetze: 54,
        UE3Plaetze: 99,
        PlaetzeSchulkinder: 64
      };
      this.map.setPaintProperty('KiTasNRW', 'circle-radius', {
        property: parameter,
        stops: [[0, 1], [max[parameter], 8]]
      });
    }
  }

  containsLayer(layer) {
    for (const mapLayer of this.map.getStyle().layers) {
      if (mapLayer.id === layer) {
        return true;
      }
    }

    return false;
  }

  /**
   * @description changes the current year and applies changes to layer
   * @param {String} year
   */
  updateData(year = this._getFirstYearOfDataset(), data) {
    current_year = year;
    let maxDataKey = 0;
    KreiseNRW.features.map(kreis => {
      this.feature_dataset.data.forEach(kreisPop => {
        if (
          kreis.properties.Kreisnummer.slice(
            0,
            kreis.properties.Kreisnummer.length - 3
          ) === kreisPop.AGS
        ) {
          if (data) {
            maxDataKey = this._getMaxFeatureInArray(kreis.properties.dataArray);
          }
          if (maxDataKey !== 0) {
            //console.log('Gewinner ist : ');
            kreis.properties[this.feature_dataset.title] = maxDataKey;
          } else {
            kreis.properties[this.feature_dataset.title] = Number(
              kreisPop.data[year]
            );
          }
        }
      });
    });

    if (statistics_state.enabled) {
      this.changeStatistics(statistics_state.type);
      this.map.setPaintProperty(
        'kreisgrenzen',
        'fill-color',
        statistics_state.colorStops
      );
    } else if (data) {
      this.map.getSource('KreiseNRW').setData(KreiseNRW);
      const allDataInMap = Statistics.getUniqueValues(
        this._getData(),
        this._getData().length
      );
      const stepColor = [];
      const colors = colorLerp(lowColor, highColor, allDataInMap.length, 'hex');
      colors.forEach((dataInMap, i) => {
        const string = [];
        string.push(allDataInMap[i]);
        string.push(dataInMap);
        stepColor.push(string);
      });

      this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
        property: this.feature_dataset.title,
        type: 'categorical',
        stops: stepColor
      });
    } else {
      this.map.getSource('KreiseNRW').setData(KreiseNRW);
      this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
        property: this.feature_dataset.title,
        stops: [
          [
            this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
            lowColor
          ],
          [
            this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
            highColor
          ]
        ]
      });
    }

    document.getElementById('year').textContent = year;

    document.getElementById('legend-min').innerHTML = this._getMinFeature(
      KreiseNRW,
      this.feature_dataset.title,
      'MIN'
    );
    document.getElementById('legend-max').innerHTML = this._getMaxFeature(
      KreiseNRW,
      this.feature_dataset.title,
      'MAX'
    );
  }

  /**
   * import CSV file
   */
  importCSV() {
    const file = document.getElementById('custom_csv_input').files[0];
    if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
      const parser = new CSVParser();
      parser.getAsText(file, data => {
        if (data.unit === 'wahlen') {
          this._setElectionDataFromJSON(data, file.name);
          //data.unit = '%';
        } else {
          this._setDataFromJSON(data, file.name);
        }
      });
    } else {
      $('#csv_info').text('Die gewählte Datei ist keine .csv Datei!');
    }
  }

  /**
   * @description adds a layer of fine dust data to the map
   * @param {string} name file name of file e.b. band12_02112017
   */
  addFeinstaubLayer(name) {
    /* eslint-disable global-require */
    const band = require(`./../data/${name}.json`);
    /* eslint-enable global-require */

    if (!this.map.getLayer('feinstaub_band_layer')) {
      this.map.addSource('feinstaub_band', {
        type: 'geojson',
        data: band
      });
      this.map.addLayer({
        id: 'feinstaub_band_layer',
        type: 'fill',
        source: 'feinstaub_band',
        paint: {
          'fill-color': {
            property: 'DN',
            stops: [[0, lowColor], [45, highColor]]
          },
          'fill-opacity': 0.8
        }
      });
    } else {
      this.map.getSource('feinstaub_band').setData(band);
    }
  }

  /**
   * @description removes fine dust layer
   */
  removeFeinstaubLayer() {
    this.map.removeSource('feinstaub_band');
    this.map.removeLayer('feinstaub_band_layer');
  }

  resize() {
    this.map.resize();
  }

  changeStatistics(type) {
    statistics_state.type = type;

    switch (type) {
      case 'STANDARD':
        this._applyStandard();
        break;
      case 'EQUAL_INTERVAL':
        this._applyStatistic(
          Statistics.getEqualInterval(
            this._getData(),
            this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
            this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'STD_DEVIATION':
        this._applyStatistic(
          Statistics.getClassStdDeviation(
            this._getData(),
            this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
            this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'ARITHMETIC_PROGRESSION':
        this._applyStatistic(
          Statistics.getClassArithmeticProgression(
            this._getData(),
            this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
            this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'GEOMETRIC_PROGRESSION':
        this._applyStatistic(
          Statistics.getClassGeometricProgression(
            this._getData(),
            this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
            this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'QUANTILE':
        this._applyStatistic(
          Statistics.getClassQuantile(
            this._getData(),
            this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
            this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'JENKS':
        this._applyStatistic(
          Statistics.getClassJenks(
            this._getData(),
            this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
            this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'unique':
        this._applyStatistic(
          Statistics.getUniqueValues(
            this._getData(),
            this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
            this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
            this._getData().length
          )
        );
        break;
    }
  }

  _applyStandard() {
    this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
      property: this.feature_dataset.title,
      stops: [
        [
          this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
          lowColor
        ],
        [
          this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
          highColor
        ]
      ]
    });
    this._hideLegend();
    statistics_state.enabled = false;
  }

  _hideLegend() {
    $('.discrete-legend').hide();
    $('.scale-legend').show();

    current_legend = $('.scale-legend')[0];
  }

  getLegend() {
    return current_legend;
  }

  _applyStatistic(classes) {
    const colors = colorLerp(
      lowColor,
      highColor,
      Number(document.getElementById('stats_classes').value),
      'hex'
    );

    const stops = ['step', ['get', this.feature_dataset.title]];

    $('.legend-labels').empty();

    colors.forEach((e, i) => {
      if (i !== 0) {
        stops.push(classes[i]);
      }
      stops.push(e);

      const liFlex =
        (classes[i + 1] - classes[i]) /
        (classes[classes.length - 1] - classes[0]);

      /**
       * TODO: show amount of elements in class
       * add the following snippet to the li tag and uncomment the const count line:
       * data-toggle="tooltip" data-placement="top" data-html="true" title="${count}"
       */
      // const count = this._getCountInRange(classes[i], classes[i + 1]);
      const lowerBound = Math.round(classes[i] * 10) / 10;
      const upperBound = Math.round(classes[i + 1] * 10) / 10;

      if (i === colors.length - 1) {
        $('.legend-labels').append(
          `<li style="flex: ${liFlex}">
            <span style="background:${e};">
            </span>${lowerBound}<br /> - <br />${upperBound}</li>`
        );
      } else {
        $('.legend-labels').append(
          `<li style="flex: ${liFlex}">
            <span style="background:${e};">
            </span>${lowerBound}<br /> - <br /><${upperBound}</li>`
        );
      }
    });

    $('[data-toggle="tooltip"]').tooltip(); // initialize new poppers

    this.map.setPaintProperty('kreisgrenzen', 'fill-color', stops);

    statistics_state.enabled = true;
    statistics_state.colorStops = stops;

    $('.discrete-legend').show();
    $('.scale-legend').hide();

    current_legend = $('.discrete-legend')[0];
  }

  /**
   * @description styles layer according to data
   * @param {json object} data data that should be applied
   * @param {string} feature name of the feature e.g. arbeitslose
   */
  _setDataFromJSON(data) {
    this.feature_dataset = data;
    // show json in new tab
    /**const win = window.open();
    win.document.write(
      decodeURIComponent(encodeURIComponent(JSON.stringify(data)))
    );**/

    document.getElementById('legend-heading').innerHTML = data.title;
    $('#my_dataviz').hide();

    $('.legend').each(function() {
      $(this).removeClass('legendWithPieChart');
    });

    // map feature to layer
    KreiseNRW.features.map(kreis => {
      this.feature_dataset.data.forEach(data_feature => {
        if (!String(data_feature.AGS).startsWith('0')) {
          data_feature.AGS = `0${data_feature.AGS}`;
        }
        if (
          kreis.properties.Kreisnummer.slice(
            0,
            kreis.properties.Kreisnummer.length - 3
          ) === data_feature.AGS
        ) {
          kreis.properties[data.title] = Number(data_feature.data[0]);
          kreis.properties['MIN'] = Number(data_feature.MIN);
          kreis.properties['MAX'] = Number(data_feature.MAX);
        }
      });
    });

    // apply styling
    this.map.getSource('KreiseNRW').setData(KreiseNRW);
    /**this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
      property: data.title,
      stops: [
        [
          this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
          lowColor
        ],
        [
          this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
          highColor
        ]
      ]
    });


    // update ui elements
    document.getElementById('legend-min').innerHTML = this._getMinFeature(
      KreiseNRW,
      this.feature_dataset.title,
      'MIN'
    );
    document.getElementById('legend-max').innerHTML = this._getMaxFeature(
      KreiseNRW,
      this.feature_dataset.title,
      'MAX'
    );

     **/

    //document.getElementById('timeslider').removeAttribute('hidden');
    $('#timeslider').show();
    $('#my_dataviz').hide();

    document.getElementById(
      'timeslide-min'
    ).innerHTML = this._getFirstYearOfDataset();
    document.getElementById(
      'timeslide-max'
    ).innerHTML = this._getLastYearOfDataset();
    document
      .getElementById('slider')
      .setAttribute('min', this._getFirstYearOfDataset());
    document
      .getElementById('slider')
      .setAttribute('max', this._getLastYearOfDataset());

    if (statistics_state.enabled) {
      statistics_state.enabled = false;
      this._hideLegend();
    }
    $('.legend-info-wrapper').show();

    this.updateData();
  }

  /**
   * @description styles layer according to electiondata
   * @param {json object} data that should be applied
   * @param {string} feature name of the feature e.g. arbeitslose
   */
  _setElectionDataFromJSON(data) {
    console.log('_setElectionDataFromJSON');
    this.feature_dataset = data;

    //createAttribute

    // show json in new tab
    //const win = window.open();
    //win.document.write(
    //  decodeURIComponent(encodeURIComponent(JSON.stringify(data)))
    //);

    document.getElementById('legend-heading').innerHTML = data.title;
    $('#my_dataviz').show();
    $('#timeslider').hide();

    $('.legend').each(function() {
      $(this).addClass('legendWithPieChart');
    });

    // map feature to layer
    KreiseNRW.features.map(kreis => {
      this.feature_dataset.data.forEach(data_feature => {
        if (!String(data_feature.AGS).startsWith('0')) {
          data_feature.AGS = `0${data_feature.AGS}`;
        }
        if (
          kreis.properties.Kreisnummer.slice(
            0,
            kreis.properties.Kreisnummer.length - 3
          ) === data_feature.AGS
        ) {
          kreis.properties[data.title] = Number(
            data_feature.data.Wahlbeteiligung
          );
          document.getElementById('year').textContent = 'Wahlbeteiligung';

          const dataArray = {};
          for (let i = 5; i <= Object.keys(data_feature.data).length; i++) {
            dataArray[Object.keys(data_feature.data)[i]] = Number(
              Object.values(data_feature.data)[i]
            );
          }
          kreis.properties['dataArray'] = JSON.parse(JSON.stringify(dataArray));
          kreis.properties['MIN'] = Number(data_feature.MIN);
          kreis.properties['MAX'] = Number(data_feature.MAX);
        }
      });
    });

    // apply styling
    this.map.getSource('KreiseNRW').setData(KreiseNRW);
    this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
      property: data.title,
      stops: [
        [
          this._getMinFeature(KreiseNRW, this.feature_dataset.title, 'MIN'),
          lowColor
        ],
        [
          this._getMaxFeature(KreiseNRW, this.feature_dataset.title, 'MAX'),
          highColor
        ]
      ]
    });

    // update ui elements
    document.getElementById('legend-min').innerHTML = this._getMinFeature(
      KreiseNRW,
      this.feature_dataset.title,
      'MIN'
    );
    document.getElementById('legend-max').innerHTML = this._getMaxFeature(
      KreiseNRW,
      this.feature_dataset.title,
      'MAX'
    );

    if (statistics_state.enabled) {
      statistics_state.enabled = false;
      this._hideLegend();
    }
    $('.legend-info-wrapper').show();

    //this._updatePipe(data1);
    //this.updateData();
  }

  /**
   * @description returns the max value according to data and feature
   * @param {json object} data data where you want to get the max value
   * @param {string} feature
   * @returns max value
   */
  _getMaxFeature(data, feature, value) {
    let maxVal = 0;
    let searchAttribute;
    if (this.getMinMaxSetting()) {
      searchAttribute = value;
    } else {
      searchAttribute = feature;
    }

    data.features.forEach(child => {
      if (child.properties[searchAttribute] > maxVal) {
        maxVal = child.properties[searchAttribute];
      }
    });

    return maxVal;
  }

  /**
   * @description returns the max value according to data and feature
   * @param {json object} data data where you want to get the max value
   * @param {string} feature
   * @returns max value
   */
  _getMaxFeatureInArray(data) {
    let maxVal = 0;
    let maxkey = 0;
    Object.keys(data).forEach(function(key) {
      if (maxVal < data[key]) {
        maxVal = data[key];
        maxkey = `${key}`;
      }
    });

    return maxkey;
  }

  /**
   * @description returns the min value according to data and feature
   * @param {json object} data data where you want to get the min value
   * @param {string} feature
   * @returns min value
   */
  _getMinFeature(data, feature, value) {
    let minVal = 999999999999;

    let searchAttribute;

    if (this.getMinMaxSetting()) {
      searchAttribute = value;
    } else {
      searchAttribute = feature;
    }
    data.features.forEach(child => {
      if (child.properties[searchAttribute] < minVal) {
        minVal = child.properties[searchAttribute];
      }
    });

    return minVal;
  }

  /**
   * @description years of  current dataset
   * @returns years of current dataset
   */
  _getYearsOfDataset() {
    return Object.keys(this.feature_dataset.data[0].data);
  }

  /**
   * @description first year of current dataset
   * @returns first year of current dataset
   */
  _getFirstYearOfDataset() {
    return Object.keys(this.feature_dataset.data[0].data)[0];
  }

  /**
   * @description last year of current dataset
   * @returns last year of current dataset
   */
  _getLastYearOfDataset() {
    const dataset_data = Object.keys(this.feature_dataset.data[0].data);

    return dataset_data[dataset_data.length - 1];
  }

  _getData() {
    const temp = [];
    KreiseNRW.features.forEach(e => {
      const val = e.properties[this.feature_dataset.title];
      if (val) {
        temp.push(e.properties[this.feature_dataset.title]);
      }
    });

    return temp;
  }

  // eslint-disable-next-line no-warning-comments
  // TODO consider number that are exactly on min / max
  _getCountInRange(min, max) {
    let counter = 0;
    this._getData().forEach(e => {
      if (e >= min && e <= max) {
        counter++;
      }
    });

    return counter;
  }

  // A function that create / update the plot for a given variable:
  _updatePipe(data) {
    // Compute the position of each group on the pie:
    const pie = d3.pie().value(function(d) {
      return d.value;
    });
    const pie2 = d3.pie().value(function(d) {
      return 45;
    });
    const data_ready = pie(d3.entries(data));
    const data_ready2 = pie2(d3.entries(data1));

    // map to data
    const u = svg
      .selectAll('path.outer')
      .data(data_ready)
      .on('mouseover', this._handleMouseOver)
      .on('mouseout', this._handleMouseOut)
      .on('click', this._handleMouseOnClick);

    const o = svg
      .selectAll('path.middle')
      .data(data_ready2)
      .on('mouseover', this._handleMouseOver)
      .on('mouseout', this._handleMouseOut)
      .on('click', this._handleMouseOnClick);

    o.enter()
      .append('path')
      .merge(o)
      .transition()
      .attr(
        'd',
        d3
          .arc()
          .innerRadius(0)
          .outerRadius(40)
      )
      .attr('class', 'middle')
      .attr('fill', function(d) {
        return color(d.data.key);
      })
      .attr('name', function(d) {
        return d.data.key;
      })
      .attr('data', JSON.stringify(data))
      .attr('stroke', 'white')
      .style('stroke-width', '0px')
      .style('opacity', 1);

    // shape helper to build arcs:
    const arcGenerator = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    u.enter()
      .append('path')
      .merge(u)
      .transition()
      .duration(500)
      .attr(
        'd',
        d3
          .arc()
          .innerRadius(55)
          .outerRadius(radius)
      )
      .attr('class', 'outer')
      .attr('fill', function(d) {
        return color(d.data.key);
      })
      .attr('name', function(d) {
        return d.data.key;
      })
      .attr('stroke', 'white')
      .style('stroke-width', '0px')
      .style('opacity', 1);

    /**
//show lable from path
     // Now add the annotation. Use the centroid method to get the best coordinates
     u //.selectAll('mySlices')
     //.data(data_ready)
     .enter()
     .append('text')
     .text(function(d) {
        console.log(d);

        return `grp ${d.data.key}`;
      })
     .attr('transform', function(d) {
        return `translate(${arcGenerator.centroid(d)})`;
      })
     .style('text-anchor', 'middle')
     .style('font-size', 17);

     // remove the group that is not present anymore
     **/

    u.exit().remove();
    o.exit().remove();
  }

  _handleMouseOver(d, i) {
    /**
    // show text when hover over:
    const arcGenerator = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Use D3 to select element, change color and size
    d3.select(this)
      .style('fill', 'yellow') //d3.select(this).attr('stroke'))
      .attr('opacity', 0.3);

    // Specify where to put label of text
    d3.select(this.parentNode)
      .append('text')
      .text(function() {
        d3.select(this);

        return `${d.data.key} : ${d.data.value}`;
      })
      .attr('transform', function() {
        d3.select(this);

        return `translate(${arcGenerator.centroid(d)})`;
      })
      .style('text-anchor', 'middle')
      .style('font-size', 17);
**/

    const myString = `<p><strong>${d.data.key} : ${d.data.value}%</strong></p>`;

    document.getElementById('infoPieChart').innerHTML = myString;
  }

  _handleMouseOut(d, i) {
    /**
    // Use D3 to select element, change color back to normal
    d3.select(this)
      .style('fill', d3.select(this).attr('fill'))
      .attr('opacity', 1);

    d3.select(this.parentNode)
      .selectAll('text')
      .remove();
**/
    document.getElementById('infoPieChart').innerHTML = '';
  }

  _handleMouseOnClick(d, i) {
    // console.log(d.data.key);
    // console.log(this.parentNode.parentNode.parentNode);
    //this('#map').updateData(d.data.key);
    //KreiseNRW.features.map.updateData(d.data.key);
  }

  _addHomeButton() {
    const currentMaps = $('.mapboxgl-ctrl-zoom-out').parents('.map').length;
    // save the zoomOutBtn and create a homeButton
    let zoomOutBtn;
    let homeButton;


    switch (currentMaps) {
      case 1:
        $('#map .homeButton').remove();
        zoomOutBtn = $('#map .mapboxgl-ctrl-zoom-out');
        homeButton = $('#map .mapboxgl-ctrl-zoom-out').clone();
        break;
      case 2:
        $('#dual_map .homeButton').remove();
        zoomOutBtn = $('#dual_map .mapboxgl-ctrl-zoom-out');
        homeButton = $('#dual_map .mapboxgl-ctrl-zoom-out').clone();
        break;
      default:
        console.log(
          'You are trying to add a button to a map that is not planned to exist!'
        );
        break;
    }

    homeButton.on('click', () => {
      this.getMap().flyTo({
        center: [7.555, 51.478333],
        zoom: 7
      });
    });
    homeButton.removeClass('mapboxgl-ctrl-zoom-out');
    homeButton.addClass('homeButton');
    homeButton.append('<span class="material-icons">home</span>');
    homeButton.removeAttr('aria-label');
    zoomOutBtn.after(homeButton);
  }
}
