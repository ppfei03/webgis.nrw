import { primary_map, secondary_map, duoLegend, dualView } from "./App";
import { allInstances } from "./Map";
import Statistics from "./Statistics";
import GIFExporter from './GIFExporter';
let myGIFExporter = undefined;

class Legend {
  feature_dataset;
  year;
  lowColor;
  highColor;
legendId;

  addDuoLegend(){
    //$(".legend-wrapper").addClass('legend-center')

    //$("body").append($(".legend-wrapper").clone(true).addClass('legend-center'))
  }


  constructor(name) {

    if(!duoLegend){
      this.addDuoLegend()
      this.legendId="";
    }else{
      this.legendId="2"
    }
    this.name = name;

    $("#legend-heading" + this.legendId).append("<h3 id='" + this.name + "_legend-heading' class='legend-title editable " + this.name + "'></h3>");

    $("#year"+ this.legendId).append("<h5 id='" + this.name + "_year' class='" + this.name + "'></h5>");

    $("#legend-scale-bar"+ this.legendId).append(
      "<div id='" + this.name + "_legend' class='" + this.name + "'>" +
      "<div class='legend-bar'id='" + this.name + "_legend-bar'></div>" +
      "<div class='labels'>" +
      "<div class='label legend-min' id='" + this.name + "_legend-min'>0</div>" +
      "<div class='label legend-max' id='" + this.name + "_legend-max'>100</div>" +
      "</div>" +
      "</div>");

    $("#legend-scale-bar"+ this.legendId).append(
      "<div id='" + this.name + "_discrete-legend' class='discrete-legend " + this.name + "' style=\"display: none;\">" +
      "<ul class=\"legend-labels\">" +
      "<li><span style=\"background:#F1EEF6;\"></span><br/>0 - 20%</li>" +
      "<li><span style=\"background:#BDC9E1;\"></span><br/>40%</li>" +
      "<li><span style=\"background:#74A9CF;\"></span><br/>60%</li>" +
      "<li><span style=\"background:#2B8CBE;\"></span><br/>80%</li>" +
      "<li><span style=\"background:#045A8D;\"></span><br/>100%</li>" +
      "</ul>" +
      "</div>");

    $("#map_data_option"+ this.legendId).append(
      "<div class='" + this.name + "'>" +
      "<div id=\"" + this.name + "_border_option\" class=\"option-menue\">" +
      "<label>Grenzen anpassen auf </label>" +
      "<div class=\"btn-group btn-group-toggle\" data-toggle=\"buttons\">" +
      "<label class=\"btn btn_option btn-info active no-margin-bottom\" id=\"" + this.name + "_border_year\" >" +
      "<input type=\"radio\" name=\"options\"  autoComplete=\"off\" checked>Jahr" +
      "</label>" +
      "<label class=\"btn btn_option btn-info no-margin-bottom\" id=\"" + this.name + "_border_data\">" +
      "<input type=\"radio\" name=\"options\"  autoComplete=\"off\">Daten" +
      "</label>" +
      "</div>" +
      "<i class=\"material-icons right-middle\" data-toggle='tooltip' data-placement=\"top\"" +
      "data-html=\"true\" title=\"<b>Jahr</b> = Die Grenzen (min/max) werden an die Daten des ausgewählten Jahres angepasst.<br><b>Daten</b> = Die Grenzen (min/max) werden auf den gesamten Datenraum angepasst.\"style=\"margin-top: 0px;\">info</i>" +
      "</div>" +
      " <div class=\"option-menue\">" +
      "<label>Veränderung</label>" +
      "<div class=\"btn-group btn-group-toggle\" data-toggle=\"buttons\">" +
      "<label class=\"btn btn_option btn-info active no-margin-bottom\">" +
      "<input type=\"radio\" name=\"options\" id=\"" + this.name + "_auto_change\" autoComplete=\"off\" checked>automatisch</label>" +
      "<label class=\"btn btn_option btn-info no-margin-bottom\">" +
      "<input type=\"radio\" name=\"options\" id=\"" + this.name + "_click_change\" autoComplete=\"off\">Auf Klick</label>" +
      "</div><i class=\"material-icons right-middle\" data-toggle='tooltip' data-placement=\"top\"data-html=\"true\" title=\"<b>automatisch</b> = Das Diagramm ändert sich, automatisch sobald die Maus über die Kreise bewegt wird.<br><b>Auf Klick</b> = Das Diagramm ändert sich nur bei Klick auf einen der Kreise.\"style=\"margin-top: 0px;\">info</i>" +
      "</div>" +
      "</div>"
    );

    $("#timeslider"+ this.legendId).append(
      '<div id="' + this.name + '_timeslider" class="timeslider ' + this.name + '" style="display: none">' +
      ' <i id="' + this.name + '_timeslide-play" class="material-icons timeslide-control">play_arrow</i>' +
      '<i id="' + this.name + '_timeslide-pause" class="material-icons timeslide-control" style="display: none">pause</i>' +
      '<div class="grow">' +
      '<div class="labels">' +
      '<label id="' + this.name + '_timeslide-min" class="timeslide-min">1962</label>' +
      '<label id="' + this.name + '_timeslide-max" class="timeslide-max">2010</label>' +
      '</div>' +
      '<input id="' + this.name + '_slider" class="slider" type="range" min="0" max="100" step="1" value="0"/>' +
      '</div>' +
      '<i id="' + this.name + '_download_gif" class="material-icons timeslide-control" style="display: none">gif</i>' +
      '<div id="' + this.name + '_download_gif_spinner" class="download_gif_spinner" style="display: none"></div>' +
      '</div>'
    );

    $("#data-info"+ this.legendId).append('<div id="' + this.name + '_data-info" className="row">\n' +
      '      <p className="col-md-12">Bewege die Maus über die Kreise</p>\n' +
      '    </div>')


    this.legendAddListener(this.getActivInstance())

  }

  legendActivate() {

    //console.log(allInstances)
    if(!duoLegend){
    allInstances.forEach(function(map) {
      map.legende.mapLegendeHide()
    });}

try{
  $("#" + this.name + "_legend-heading").html(this.feature_dataset.title);
  $("#" + this.name + "_year").html(this.year);
  $("#" + this.name + "_legend-bar").css("background-image", `linear-gradient(to right, ${this.lowColor}, ${this.highColor})`);
}catch(error){}


    allInstances[this.getActivInstance()].legende.mapLegendeShow();
  }

  getActivInstance() {
    let id;

    if (allInstances[0].container === this.name) {
      id = 0
    } else {
      id = 1
    }
    return id
  }

  legendAddListener(id) {
    console.log('legendAddListener')

    $('[data-toggle="tooltip"]').tooltip()


    document.getElementById(this.name + '_border_year').addEventListener('click', () => {
      const year = parseInt($("#" + this.name + "_year").text(), 10);
      allInstances[id].alldata = {
        data: false,
        enabled: false
      };
      allInstances[id].updateData(year);
    });

    document.getElementById(this.name + '_border_data').addEventListener('click', () => {
      console.log(this.name + '_border_data')
      const year = parseInt($("#" + this.name + "_year").text(), 10);
      allInstances[id].alldata = {
        data: false,
        enabled: true
      };
      allInstances[id].updateData(year);
    });


    document.getElementById(this.name + '_timeslide-play').addEventListener('click', () => {
      $('#' + this.name + '_timeslide-play').hide();
      $('#' + this.name + '_timeslide-pause').show();

      const indices = allInstances[id]._getYearsOfDataset();

      myGIFExporter = new GIFExporter(allInstances[id]);

      let i = 0;
      this.sliderLoop = setInterval(() => {
        // If the autoPlay was paused..
        if (this.slider_currentValue !== indices[i] && this.slider_isPaused) {
          i = indices.indexOf(this.slider_currentValue);
          this.slider_isPaused = false;
        }

        $('#' + this.name + '_slider').val(`${indices[i]}`);
        this.slider_currentValue = $('#' + this.name + '_slider').val();
        allInstances[id].updateData(indices[i]);

        myGIFExporter.addFrame();

        $('#' + this.name + '_download_gif').show();

        // Reset when iterating finished
        if (i === indices.length - 1) {
          clearInterval(this.sliderLoop);
          $('#' + this.name + '_timeslide-pause').hide();
          $('#' + this.name + '_timeslide-play').show();
          $('#' + this.name + '_slider').val(`${indices[0]}`);
          allInstances[id].updateData(indices[0]);
        }
        i++;
      }, 500);
    });

    document.getElementById(this.name + '_timeslide-pause').addEventListener('click', () => {
      $('#' + this.name + '_timeslide-pause').hide();
      $('#' + this.name + '_timeslide-play').show();
      this.slider_isPaused = true;
      clearInterval(this.sliderLoop);
    });

    document.getElementById(this.name + '_download_gif').addEventListener('click', () => {
      myGIFExporter.downloadGIF(() => {
        myGIFExporter = undefined; // "destroy" object
      });
    });

    document.getElementById(this.name + '_slider').addEventListener('input', e => {
      const year = parseInt(e.target.value, 10);
      this.slider_currentValue = `${year}`;
      allInstances[id].updateData(year);
    });


  }


  legendForDualSplitView(point, param2) {
    //console.log(allInstances)
    try {
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
        "string"
      ) {
        unit1 = "";
      } else {
        unit1 = primary_map.feature_dataset.unit;
      }
      if (
        typeof secondary_map_data[0].properties[secondary_map.feature_dataset.title] ===
        "string"
      ) {
        unit2 = "";
      } else {
        unit2 = secondary_map.feature_dataset.unit;
      }


      let myString =
        `<h4 class="col-md-12"><strong>${
          primary_map_data[0].properties.Gemeindename
        }</strong></h4>` +
        `<p class="col-md-6">links : <strong><em>${
          primary_map_data[0].properties[primary_map.feature_dataset.title]

        }</strong> ${unit1}</em></p>` +
        `<p class="col-md-6">rechts : <strong><em>${
          secondary_map_data[0].properties[secondary_map.feature_dataset.title]

        }</strong> ${unit2}</em></p>`;

      document.getElementById("pd").innerHTML = myString;
    } catch (error) {
      console.log(error);
    }

  }

  legendForStandardView(point, param2) {
    //console.log(this)
    //console.log(allInstances)
    try {
      //$('#legend-heading').html(primary_map.feature_dataset.title)

      const primary_map_data = primary_map.map.queryRenderedFeatures(
        point,
        param2
      );

      let unit;
      if (
        typeof primary_map_data[0].properties[primary_map.feature_dataset.title] ===
        "string"
      ) {
        unit = "";
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

      //document.getElementById("pd").innerHTML = myString;
      $("#" + this.name + "_data-info").html(myString);
    } catch (error) {

    }
  }




  changeLegendScaleBar(data) {
    console.log("changeLegendScaleBar");
    $("#" + this.name + "_legend-min").html(Statistics.getMin(data));
    $("#" + this.name + "_legend-max").html(Statistics.getMax(data));
  }

  legendeShow() {
    $("#" + this.name + "_legend-bar").show();
    $("#" + this.name + "_legend-min").show();
    $("#" + this.name + "_legend-max").show();
  }

  legendeHide() {
    $("#" + this.name + "_legend-bar").hide();
    $("#" + this.name + "_legend-min").hide();
    $("#" + this.name + "_legend-max").hide();
  }

  legendDiscreteShow() {
    $("#" + this.name + "_discrete-legend").show();
  }

  legendDiscreteHide() {
    $("#" + this.name + "_discrete-legend").hide();
  }

  mapLegendeShow() {
    $("." + this.name).show();
    if (!allInstances[this.getActivInstance()].statistics_state.enabled) {
      this.legendDiscreteHide()
    }
  }

  mapLegendeHide() {
    $("." + this.name).hide();
  }

  fillTimeslider() {
    let id = this.getActivInstance()
    $("#" + this.name + "_timeslide-min").html(allInstances[id]._getFirstYearOfDataset());
    $("#" + this.name + "_timeslide-max").html(allInstances[id]._getLastYearOfDataset());
    $("#" + this.name + "_slider").attr('min', allInstances[id]._getFirstYearOfDataset()).attr('max', allInstances[id]._getLastYearOfDataset());
  }
}
export default Legend;
