function init() {
    //grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");


    //use the list of sample names to populate the select options
    d3.json("samples.json").then((data)=>{
        var sampleNames = data.names;
        sampleNames.forEach((sample)=> {
            selector
            .append("option")
            .text(sample)
            .property("value",sample);
        });


        //use the first sample from the list to build initial plots
        var firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
        
    });
}

//initialize the dashboard 
init();


function optionChanged(newSample){
    //fetch new data each time a new sample is selected 
    buildCharts(newSample);
    buildMetadata(newSample);
    
}

//Demographics panel
function buildMetadata(sample){
    d3.json("samples.json").then((data)=>{
        var metadata = data.metadata;
        //filter the data for object with the desired sample number 
        var resultArray = metadata.filter(sampleObj => sampleObj.id==sample);
        var result = resultArray[0];
        //use d3 to select the panel with id of #sample-metadata
        var PANEL = d3.select("#sample-metadata");
        //use .html("") to clear any existing metadata
        PANEL.html("");
        //use object.entries to add each key and value pair to the panel
        //hint:inside the loop, you will need to use d3 to append new tags for each key-value in the metadata 
        //Object.entries(result).forEach(([key,value])=>{
            //PANEL.append("h6").text("${key.toUpperCase()}:${value}");
            Object.entries(result).forEach((key)=> {
                PANEL.append("h6").text(key[0].toLocaleLowerCase()+":"+key[1]+"\n");
            });
        });  
}

          // 1. Create the buildCharts function.
           function buildCharts(sample) {
             // 2. Use d3.json to load and retrieve the samples.json file 
             d3.json("samples.json").then((data) => {
             // 3. Create a variable that holds the samples array
            var samples = data.samples           
               // 4. Create a variable that filters the samples for the object with the desired sample number
            var resultArray = samples.filter(sampleObj=>sampleObj.id==sample);           
               //  5. Create a variable that holds the first sample in the array.
            var result = resultArray[0];           
               // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
           var sample_values = result.sample_values;
           var labels = result.otu_labels;
           var ids = result.otu_ids  
           //create a variable that holds the metadata array
           var metadata = data.metadata
           //create a variable that filters the metadata for the object with the desired sample number
           var metaDataArray = metadata.filter(metaObj=>metaObj.id==sample);
           //create a variable that holds the first metadata in the array
           var result2 = metaDataArray[0];
           //create a variable that holds the wfreq 
           var wfreq1 = result2.wfreq;       





        //7.create the trace for the bar chart
        var trace1 = {
            x: sample_values.slice(0,10).reverse(),
            y: ids.slice(0,10).reverse().map(d => "OTU " + d),
            text: labels.slice(0,10).reverse(),
            marker: {color: '005a99'},
            type: "bar",
            orientation:"h",      
           };
            // 8.Create the data array for the bar plot
               var barData = [trace1];
           //9.create the layout for the bar chart
           var layout1 = {
            font: {family:"Arial Rounded MT Bold "},
            title: "Top 10 OTU",
           yaxis: { tickmode: "linear", },
           margin: {
             l:100,
             r:50,
             t:100,
             b:30  
           }
           };
           // 10.Plot the chart to a div tag with id "plot"
             Plotly.newPlot("bar", barData, layout1);


             //create bubble chart
             var trace2 =  {
                 x: result.otu_ids,
                 y: result.sample_values,
                 mode: "markers",
                 marker: {
                     color: result.otu_ids,
                     size: result.sample_values
                 },
                 text: result.otu_labels
             };

             // set layout for bubble plot
             var layout2 = {
                 font : {family: "Arial Roubded MT Bold"},
                 xaxis:{title: "<b> OTU ID </b>",},
                 showlegend: false
             };

             //create data variable
             var bubbleData =[trace2];

             //create bubble chart
             Plotly.newPlot("bubble",bubbleData,layout2);

            //create guage chart
          
var trace3 = [
	{
		domain: { x: [0, 1], y: [0, 1] },
		value: wfreq1,
		title: { text: "Belly Button Washing Frequency (Scrubs per Week)" },
		type: "indicator",
        mode: "gauge+number",
        gauge: {
            axis: {range: [null,9]},
            steps: [
                {range: [0,1],color:"#f7f2eb" },
                {range: [1,2],color:"#f3f0e4" },
                {range: [2,3],color:"#e8e6c8" },
                {range: [3,4],color:"#e4e8af" },
                {range: [4,5],color:"#d4e494" },
                {range: [5,6],color:"#b6cc8a" },
                {range: [6,7],color:"#86bf7f" },
                {range: [7,8],color:"#84bb8a" },
                {range: [8,9],color:"#7fb485" }
            ],
        }        
	}
];

var layout3 = { width: 600, height: 500, margin: { t: 0, b: 0 } };
Plotly.newPlot('gauge', trace3, layout3);
                })
            } 
  