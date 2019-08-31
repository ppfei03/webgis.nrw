import mapboxgl from 'mapbox-gl';
import 'whatwg-fetch';
import * as d3 from 'd3';

import colorLerp from 'color-lerp';

import Statistics from './Statistics.js';

// const KreiseNRW_source = require('./../data/landkreise_simplify0.json');
import { mapboxToken, wmsLayerUrls } from './../config.js';
import CSVParser from './CSVParser.js';
import App from './App';
import Legend from './Legend';

let KreiseNRW;
//let this.feature_dataset;
let current_year;
let current_legend = $('.scale-legend')[0];

let showLegendOnStart = false;

export const allInstances = [];

// set the dimensions and margins of the graph
const width = 370,
  height = 370,
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
    this.container = `${container}Legend`;

    this.alldata = {
      data: false,
      enabled: false
    };
    this.statistics_state = {
      enabled: false,
      type: '',
      colorStops: []
    };

    this.lowColor = '#80BCFF';
    this.highColor = '#1A5FAC';

    mapboxgl.accessToken = mapboxToken;
    this.map = new mapboxgl.Map({
      container: container,
      center: center,
      zoom: zoom,
      style: 'mapbox://styles/mapbox/light-v9',
      preserveDrawingBuffer: true // to print map
    });
    allInstances.push(this);
    this._updatePipe(data1);

    this.legende = new Legend(`${this.container}`);

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');

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
          this.legende.legendActivate();
          this.legende.singleLegend(e.point, {
            layers: ['kreisgrenzen']
          });

          const states = this.map.queryRenderedFeatures(e.point, {
            layers: ['kreisgrenzen']
          });
          try {
            this._updatePipe(JSON.parse(states[0].properties.dataArray));
          } catch (error) {}
        }
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
        if (this.getMoveOverViewSetting()) {
          if (this.map.getLayer('kreisgrenzen')) {
            const states = this.map.queryRenderedFeatures(e.point, {
              layers: ['kreisgrenzen']
            });

            if (states.length > 0) {
              if (App.dualView || App.splitView) {
                this.legende.legendActivate();
                this.legende.singleLegend(e.point, {
                  layers: ['kreisgrenzen']
                });
              } else {
                this.legende.legendActivate();
                this.legende.singleLegend(e.point, {
                  layers: ['kreisgrenzen']
                });
              }
              if (states[0].properties.dataArray !== undefined) {
                this._updatePipe(JSON.parse(states[0].properties.dataArray));
              }
            } else {
            }
          }
        }
      });
    });
    // map.on('mouseleave', 'kreisgrenzen', function() {
    //   map.setFilter('kreis-border-hover', ['==', 'Gemeindename', '']);
    // });
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
    return this.alldata.enabled;
  }
  getMoveOverViewSetting() {
    return $(`#${this.container}_auto_change`)
      .parent()
      .hasClass('active');
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
    this.feature_dataset = undefined;
    this.alldata.data = false;
    KreiseNRW = require('./../data/nw_dvg2_krs.json');
    if (this.map.getLayer('kreisgrenzen')) {
      console.log(this.map.getLayer('kreisgrenzen'));

      this.map.removeLayer('kreisgrenzen');
      console.log(this.map.getLayer('kreisgrenzen'));
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
        'fill-color': '#c7c1c7',
        'fill-outline-color': '#c7c1c7'
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
      console.log(this.map.getLayer(style));
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
      console.log(this.map.getLayer('kreisgrenzen'));
      this.map.setStyle(`mapbox://styles/mapbox/${style}-v9`);
      console.log(this.map.getLayer('kreisgrenzen'));
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
      this.lowColor = value;
      this.legende.lowColor = value;
    } else if (type === 'high') {
      this.highColor = value;
      this.legende.highColor = value;
    }
    this.legende.legendActivate();

    if (this.feature_dataset.title) {
      if (this.map.getLayer('kreisgrenzen')) {
        this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
          property: this.feature_dataset.title,
          stops: [
            [Statistics.getMin(this._getData()), this.lowColor],
            [Statistics.getMax(this._getData()), this.highColor]
          ]
        });
      }
    }
    if (this.map.getLayer('feinstaub_band_layer')) {
      this.map.setPaintProperty('feinstaub_band_layer', 'fill-color', {
        property: 'DN',
        stops: [[0, this.lowColor], [45, this.highColor]]
      });
    }

    this.legende.changeLegendScaleBar(this._getData());
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

    if (_data.title === 'Europawahl') {
      //_data.unit = '%';
      this._setElectionDataFromJSON(_data);
    } else {
      this._setDataFromJSON(_data);
    }
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
            this.lowColor,
            1,
            this.highColor
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
        stops: [[0, this.lowColor], [max[parameter], this.highColor]]
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
   * @param data if pieChart available
   */
  updateData(year, data) {
    //this.legende.year = year;
    this.legende.legendActivate();
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
            kreis.properties[this.feature_dataset.title] = maxDataKey;
          } else {

            kreis.properties[this.feature_dataset.title] = Number(
              kreisPop.data[year]
            );
            kreis.properties.year = year;
          }
        }
      });
    });

    if (this.statistics_state.enabled) {
      if (this.alldata.enabled) {
        this.map.getSource('KreiseNRW').setData(KreiseNRW);
        if (!this.alldata.data) {
          console.log('changestatisticsHIER');
          this.changeStatistics(this.statistics_state.type);
        }
      } else {
        this.changeStatistics(this.statistics_state.type);
      }

      this.map.setPaintProperty(
        'kreisgrenzen',
        'fill-color',
        this.statistics_state.colorStops
      );
    } else if (data) {
      this.map.getSource('KreiseNRW').setData(KreiseNRW);
      const dataInMap = this._getData();
      const allDataInMap = Statistics.getUniqueValues(
        dataInMap,
        dataInMap.length
      );
      const stepColor = [];
      const colors = colorLerp(
        this.lowColor,
        this.highColor,
        allDataInMap.length,
        'hex'
      );
      colors.forEach((dataInMap, i) => {
        const string = [];
        string.push(allDataInMap[i]);
        const findValue = allDataInMap[i];
        const result = $(`path[name^=${findValue}]`).attr('fill');
        string.push(result);
        stepColor.push(string);
      });
      console.log(stepColor);

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
          [Statistics.getMin(this._getData()), this.lowColor],
          [Statistics.getMax(this._getData()), this.highColor]
        ]
      });
    }

    this.legende.changeLegendScaleBar(this._getData());

    //this.legende.singleLegend(this.legende.point, {
    //  layers: ['kreisgrenzen']
    //});

  }

  /**
   * import CSV file
   */
  importCSV() {
    const file = document.getElementById('custom_csv_input').files[0];
    if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
      const parser = new CSVParser();
      parser.getAsText(file, data => {
        if (document.getElementById('csv_electiondata').checked) {
          this._setElectionDataFromJSON(data, file.name);
          //data.unit = '%';
        } else if (document.getElementById('csv_timedata').checked) {
          this._setDataFromJSON(data, file.name);
        } else {
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
            stops: [[0, this.lowColor], [45, this.highColor]]
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
    if (this.statistics_state.type !== type) {
      this.alldata.data = false;
    }

    this.statistics_state.type = type;

    switch (type) {
      case 'STANDARD':
        this._applyStandard();
        break;
      case 'EQUAL_INTERVAL':
        this._applyStatistic(
          Statistics.getEqualInterval(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'STD_DEVIATION':
        this._applyStatistic(
          Statistics.getClassStdDeviation(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'ARITHMETIC_PROGRESSION':
        this._applyStatistic(
          Statistics.getClassArithmeticProgression(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'GEOMETRIC_PROGRESSION':
        this._applyStatistic(
          Statistics.getClassGeometricProgression(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'QUANTILE':
        this._applyStatistic(
          Statistics.getClassQuantile(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'JENKS':
        this._applyStatistic(
          Statistics.getClassJenks(
            this._getData(),
            document.getElementById('stats_classes').value
          )
        );
        break;
      case 'unique':
        this._applyStatistic(
          Statistics.getUniqueValues(this._getData(), this._getData().length)
        );
        break;
    }
  }

  _applyStandard() {
    this.map.setPaintProperty('kreisgrenzen', 'fill-color', {
      property: this.feature_dataset.title,
      stops: [
        [Statistics.getMin(this._getData()), this.lowColor],
        [Statistics.getMax(this._getData()), this.highColor]
      ]
    });
    this._hideLegend();
    this.statistics_state.enabled = false;
  }

  _hideLegend() {
    this.legende.legendeShow();
    this.legende.legendDiscreteHide();

    current_legend = $('.scale-legend')[0];
  }

  getLegend() {
    return current_legend;
  }

  _applyStatistic(classes) {
    console.log('Ich wurde aufgerufen');
    const colors = colorLerp(
      this.lowColor,
      this.highColor,
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

    this.statistics_state.enabled = true;
    this.statistics_state.colorStops = stops;

    //$('.discrete-legend').show();
    //$('.scale-legend').hide();
    this.legende.legendDiscreteShow();
    this.legende.legendeHide();

    current_legend = $('.discrete-legend')[0];
  }

  /**
   * @description styles layer according to data
   * @param {json object} data data that should be applied
   * @param {string} feature name of the feature e.g. arbeitslose
   */
  _setDataFromJSON(data) {
    this.legende.feature_dataset = data;
    this.legende.legendActivate();
    this.feature_dataset = data;
    this.alldata.data = false;
    this.legende.fillTimeslider();

    // show json in new tab
    /**const win = window.open();
    win.document.write(
      decodeURIComponent(encodeURIComponent(JSON.stringify(data)))
    );**/

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

    if (this.statistics_state.enabled) {
      this.statistics_state.enabled = false;
      this._hideLegend();
    }

    $('.legend-info-wrapper').show();
    this.legende.year = this._getFirstYearOfDataset();
    this.updateData(this._getFirstYearOfDataset());
  }

  /**
   * @description styles layer according to electiondata
   * @param {json object} data that should be applied
   * @param {string} feature name of the feature e.g. arbeitslose
   */
  _setElectionDataFromJSON(data) {
    console.log('_setElectionDataFromJSON');
    this.legende.feature_dataset = data;
    this.feature_dataset = data;
    this.legende.year = 'Wahlbeteiligung';
    this.alldata.data = false;

    $('#my_dataviz').show();
    $('#mapLegend_timeslider').hide();

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
          //document.getElementById('year').textContent = 'Wahlbeteiligung';

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
        [Statistics.getMin(this._getData()), this.lowColor],
        [Statistics.getMax(this._getData()), this.highColor]
      ]
    });

    // update ui elements
    this.legende.changeLegendScaleBar(this._getData());

    if (this.statistics_state.enabled) {
      this.statistics_state.enabled = false;
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
    if (this.alldata.enabled) {
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

    if (this.alldata.enabled) {
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

  _getAllData() {
    const temp = [];
    if (this.alldata.data === false) {
      console.log('in alldata Function');
      //console.log(this.feature_dataset.data)
      KreiseNRW.features.map(kreis => {
        this.feature_dataset.data.forEach(kreisAllData => {
          //console.log(kreisAllData.data)
          if (
            kreis.properties.Kreisnummer.slice(
              0,
              kreis.properties.Kreisnummer.length - 3
            ) === kreisAllData.AGS
          ) {
            for (const k in kreisAllData.data) {
              if (!isNaN(kreisAllData.data[k])) {
                temp.push(kreisAllData.data[k]);
              } else {
                console.log(kreisAllData.data[k]);
              }
            }
          }
        });
      });
      this.alldata.data = temp;
    }
    console.log(this.alldata);

    return this.alldata.data;
  }

  _getData() {
    let temp = [];

    if (this.alldata.enabled) {
      temp = this._getAllData();
    } else {
      KreiseNRW.features.forEach(e => {
        const val = e.properties[this.feature_dataset.title];
        if (val) {
          temp.push(e.properties[this.feature_dataset.title]);
        }
      });
    }
    //console.log(temp);

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
    let myString;
    if (typeof d.data.value === 'string') {
      console.log('data is string');
      myString = `<p><strong>${d.data.key}</strong></p>`;
    } else {
      myString = `<p><strong>${d.data.key} : ${d.data.value}%</strong></p>`;
    }

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
