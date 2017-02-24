var width = 600,
    height = 600,
    centered;


var arrays = loadCrimes(svg);
var arraysLand = loadLandPermits(svg);
var array2 = loadPermits(svg);
var culture = loadCulture(svg);

var projection = d3.geo.albers()
    .center([0, 47.6097])
    .rotate([122.3331, 0])
    .parallels([50, 60])
    .scale(950 * 5 * 30)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select(".chart").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

var start = 2010;
var end = 2016;


d3.select('#slider-range').call(d3.slider().scale(d3.time.scale()
    .domain([new Date(2009,1,1), new Date(2016,1,1)]))
    .axis( d3.svg.axis() ).snap(true).value([new Date(2010,1,1),new Date(2016,1,1)])
    .on("slide", function(evt, value) {
      start = new Date(value[0]).getFullYear();
      end = new Date(value[1]).getFullYear();
      document.getElementById("year").innerHTML = "Year: " + start;
      gradientsCrime(start, arrays);

    }));

var rateById = d3.map();

var quantize = d3.scale.quantize()
    .domain([0, .15])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var tooltip = d3.select('.chart').append('div')
    .attr('class', 'hidden tooltip');

//load the map
d3.json("Neighborhoods.json", function(error, neigh) {
  if (error) {
  	return console.error(error);
  }
  console.log(neigh);
  g.append("g")
    .selectAll(".collection")
      .data(topojson.feature(neigh, neigh.objects.collection).features)
    .enter().append("path")
      .attr("class", function(d) {
        if(d.properties.S_HOOD){
          return "collection " + d.properties.S_HOOD.replace(/\s/g, '');
        } else {
          return "collection " + "none";
        }
         
      })
      .attr("d", path)
      .on("click", clicked)
      .on("mousemove", function(d) {
        if(d.properties.S_HOOD == "OOO") {
          return;
        }

        
        var mouse = d3.mouse(svg.node()).map(function(d) {
          return parseInt(d);
        });
        tooltip.classed('hidden', false)
          .attr('style', 'left:' + (mouse[0] + 750) + 'px; top:' + (mouse[1] + 40) + 'px')
          .html(d.properties.S_HOOD);
      }).on("mouseout", function(d) {
        // d3.select(this.parentNode.appendChild(this)).transition().duration(100)
        // .style({'stroke-opacity':.8,'stroke':'#777'});

        tooltip.classed('hidden', true); 
      });

    gradientsCrime(2010,crimes);

});




function crimeGraph(neighborhood) {
  crimes = {};
  crimeforArea = [];
  for(i = 0; i < arrays.length;i++) {
    if(arrays[i].Neighborhood == neighborhood.replace(/\s+/g, '')) {
      if(crimes[arrays[i].Year] == null) {
        crimes[arrays[i].Year] = 1;  
      }
      else {
        crimes[arrays[i].Year] = crimes[arrays[i].Year] + 1;    
      }  
    }     
  }
  console.log(crimes);
  return crimes;    
}

function permitGraph(neighborhood) {
  permits = {};
  permitsforArea = [];
  for(i = 0; i < array2.length;i++) {
    if(array2[i].Neighborhood == neighborhood.replace(/\s+/g, '')) {
      if(permits[array2[i].Year] == null) {
        permits[array2[i].Year] = 1;  
      }
      else {
        permits[array2[i].Year] = permits[array2[i].Year] + 1;    
      }  
    }     
  }
  return permits;    
}

function lpermitGraph(neighborhood) {
  lpermits = {};
  lpermitsforArea = [];
  for(i = 0; i < arraysLand.length;i++) {
    if(arraysLand[i].NeighborhoodCalculated == neighborhood.replace(/\s+/g, '')) {
      if(lpermits[arraysLand[i].ApplicationDate] == null) {
        lpermits[arraysLand[i].ApplicationDate] = 1;  
      }
      else {
        lpermits[arraysLand[i].ApplicationDate] = lpermits[arraysLand[i].ApplicationDate] + 1;    
      }  
    }     
  }
  return lpermits;    
}

function cultureGraph(neighborhood) {
  cults = {};
  cultpermitsforArea = [];
  for(i = 0; i < culture.length;i++) {
    if(culture[i].Neighborhood == neighborhood.replace(/\s+/g, '')) {
      if(cults[culture[i].Year] == null) {
        cults[culture[i].Year] = 1;  
      }
      else {
        cults[culture[i].Year] = cults[culture[i].Year] + 1;    
      }  
    }     
  }
  return cults;    
}

function loadCrimes() {
	crimes = [];
  console.log("loadcrimes");
    d3.csv("crimes2.csv", function(data) {
        data.forEach(function(d) {
            var str = d["Neighborhood"].replace(/\s+/g, '');
            crimes.push({ "Crime": d["Crime"], "Latitude": d["Latitude"], "Longitude": d["Longitude"], "Year" : d["Year"], "Neighborhood" : str});
        });  

        //gradientsCrime(2015,crimes)
    });
    return crimes;
}

function loadPermits() {
  permits = [];
    d3.csv("permits.csv", function(data) {
        data.forEach(function(d) {
            var str = d["Neighborhood"].replace(/\s+/g, '');
            var date = "20"+d["Issue Date"].substring(d["Issue Date"].length-2, d["Issue Date"].length)
            permits.push({ "Permit Type": d["Permit Type"], "Value": d["Value"], "Year": date, 
              "Status": d["Status"], "Latitude": d["Latitude"], "Longitude": d["Longitude"], "Neighborhood" : str});
        });
        // gradientsPermits(2013,permits)
    });
    return permits;
}

function gradientsCrime(num, array) {
  neighborhoods = [];
  for(i = 0; i < array.length;i++) {
    if(parseInt(arrays[i].Year) == num)  
      if(neighborhoods[arrays[i].Neighborhood] == undefined) {
        neighborhoods[arrays[i].Neighborhood] = 1;
      }
      else {
        neighborhoods[arrays[i].Neighborhood] = neighborhoods[arrays[i].Neighborhood] + 1;
      }
  }
  for(var key in neighborhoods) {
    if(neighborhoods[key] < 5) {
      try {
        d3.select("."+key).transition().duration(1000).duration(500).style("fill","rgb(200, 200, 255)");
      }
      catch(err) {
        console.log(err)
      }
    }
    else if(neighborhoods[key] >= 5 && neighborhoods[key] < 10) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(150, 150, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(neighborhoods[key] >= 10 && neighborhoods[key] < 20) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(100, 100, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }  
    else if(neighborhoods[key] >= 20 && neighborhoods[key] < 30) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(50, 50, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(neighborhoods[key] >= 30) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(0, 0, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }   
  }
}

function gradientsPermits(num, array) {
  permits = [];
  for(i = 0; i < array.length;i++) {
    if(array2[i] != undefined) {
      if(parseInt(array2[i].Year) == num) {  
        if(permits[array2[i].Neighborhood] == undefined) {
          permits[array2[i].Neighborhood] = 1;
        }
        else {
          permits[array2[i].Neighborhood] = permits[array2[i].Neighborhood] + 1;
        }
      }
    }
  }
  for(var key in permits) {
    if(permits[key] < 5) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(200, 200, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(permits[key] >= 5 && permits[key] < 10) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(150, 150, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(permits[key] >= 10 && permits[key] < 20) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(100, 100, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }  
    else if(permits[key] >= 20 && permits[key] < 30) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(50, 50, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(permits[key] >= 30) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(0, 0, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }   
  }
}

function loadLandPermits(svg) {
  lpermits = [];
    d3.tsv("data/Land_Use_Permits.txt", function(data) {
        data.forEach(function(d) {
            lpermits.push({  "NeighborhoodCalculated": d["Neighborhood Calculated"].replace(/\s+/g, ''), 
                "ApplicationDate" : "20"+d["Application Date"].substring(d["Application Date"].length-2)});
        });
    });
        //gradientsLandPermits(2015,lpermits);
    return lpermits;
}

function gradientsLandPermits(num, array) {
  land = [];
  console.log(arraysLand.length);
  for(i = 0; i < arraysLand.length;i++) {
    console.log("land");
    if(parseInt(arraysLand[i].ApplicationDate) == num)  
      if(land[arraysLand[i].NeighborhoodCalculated] == undefined) {
        land[arraysLand[i].NeighborhoodCalculated] = 1;
      }
      else {
        land[arraysLand[i].NeighborhoodCalculated] = land[arraysLand[i].NeighborhoodCalculated] + 1;
      }
  }
  for(var key in land) {
    if(land[key] < 5) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(200, 200, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(land[key] >= 5 && land[key] < 10) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(150, 150, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(land[key] >= 10 && land[key] < 20) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(100, 100, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }  
    else if(land[key] >= 20 && land[key] < 30) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(50, 50, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(land[key] >= 30) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(0, 0, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }   
  }
}

function loadCulture(svg) {
  cpermits = [];
    d3.tsv("data/Seattle_Cultural_Space_Inventory-3.txt", function(data) {
        data.forEach(function(d) {
            cpermits.push({ "Name": d["Name"], "Constiuents": d["Constiuents"], "Location": d["Location"], "Neighborhood": d["Neighborhood"].replace(/\s+/g, ''),  "Year": d["Year Occupied"],
              "Own or Rent": d["Own or Rent"], "Parking Spaces": d["Parking Spaces"], "Square Feet": d["Square Feet"], "Type" : d["Type"]});
        });
    });
    //gradientsCulture(2015,lpermits);
    return cpermits;
}
function gradientsCulture(num, array) {
  cult = [];
  console.log("Start");
  for(i = 0; i < culture.length;i++) {

    if(parseInt(culture[i].Year) == num){  
      if(cult[culture[i].Neighborhood] == undefined) {
        cult[culture[i].Neighborhood] = 1;
      }
      else {
        cult[culture[i].Neighborhood] = culture[arrays[i].Neighborhood] + 1;
      }
    } else {
      //not this year
    }
  }
  for(var key in cult) {
    console.log(cult[key]);
    if(cult[key] < 1) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(200, 200, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(cult[key] >= 1 && cult[key] < 2) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(150, 150, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(cult[key] >= 2 && cult[key] < 3) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(100, 100, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }  
    else if(cult[key] >= 3 && cult[key] < 4) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(50, 50, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(cult[key] >= 4) {
      try {
        d3.select("."+key).transition().duration(1000).style("fill","rgb(0, 0, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }   
  }
}

function graph(dataTemp, ylabel, xlabel, gclass){
d3.select(gclass).selectAll("*").remove();
 // console.log(data);
  //console.log(data[2012]);

  //var data = [dataTemp[2010], dataTemp[2011], dataTemp[2012], dataTemp[2013], dataTemp[2014],, dataTemp[2015]];

var margin = {top: 20, right: 30, bottom: 60, left: 60},
    width = 360 - margin.left - margin.right,
    height = 220 - margin.top - margin.bottom,
    padding = 20;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var chart = d3.select(gclass)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var data = [
  {name: "2010",    value:  dataTemp[2010]},
  {name: "2011",    value:  dataTemp[2011]},
  {name: "2012",     value: dataTemp[2012]},
  {name: "2013",   value: dataTemp[2013]},
  {name: "2014", value: dataTemp[2014]},
  {name: "2015",     value: dataTemp[2015]}
];
  x.domain(data.map(function(d) { return d.name; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  chart.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr({height: 0, class: 'bar'}).transition().duration(500)
      .attr("class", "bar").transition()
      .attr("x", function(d) { return x(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .attr("width", x.rangeBand());

  chart.append("text")
            .attr("text-anchor", "middle") 
            .attr("transform", "translate("+ (padding + 100) +","+(height - 152 )+")")  
            .text(ylabel);

  chart.append("text")
      .attr("text-anchor", "middle")  
      .attr("transform", "translate("+ (width/2) +","+(height + 30)+")")  
      .text(xlabel);
}



function clicked(d) {

  d3.selectAll(".collection").style({'stroke-opacity':.8,'stroke':'#777'});


  d3.select(this.parentNode.appendChild(this)).transition().duration(100)
        .style({'stroke-opacity':3,'stroke':'black'});

  var array1 = crimeGraph(d.properties["S_HOOD"]);
  graph(array1, "Relative Number of Crimes", "Year", ".chart2");
  var array2 = permitGraph(d.properties["S_HOOD"]);
  graph(array2, "Building Permits", "Year", ".chart3");
  var array3 = lpermitGraph(d.properties["S_HOOD"]);
  graph(array3, "Land Use Permits", "Year", ".chart4");
  var array4 = cultureGraph(d.properties["S_HOOD"]);
  graph(array4, "Cultural Insititions Moved Into Buildings", "Year", ".chart5");


  document.getElementById("areaName").innerHTML = "Area: " + d.properties.S_HOOD;
}

var playing = false; 

function play() {
  if(playing == true) {
    return;
  }
  playing = true;
  var index = start;
  var timer = setInterval(function() {
    document.getElementById("year").innerHTML = "Year: " + index;
    gradientsCrime(index, arrays);
    index++;
    if(index > end + 1) {
      gradientsCrime(start, arrays);
      document.getElementById("year").innerHTML = "Year: " + start;
      playing = false;
      clearInterval(timer);
    }
  } , 1300)

}

function crimeClick() {
  gradientsCrime(start, arrays);
}

function permitsClick() {
  gradientsPermits(start, arrays);
}

function landClick() {
  gradientsLandPermits(start, arrays);
}

function cultureClick() {
  gradientsCulture(start, arrays);
}


//http://bl.ocks.org/darrenjaworski/5397362
      var w = 140, h = 400;
      //append elsewhere to make it fit well
      var legend = g.append("defs").append("svg:linearGradient").attr("id", "gradient").attr("x1", "100%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%").attr("spreadMethod", "pad");

      legend.append("stop").attr("offset", "0%").attr("stop-color", "#0000ff").attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "100%").attr("stop-color", "#ffeeaa").attr("stop-opacity", 1);

      g.append("rect").attr("width", w - 100).attr("height", h - 100).style("fill", "url(#gradient)").attr("transform", "translate(0,10)");

      var y = d3.scale.linear().range([300, 0]).domain([1, 30]);

      var yAxis = d3.svg.axis().scale(y).orient("right");

      g.append("g").attr("class", "y axis").attr("transform", "translate(41,10)").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 30).attr("dy", ".71em").style("text-anchor", "end").text("Number of Occurrences");
      
