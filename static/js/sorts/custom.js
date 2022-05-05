var running = false;
var stepDelay = document.getElementById("delayRangeInput").value;
var arrayLen = document.getElementById("arrayLen").value
var arrayMin = document.getElementById("arrayMin").value
var arrayMax = document.getElementById("arrayMax").value
var array = randomizeArray(arrayLen, arrayMin, arrayMax);


var width = Math.floor(window.innerWidth);
var height = Math.floor(window.innerHeight)-265;
var svg = d3.select("svg").style("width",width).style('height',height);


function updateDisplay(){
  stepDelay = document.getElementById("delayRangeInput").value;
  document.getElementById("delayRangeDisplay").innerHTML = stepDelay;
  document.getElementById("inputfieldset").disabled = running;
}

function reloadArray(){
  arrayLen = document.getElementById("arrayLen").value
  arrayMin = document.getElementById("arrayMin").value
  arrayMax = document.getElementById("arrayMax").value
  array = randomizeArray(arrayLen, arrayMin, arrayMax);
  visualizeArray();
}

async function sort(){
  let delayValue = document.getElementById("delayRangeInput").value;
  let sortOption = document.getElementById("sortMethodOption").value;

  if(sortOption == 0){
    alert("Please Specify a Sorting Method!")
  }else{

    running = true;
    updateDisplay();

    if(sortOption == 1){
      await bubbleSort(delayValue);
    }else if(sortOption == 2){
      await selectionSort(delayValue);
    }else if(sortOption == 3){
      await insertionSort(delayValue);
    }else{
      console.log(delayValue, sortOption)
    }

    running = false;
    updateDisplay();
  }

  
}


function randomizeArray(len, min, max){
  let array = [...Array(len)]
  let scale = d3.scaleLinear().domain([0, 1]).range([min, max]);
  for(let i = 0; i<len; i++){ array[i] = Math.round(scale(Math.random())) };
  return array;
}

function visualizeArray(){
  svg.selectAll("rect").remove();
  let xscale = d3.scaleLinear().domain([0, array.length]).range([0, width]);
  let yscale = d3.scaleLinear().domain([0, d3.max(array)]).range([0, height]);
  array.forEach((d,i) => {
    svg.append('rect')
      .attr('id', 'd'+i)
      .style('fill', 'steelblue')
      .attr("x", Math.round( xscale(i) ) )
      .attr("y", height - Math.round( yscale(d) ) ) 
      .attr("width", Math.round( width/array.length ) )
      .attr("height", Math.round( yscale(d) ) )
      .on("mouseover", function(d) { d3.select(this).style("fill", "#9FC5E8") })                  
      .on("mouseout", function(d) { d3.select(this).style("fill", "steelblue") });
  });
};

async function delay(milliseconds){
  return new Promise( resolve => {
    setTimeout( () => { resolve(''); }, milliseconds);
  });
};

async function visualizeSwap(i, j, color, msec){
  one = d3.select('rect#d'+i);
  two = d3.select('rect#d'+j);

  one.style('fill', 'red');
  two.style('fill', "green");
  await delay(msec);

  temp = one.attr('height');
  one.attr('height', two.attr('height'));
  two.attr('height', temp);

  temp = one.attr('y');
  one.attr('y', two.attr('y'));
  two.attr('y', temp);

  temp = one.style('fill');
  one.style('fill', two.style('fill'));
  two.style('fill', temp);
  
  await delay(msec);
  one.style('fill', 'steelblue');
  two.style('fill', 'steelblue');
}


async function visualizeShift(i, j, color, msec){
  one = d3.select('rect#d'+i);
  two = d3.select('rect#d'+j);

  one.style('fill', color);
  await delay(msec/2);

  one.style('fill', 'steelblue');
  two.attr('y', one.attr('y'))
     .attr('height', one.attr('height'))
     .style('fill', color);

  await delay(msec/2);
  two.style('fill', 'steelblue');
}


async function visualizeSelect(i, color,  msec){
  d3.select('rect#d'+i).style('fill', color);
  await delay(msec);
}


async function visualizeAssign(i, d, color, msec){
  let yscale = d3.scaleLinear().domain([0, d3.max(array)]).range([0, height]);
  
  one = d3.select('rect#d'+i)
          .style('fill', color);

  await delay(msec);

  one.attr("y", height - Math.round( yscale(d) ) ) 
     .attr("height", Math.round( yscale(d) ) )
     .style('fill', 'steelblue');

  await delay(msec/2);
}


async function bubbleSort(){
  for (let i = 0; i < array.length-1; i++)
  {
    for (let j = 0; j < array.length-i-1; j++)
    {

      // if (!running) {
      await visualizeSelect(j, 'green', 0)
      await visualizeSelect(j+1, 'green', 0)
      await delay(stepDelay)
      if (array[j] > array[j+1])
      {
        // swap(j, j+1)
        let temp = array[j];
        array[j] = array[j+1];
        array[j+1] = temp;
        await visualizeSwap(j, j+1, 'green', stepDelay);
      }
      else
      {
        await visualizeSelect(j+1, 'red', stepDelay*2)
        await visualizeSelect(j, 'steelblue', 0)
        await visualizeSelect(j+1, 'steelblue', 0)
      };

    };
  };
};

async function insertionSort() 
{
  for (let i = 1; i < array.length; i++) 
  { 
    // get the new key
    await visualizeSelect(i, 'red', stepDelay)
    let key = array[i];
    await visualizeSelect(i, 'steelblue', stepDelay/2)
    
    // keep shfting values that are greater than key
    let j = i-1;
    while(j>=0 && array[j] > key)
    {
      // shift(j => j+1)
      array[j+1] = array[j];
      await visualizeShift(j,j+1, 'green', stepDelay/2);
      j--;
    };

    //if there were some shifts
    if(j != i-1){
      // assign key to its appr index
      array[j+1] = key;
      await visualizeAssign(j+1, key, 'red', stepDelay);
    };
  };
};


async function selectionSort(){
  for (let i = array.length-1; i>-1; i--)
  {
    // find the max index
    let maxIndex = 0;
    await visualizeSelect(maxIndex, 'red', stepDelay/2)
    for (let j = 1; j<=i; j++)
    {
      await visualizeSelect(j, 'yellow', stepDelay/2)
      if ( array[maxIndex] < array[j] ){ 
        await visualizeSelect(maxIndex, 'steelblue', stepDelay/2)
        maxIndex = j; 
        await visualizeSelect(maxIndex, 'red', stepDelay/2);
      }else{
        await visualizeSelect(j, 'steelblue', stepDelay/10);
      }
      
    };

    // swap(i, maxIndex)
    let temp = array[i];
    array[i] = array[maxIndex];
    array[maxIndex] = temp;
    await visualizeSwap(i, maxIndex, "green", stepDelay*2);
    
    
  };
};


window.onload = function() {
  updateDisplay();
  visualizeArray();
};




