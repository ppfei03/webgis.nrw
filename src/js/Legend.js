import { primary_map, secondary_map, duoLegend, splitView,dualView } from "./App";
import { allInstances } from "./Map";
import Statistics from "./Statistics";
import GIFExporter from "./GIFExporter";

let myGIFExporter = undefined;

class Legend {
  feature_dataset;
  year;
  lowColor;
  highColor;
  legendId="";


  constructor(name) {

    this.name = name;

    $("#legend-heading" + this.legendId).append("<h3 id='" + this.name + "_legend-heading' class='legend-title editable " + this.name + "'></h3>");

    //$("#year" + this.legendId).append("<h5 id='" + this.name + "_year' class='" + this.name + "'></h5>");

    $("#legend-scale-bar" + this.legendId).append(
      "<div id='" + this.name + "_legend' class='" + this.name + "'>" +
      "<div class='legend-bar'id='" + this.name + "_legend-bar'></div>" +
      "<div class='labels'>" +
      "<div class='label legend-min' id='" + this.name + "_legend-min'>0</div>" +
      "<div class='label legend-max' id='" + this.name + "_legend-max'>100</div>" +
      "</div>" +
      "</div>");

    $("#legend-scale-bar" + this.legendId).append(
      "<div id='" + this.name + "_discrete-legend' class='discrete-legend " + this.name + "' style=\"display: none;\">" +
      "<ul id='" + this.name + "_legend-labels' class=\"legend-labels\">" +
      "<li><span style=\"background:#F1EEF6;\"></span><br/>0 - 20%</li>" +
      "<li><span style=\"background:#BDC9E1;\"></span><br/>40%</li>" +
      "<li><span style=\"background:#74A9CF;\"></span><br/>60%</li>" +
      "<li><span style=\"background:#2B8CBE;\"></span><br/>80%</li>" +
      "<li><span style=\"background:#045A8D;\"></span><br/>100%</li>" +
      "</ul>" +
      "</div>");

    $("#map_data_option" + this.legendId).append(
      "<div class='" + this.name + "' id=\"" + this.name + "_map_data_option\">" +
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
      "</div> <h5>Transparenz</h5>" +
      "<input id='" + this.name + "_transparency-slider' class='transparency-slider' type='range' min='0' max='100' step='1'/>" +
      "</div>"
    );

    $("#timeslider" + this.legendId).append(
      "<div id=\"" + this.name + "_timeslider\" class=\"timeslider " + this.name + "\" style=\"display: none\">" +
      " <i id=\"" + this.name + "_timeslide-play\" class=\"material-icons timeslide-control\">play_arrow</i>" +
      "<i id=\"" + this.name + "_timeslide-pause\" class=\"material-icons timeslide-control\" style=\"display: none\">pause</i>" +
      "<div class=\"grow\">" +
      "<div class=\"labels\">" +
      "<label id=\"" + this.name + "_timeslide-min\" class=\"timeslide-min\">1962</label>" +
      "<label id=\"" + this.name + "_timeslide-center\" class=\"timeslide-center\"></label>" +
      "<label id=\"" + this.name + "_timeslide-max\" class=\"timeslide-max\">2010</label>" +
      "</div>" +
      "<input id=\"" + this.name + "_slider\" class=\"slider\" type=\"range\" min=\"0\" max=\"100\" step=\"1\" value=\"0\"/>" +
      "</div>" +
      "<i id=\"" + this.name + "_download_gif\" class=\"material-icons timeslide-control\" style=\"display: none\">gif</i>" +
      "<div id=\"" + this.name + "_download_gif_spinner\" class=\"download_gif_spinner\" style=\"display: none\"></div>" +
      "</div>"
    );
    let pieName = allInstances[this.getActivInstance()].pieName

    $("#legend-pie-chart" + this.legendId).append(
      "<div id=\"" + pieName + "_pieChart\" class=\"pieChart " + pieName + "\" style=\"display: none\">" +

      "</div>"
    );

    $("#data-info" + this.legendId).append("<div id=\"" + this.name + "_data-info\" class=\"row data-info " + this.name + "\" >\n" +
      "      <p className=\"col-md-12\">Bewege die Maus über die Kreise</p>\n" +
      "    </div>");


    this.legendAddListener(this.getActivInstance());

  }

  legendActivate() {
//console.log('legendActivate')
    if(allInstances[this.getActivInstance()].feature_dataset === undefined){
      this.mapLegendeHide();
      if (!duoLegend) {
      $(".data-info").hide()}
      $("#" + this.name + "_data-info").show()
    }else{
      if (!duoLegend) {
        allInstances.forEach(function(map) {
          map.legende.mapLegendeHide();
        });
      }
      allInstances[this.getActivInstance()].legende.mapLegendeShow();
    }

    try {
      $("#" + this.name + "_legend-bar").css("background-image", `linear-gradient(to right, ${this.lowColor}, ${this.highColor})`);
    } catch (error) {}

  }

  /**
   * get the Parent INstance from the Legend
   * @returns {*}
   */
  getActivInstance() {
    let id;

    if (allInstances[0].legendName === this.name) {
      id = 0;
    } else {
      id = 1;
    }
    return id;
  }

  /**
   * set EventListener to the new LegendElements
   * @param id is the ID from the current Map
   */
  legendAddListener(id) {
    //console.log("legendAddListener");

    $("[data-toggle=\"tooltip\"]").tooltip();


    document.getElementById(this.name + "_border_year").addEventListener("click", () => {
      allInstances[id].alldata = {
        data: false,
        enabled: false
      };
      allInstances[id].updateData(this.year);
    });

    document.getElementById(this.name + "_border_data").addEventListener("click", () => {
      ////console.log(this.name + "_border_data");
      allInstances[id].alldata = {
        data: false,
        enabled: true
      };
      allInstances[id].updateData(this.year);
    });

    document.getElementById(this.name + "_timeslide-play").addEventListener("click", () => {
      //console.log('timeslide-play')
      $("#" + this.name + "_timeslide-play").hide();
      $("#" + this.name + "_timeslide-pause").show();

      const indices = allInstances[id]._getYearsOfDataset();

      myGIFExporter = new GIFExporter(allInstances[id]);

      let i = 0;
      this.sliderLoop = setInterval(() => {
        // If the autoPlay was paused..
        if (this.slider_currentValue !== indices[i] && this.slider_isPaused) {
          i = indices.indexOf(this.slider_currentValue);
          this.slider_isPaused = false;
        }

        $("#" + this.name + "_slider").val(`${indices[i]}`);
        this.slider_currentValue = $("#" + this.name + "_slider").val();
        allInstances[id].updateData(indices[i]);

        myGIFExporter.addFrame();

        $("#" + this.name + "_download_gif").show();

        // Reset when iterating finished
        if (i === indices.length - 1) {
          clearInterval(this.sliderLoop);
          $("#" + this.name + "_timeslide-pause").hide();
          $("#" + this.name + "_timeslide-play").show();
          $("#" + this.name + "_slider").val(`${indices[0]}`);
          allInstances[id].updateData(indices[0]);
        }
        i++;
      }, 500);
    });

    document.getElementById(this.name + "_timeslide-pause").addEventListener("click", () => {
      $("#" + this.name + "_timeslide-pause").hide();
      $("#" + this.name + "_timeslide-play").show();
      this.slider_isPaused = true;
      clearInterval(this.sliderLoop);
    });

    document.getElementById(this.name + "_download_gif").addEventListener("click", () => {
      myGIFExporter.downloadGIF(() => {
        myGIFExporter = undefined; // "destroy" object
      });
    });

    document.getElementById(this.name + "_slider").addEventListener("input", e => {
      this.year = parseInt(e.target.value, 10);
      this.slider_currentValue = `${this.year}`;
      $("#" + this.name + "_timeslide-center").html(this.year);
      allInstances[id].updateData(this.year);
      //this.singleLegend(this.point,this.param2)
    });

    document
      .getElementById(this.name + "_transparency-slider")
      .addEventListener('input', e => {
        allInstances[id].changeTransparency(e.target.value);
      });


    try{
      $('#legend_collapse').on('click', () => {
        $('#legend_collapse').toggleClass('rotate');
      });
      $('#more_collapse').on('click', () => {
        $('.arrowToggle').toggleClass('rotate');
      });
    $('#legend_collapse_center').on('click', () => {
      $('#legend_collapse_center').toggleClass('rotate');
    });
    $('#more_collapse_center').on('click', () => {
      $('.more_collapse_center').toggleClass('rotate');
    });
}catch(error){
      console.log(error)
    }

  }

  singleLegend(point, param2) {

    try {
      this.point = point;
      this.param2 = param2;
      let myDataString;

      if (!duoLegend && ( allInstances.length > 1)) {
        let map_data="";
        let map_data2="";
        //console.log('allInstances[0].map.layers')
        //console.log(allInstances[0].map.layers)
        try{
        map_data = allInstances[0].map.queryRenderedFeatures(
          point,
          allInstances[0].legende.param2
        );
        map_data2 = allInstances[1].map.queryRenderedFeatures(
          point,
          allInstances[1].legende.param2
        );
        }catch(error){
          }
        myDataString = this.generateMapInformationStringFromData([map_data, map_data2], "col-md-6");
      } else {
        let map_data = allInstances[this.getActivInstance()].map.queryRenderedFeatures(
          this.point,
          this.param2
        );
        myDataString = this.generateMapInformationStringFromData([map_data], "col-md-12");
      }

      let myString =
        `<div class="container"><h2 class="col-md-12" style="height: 76px" align="center"><strong>${
          myDataString[0]
        }</strong></h2>` + myDataString[1] +
        `</div>`;

      $("#" + this.name + "_timeslide-center").html('');

      $("#" + this.name + "_data-info").html(myString);

    } catch (error) {
//console.log(error)
    }
  }


  /**
   *
   * @param mapDataArray Is a Array, include the data from one or two maps
   * @param colFormat defined the collumn range of the html result e.g. col-md-6
   * @returns {[*, *]} Array with a String include dataInformation in HTML and the "gemeindeName" from current "selection"
   */
  generateMapInformationStringFromData(mapDataArray, colFormat) {
    let string = [];
    let stringFinal;
    let id;

    for (let i = 0; i<mapDataArray.length; i++) {
      try{
      let map_data = mapDataArray[i], unit, s,data;//
      if(duoLegend){
        id=this.getActivInstance();
      }else{
        id=i;
      }

      if (
        typeof map_data[0].properties[allInstances[id].getTitle()] ===
        "string"
      ) {
        unit = "";
      } else {
        unit = allInstances[id].legende.feature_dataset.unit;
      }
      let yearData=allInstances[id].legende.year;
      if (map_data[0].properties[allInstances[id].getTitle()] === "null") {
        data = "Keine Daten verfügbar";
      } else {
        data = map_data[0].properties[allInstances[id].getTitle()];
      }

      string.push(`<div class=${colFormat}><p ><strong><em>${allInstances[id].getTitle()}</strong></em></p></div>`);
      string.push(`<div class=${colFormat}><h4><strong><em>${data}</strong> ${unit}</em></h4></div>`);
      string.push(`<div class=${colFormat}><h5><em id="`+this.name +`_year">${yearData}</em></h5></div>`);
    }catch(error){
        //console.log('generateMapInformationStringFromData :: ' + error)
        string.push(`<div class=${colFormat}><p >Kein Thema vorhanden</p></div>`);
        string.push(`<div class=${colFormat}></div>`);
        string.push(`<div class=${colFormat}></div>`);
      }
    }

    if (string.length>3) {
      stringFinal = '<div class="row">'+string[0] + string[3] +'</div><div class="row">'+ string[1] + string[4]+'</div><div class="row">'+ string[2] + string[5]+'</div>';
    } else if(string.length>1) {
      stringFinal = '<div class="row">'+string[0] + '</div><div class="row">'+ string[1] +'</div><div class="row">'+ string[2] + '</div>';
    }else{
      stringFinal='<div class="row">'+string[0] + '</div>'
    }

    return [mapDataArray[0][0].properties.Gemeindename, stringFinal];
  }

  changeLegendScaleBar(data) {
    //console.log("changeLegendScaleBar");
    console.log(data)

    $("#" + this.name + "_legend-min").html(Statistics.getMin(data));
    $("#" + this.name + "_legend-max").html(Statistics.getMax(data));
  }

  legendeShow() {
    //console.log("legendeShow");

    $("#" + this.name + "_legend-bar").show();
    $("#" + this.name + "_legend-min").show();
    $("#" + this.name + "_legend-max").show();
  }

  legendeHide() {
    //console.log("legendeHide");

    $("#" + this.name + "_legend-bar").hide();
    $("#" + this.name + "_legend-min").hide();
    $("#" + this.name + "_legend-max").hide();
  }

  legendDiscreteShow() {
    //console.log("legendDiscreteShow");

    $("#" + this.name + "_discrete-legend").show();
  }

  legendDiscreteHide() {
    //console.log("legendDiscreteHide");

    $("#" + this.name + "_discrete-legend").hide();
  }

  mapLegendeShow() {
    //console.log("mapLegendeShow");

    $("." + this.name).show();
    $("#" + this.name+"_border_option").show();
    $("." + allInstances[this.getActivInstance()].pieName).show();
    if(allInstances[this.getActivInstance()].pieEnable){
      $("#" + this.name+"_timeslider").hide();
      $("#" + this.name+"_border_option").hide();
      /*if($("#" + this.name+"_year").text()==="Gewinner"){
        $("#" + this.name+"_legend").hide();
      }*/
    }
    if (!allInstances[this.getActivInstance()].statistics_state.enabled) {
      this.legendDiscreteHide();
    }
  }

  mapLegendeHide() {
    //console.log("mapLegendeShow");

    $("." + this.name).hide();
    $("." + allInstances[this.getActivInstance()].pieName).hide();
  }

  mapLegendeInfoDataClear() {
    //console.log("mapLegendeShow");

    $("#" + this.name+"_data-info").filter(function( index ) {
      return $( ".row", this ).remove()
    });
  }



  fillTimeslider() {
    //console.log("fillTimeslider");

    let id = this.getActivInstance();
    $("#" + this.name + "_timeslide-min").html(allInstances[id]._getFirstYearOfDataset());
    $("#" + this.name + "_timeslide-max").html(allInstances[id]._getLastYearOfDataset());
    $("#" + this.name + "_slider").attr("min", allInstances[id]._getFirstYearOfDataset()).attr("max", allInstances[id]._getLastYearOfDataset());
  }
}

export default Legend;
