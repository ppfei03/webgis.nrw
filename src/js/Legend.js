import { primary_map, secondary_map } from "./App";
import { allInstances } from "./Map";
import Statistics from "./Statistics";

class Legend {
  feature_dataset;
  year;
  lowColor;
  highColor;

  constructor(name) {
    this.name = name;

    $("#legend-heading").append("<h3 id='" + this.name + "_legend-heading' class='legend-title editable "+ this.name +"'></h3>");

    $("#year").append("<h5 id='" + this.name + "_year' class='"+ this.name +"'></h5>");

    $("#legend-scale-bar").append(
      "<div id='" + this.name + "_legend' class='"+ this.name +"'>" +
      "<div class='legend-bar'id='" + this.name + "_legend-bar'></div>" +
      "<div class='labels'>" +
      "<div class='label legend-min' id='" + this.name + "_legend-min'>0</div>" +
      "<div class='label legend-max' id='" + this.name + "_legend-max'>100</div>" +
      "</div>" +
      "</div>");
    $("#legend-scale-bar").append(
      "<div id='" + this.name + "_discrete-legend' class='discrete-legend"+ this.name +"' style=\"display: none;\">" +
      "<ul class=\"legend-labels\">" +
      "<li><span style=\"background:#F1EEF6;\"></span><br/>0 - 20%</li>" +
      "<li><span style=\"background:#BDC9E1;\"></span><br/>40%</li>" +
      "<li><span style=\"background:#74A9CF;\"></span><br/>60%</li>" +
      "<li><span style=\"background:#2B8CBE;\"></span><br/>80%</li>" +
      "<li><span style=\"background:#045A8D;\"></span><br/>100%</li>" +
      "</ul>" +
      "</div>");
console.log('hier1')
    $("#map_data_option").append(
      "<div class='"+ this.name +"'>" +
      "<div id=\"" + this.name + "_border_option\" class=\"option-menue\">" +
      "<label>Grenzen anpassen auf </label>" +
      "<div class=\"btn-group btn-group-toggle\" data-toggle=\"buttons\">" +
      "<label class=\"btn btn-info active no-margin-bottom\" id=\"" + this.name + "_border_year2\" >" +
      "<input type=\"radio\" name=\"options\" id=\"" + this.name + "_border_year\" autoComplete=\"off\" checked>Jahr" +
      "</label>" +
      "<label class=\"btn btn-info no-margin-bottom\" id=\"" + this.name + "_border_data2\">" +
      "<input type=\"radio\" name=\"options\" id=\"" + this.name + "_border_data\" autoComplete=\"off\">Daten" +
      "</label>" +
      "</div>" +
      "<i class=\"material-icons classification-info\" data-toggle=\"tooltip\" data-placement=\"top\"" +
      "data-html=\"true\" title=\"\"data-original-title=\"Jahr = Die Grenzen (min/max) werden an die Daten des ausgewählten Jahres angepasst.<br>Daten = Die Grenzen (min/max) werden auf den gesamten Datenraum angepasst.\"style=\"margin-top: 0px;\">info</i>" +
      "</div>" +
      " <div class=\"option-menue\">" +
      "<label>Veränderung</label>" +
      "<div class=\"btn-group btn-group-toggle\" data-toggle=\"buttons\">" +
      "<label class=\"btn btn-info active no-margin-bottom\">" +
      "<input type=\"radio\" name=\"options\" id=\"" + this.name + "_auto_change\" autoComplete=\"off\" checked>automatisch</label>" +
      "<label class=\"btn btn-info no-margin-bottom\">" +
      "<input type=\"radio\" name=\"options\" id=\"" + this.name + "_click_change\" autoComplete=\"off\">Auf Klick</label>" +
      "</div><i class=\"material-icons classification-info\" data-toggle=\"tooltip\" data-placement=\"top\"data-html=\"true\" title=\"\"data-original-title=\"automatisch = Das Diagramm ändert sich, automatisch sobald die Maus über die Kreise bewegt wird.<br>Auf Klick = Das Diagramm ändert sich nur bei Klick auf einen der Kreise.\"style=\"margin-top: 0px;\">info</i>" +
      "</div>"+
      "</div>"
    );
    console.log('hier2');

this.legendAddListener()

  }

  legendActivate() {
    $("#" + this.name + "_legend-heading").html(this.feature_dataset.title);
    $("#" + this.name + "_year").html(this.year);
    $("#" + this.name + "_legend-bar").css("background-image", `linear-gradient(to right, ${this.lowColor}, ${this.highColor})`);
  }

  legendAddListener(){
    let id;

    if(allInstances[0].container === this.name){
      id = 0
    }else if (allInstances[1].container === this.name){
      id = 1
    }else{
      id = 2
    }

    document.getElementById(this.name + '_border_year2').addEventListener('click', () => {
      const year = parseInt($("#" + this.name + "_year").text(), 10);
      $("#" + this.name + "_border_data2").removeClass('active');
      $("#" + this.name + "_border_year2").addClass('active');
      console.log(allInstances)
      allInstances[id].updateData(year);
      $("#" + this.name + "_border_year2").removeClass('active');

    });

    document.getElementById(this.name +'_border_data2').addEventListener('click', () => {
      const year = parseInt($("#" + this.name + "_year").text(), 10);
      $("#" + this.name + "_border_data2").addClass('active');
      allInstances[id].updateData(year);
      $("#" + this.name + "_border_data2").removeClass('active');

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

      document.getElementById("pd").innerHTML = myString;
    } catch (error) {
      console.log(error);

    }
  }

  static test12345(point, param2) {
    try {
      console.log("primary_map");
      console.log(primary_map.feature_dataset.title);
      console.log(primary_map.legende.name);
      const primary_map_data = primary_map.map.queryRenderedFeatures(
        point,
        param2
      );
      console.log("primary_map Title");
      console.log(
        primary_map_data[0].properties[primary_map.feature_dataset.title]
      );
      const secondary_map_data = secondary_map.map.queryRenderedFeatures(
        point,
        param2
      );
      console.log("secondary_map");
      console.log(secondary_map.feature_dataset.title);
      console.log(secondary_map.legende.name);

      console.log("secondary_map Title");
      console.log(
        secondary_map_data[0].properties[secondary_map.feature_dataset.title]
      );
    } catch (error) {
      //console.log(error);
    }
  }


  changeLegendScale(data) {
    console.log("changeLegendScale");
    $("#" + this.name + "_legend-min").html(Statistics.getMin(data));
    $("#" + this.name + "_legend-max").html(Statistics.getMax(data));
  }

  legendeHide() {
    console.log("legendeHide");
    $("#" + this.name + "_legend-bar").hide();
    $("#" + this.name + "_legend-min").hide();
    $("#" + this.name + "_legend-max").hide();
  }

  legendDiscreteHide() {
    $("#" + this.name + "_discrete-legend").hide();
  }

  legendDiscreteShow() {
    $("#" + this.name + "_discrete-legend").show();
  }

  legendeShow() {
    console.log("legendeHide");
    $("#" + this.name + "_legend-bar").show();
    $("#" + this.name + "_legend-min").show();
    $("#" + this.name + "_legend-max").show();

  }
}

export default Legend;
