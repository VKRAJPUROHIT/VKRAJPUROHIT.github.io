// Set up our chart
//=================================
var svgWidth = 900;
var svgHeight = 590;

var margin = {
  top: 20,
  right: 40,
  bottom: 180,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================
var svg = d3
  .select("#scatter")
  .append("div")
  .classed("chart",true)
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


//append an svg group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //initial patameters
  var chosenXAxis = "poverty"
  var chosenYAxis ="healthcare"


  // gridlines in x axis function
function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(5)
}

// gridlines in y axis function
function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(5)
}

  //function used for updating x-scale var upon click on axis label 
  //create two linear scales for the petal's lengths and widths
  //xscale: petal width
  function xScale(data,chosenXAxis){
      //create scales 
      var xLinearScale=d3.scaleLinear()
      //consider the maximum value found in the dataset  
  .domain([d3.min(data,d=>d[chosenXAxis])*0.8, d3.max(data,d=>d[chosenXAxis])*1.2])
  .range([0,width]);
  return xLinearScale;
    }

  //function used for updating x-scale var upon click on axis label   
  //yscale: petal width
  function yScale(data, chosenYAxis){
      //create scales 
      var yLinearScale =  d3.scaleLinear()
      .domain([d3.min(data,d=>d[chosenYAxis])*0.8, d3.max(data,d=>d[chosenYAxis])*1.2])
  .range([height,0]);
  return yLinearScale;
  }


 //function used for updating xaxis var upon click on axis label
 function renderAxesX(newXScale,xAxis){
     var bottomAxis = d3.axisBottom(newXScale);
     xAxis.transition()
     .duration(1000)
     .call(bottomAxis);
     return xAxis;
 }

 //function used for updating yaxis var upon click on axis label
 function renderAxesY(newYScale,yAxis){
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);
    return yAxis;
}

//function used for updating circles group with a transition to new circles 
function renderCircles(circlesGroup,newXScale,chosenXAxis,newYScale,chosenYAxis){
    circlesGroup.transition()
    .duration(1000)
    .attr("cx",d=>newXScale(d[chosenXAxis]))
    .attr("cy",d=>newYScale(d[chosenYAxis]));
    return circlesGroup;
}

//function used to update state names with a transition to new circles
function renderText(textGroup,newXScale,chosenXAxis,newYScale,chosenYAxis){
    textGroup.transition()
    .duration(1000)
    .attr("x",d=>newXScale(d[chosenXAxis]))
    .attr("y",d=>newYScale(d[chosenYAxis]));
    return textGroup;
} 

//function to style x-axis values for tooltips
function styleX(value, chosenXAxis) {

    //stylize based on variable chosen
    //poverty percentage
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    //household income in dollars
    else if (chosenXAxis === 'income') {
        return `$${value}`;
    }
    //age (number)
    else {
        return `${value}`;
    }
}


//function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis,circlesGroup){
    var xLabel;
    if (chosenXAxis==="poverty"){
        var xLabel="In Poverty (%)";
    }
    else if (chosenXAxis==="income"){
        var xLabel="Household Income(Median)";
    }
    else {
        var xLabel="Age (Median)";
    }

    var yLabel;
    if (chosenYAxis === 'healthcare') {
        var yLabel = "Lacks Healthcare (%)"
    }
    else if (chosenYAxis === 'obesity') {
        var yLabel = "Obesity (%)"
    }
    else {
        var yLabel = "Smokes (%)"
    }

    //create tooltip
    var toolTip = d3.tip()
    .attr("class","d3_tip")
    .offset([-8,0])
    .html(function(d){
        return(`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
    });

    circlesGroup.call(toolTip);

    //Mouse events 
    circlesGroup.on("mouseover",toolTip.show)
       .on("mouseout",toolTip.hide);        
    return circlesGroup;
}
  
  
//Get the data 
d3.csv("data.csv").then(function(data) {
    console.log(data); 
    //parse the data 
    data.forEach(function(d){
        d.obesity = +d.obesity;
        d.income = +d.income;
        d.smokes = +d.smokes;
        d.age = +d.age;
        d.healthcare = +d.healthcare;
        d.poverty = +d.poverty; 
    });

  // LinearScale functions above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
  .classed("x-axis",true)
  .attr("transform",`translate(0,${height})`)
  .call(bottomAxis);

  //append y axis
  var yAxis = chartGroup.append("g")
  .classed("y-axis",true)
  .call(leftAxis);

  //append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .classed("stateCircle", true)
  .attr("cx",d=>xLinearScale(d[chosenXAxis]))
  .attr("cy",d=>yLinearScale(d[chosenYAxis]))
  .attr("r",14)  
  .attr("opacity",".8")

  //append initial text
  var textGroup = chartGroup.selectAll(".stateText")
  .data(data)
  .enter()
  .append("text")
  .classed("stateText", true)
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  .attr("dy", 3)
  .attr("font-size", "10px")
  .text(function(d){return d.abbr});

  // Create group for three x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top })`);

    var povertyLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)")

    var incomeLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Household Income (Median)")


         //create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

var healthcareLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x", 0)
    .attr("y", 0 - 20)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "healthcare")
    .text("Lacks Healthcare (%)");

var smokesLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "smokes")
    .text("Smokes (%)");

var obesityLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 0 - 60)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "obesity")
    .text("Obese (%)");

    //updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //x axis labels event listener 
    xLabelsGroup.selectAll("text")
    .on("click",function(){
        //get value of selection
        var value = d3.select(this).attr("value");
        if (value != chosenXAxis){
            //replace chosenXAxis with value
            chosenXAxis = value;
            // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);

        //update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text with new x values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
         if (chosenXAxis==="poverty"){
            povertyLabel.classed("active", true).classed("inactive", false);
            ageLabel.classed("active", false).classed("inactive", true);
            incomeLabel.classed("active", false).classed("inactive", true);
         }
         else if (chosenXAxis==="age"){
            povertyLabel.classed("active", false).classed("inactive", true);
            ageLabel.classed("active", true).classed("inactive", false);
            incomeLabel.classed("active", false).classed("inactive", true);
        }
        else{
            povertyLabel.classed("active", false).classed("inactive", true);
            ageLabel.classed("active", false).classed("inactive", true);
            incomeLabel.classed("active", true).classed("inactive", false);
           }
         }        
    });

       //y axis labels event listener
       yLabelsGroup.selectAll("text")
       .on("click", function(){
           //get value of selection
        var value = d3.select(this).attr("value");
         //check if value is same as current axis
         if (value != chosenYAxis){
             //replace chosenYAxis with value
            chosenYAxis = value;
            //update y scale for new data
            yLinearScale = yScale(data, chosenYAxis);

            //update y axis with transition
            yAxis = renderAxesY(yLinearScale, yAxis);

            //update circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update text with new y values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

            //update tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //change classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel.classed("active", true).classed("inactive", false);
                smokesLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", true).classed("inactive", false);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }
            else {
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", true).classed("inactive", false);
            }
         }
       });
});