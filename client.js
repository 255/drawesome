//Client-side code for traceing, captureing, submitting, and drawing

//Constants
var NEGLIGIBLE_MOVEMENT = 7;
//var SUBMIT_DELAY = 2000;

//Local Canvas Variables
var canvasElem; 
var canvasContext;
var traceable = false;
var drawing = false;
//Local information
var myID, myColor;
var myTraceQueue = new Array();
//Artist's Information sent over from server
var fellowArtists = new Array();

//Time Variables
var firstTime = diffTime = lastTime = 0;



jQuery(document).ready(function(){
  //canvasElem = $('#drawesomeCanvas');
  canvasElem = document.getElementById("drawesomeCanvas");
  canvasContext = canvasElem.getContext("2d");
  firstTime = $.now();
  
  //Check if referencing the canvas
  if(canvasElem.length > 0) {
    alert('woohoo');
	}
  
  $(document).mouseup()
  $(canvasElem).on({
	  mouseenter: function(){ //begin to be traceable
	    traceable = true
		console.log("traceable!");
	  },
	  mouseleave: function() { //no longer traceable or drawing
	    traceable = false;
		drawing = false;
		console.log("UNtraceable!");
	  },
	  mousedown: function() { //switch mouseDrawing off
	    drawing = true;
		console.log("Drawing!");
	  },
	  mouseup: function() {//switch mouseDrawing off
	    drawing = false;
		console.log("NotDrawing!");
	  },
	  mousemove: function(e){ //call recordMouseCoord
	    recordMouseCoord(e, canvasElem);
	  }
  });
});
    
function recordMouseCoord(mouse) {
  if(traceable && drawing) {
    //Looking for upper then lower bounds of X then Y of what to record
    //This is to keep the queue with only pertinent coordinates and not every small movement of the mouse. 
    //negligableMovement is defined as const at top
    if(myTraceQueue.length == 0) { //check if empty first
      myTraceQueue.push({X: mouse.pageX, Y: mouse.pageY});
    }
    else if(mouse.pageX >= (myTraceQueue[myTraceQueue.length-1].X + NEGLIGIBLE_MOVEMENT) ) { 
      myTraceQueue.push({X: mouse.pageX, Y: mouse.pageY});
    }
    else if(mouse.pageX <= (myTraceQueue[myTraceQueue.length-1].X - NEGLIGIBLE_MOVEMENT) ) {
      myTraceQueue.push({X: mouse.pageX, Y: mouse.pageY});
    }
    else if(mouse.pageY >= (myTraceQueue[myTraceQueue.length-1].Y + NEGLIGIBLE_MOVEMENT) ) { 
      myTraceQueue.push({X: mouse.pageX, Y: mouse.pageY});
    }
    else if(mouse.pageY <= (myTraceQueue[myTraceQueue.length-1].Y - NEGLIGIBLE_MOVEMENT) ) {
      myTraceQueue.push({X: mouse.pageX, Y: mouse.pageY});
    }
    
    drawSubmitTrace();
  }
}

function drawSubmitTrace() {
	if(myTraceQueue.length >= 2)
	{
    //canvasContext.strokeStyle = myColor;
	  canvasContext.moveTo(myTraceQueue[0].X, myTraceQueue[0].Y);
	  console.log("Moving to: " + myTraceQueue[0].X + ", " + myTraceQueue[0].Y);
	  canvasContext.lineTo(myTraceQueue[1].X, myTraceQueue[1].Y);
	  console.log("Lining to: " + myTraceQueue[1].X + ", " + myTraceQueue[1].Y);
	  canvasContext.stroke();
    
    //Submit traceQueue[0] to server
    socket.emit('points_c2s', myTraceQueue[0]);
    
	  var lastLocalRemoved = myTraceQueue.shift();
	}
    //console.log(traceQueue[traceQueue.length-1]);
	//console.log(mouse.pageX + " " + mouse.pageY);
	//console.log("X: Min: " +(traceQueue[traceQueue.length-1].X - NEGLIGIBLE_MOVEMENT) + " Max: " + (traceQueue[traceQueue.length-1].X + NEGLIGIBLE_MOVEMENT));
	//console.log("Y: Min: " +(traceQueue[traceQueue.length-1].Y - NEGLIGIBLE_MOVEMENT) + " Max: " + (traceQueue[traceQueue.length-1].Y + NEGLIGIBLE_MOVEMENT));
	//console.log(traceQueue.length);	
}

//Capture the ID and Color info from the server
function getThisClientInfo(ID, color) {
  myID = ID;
  myColor = color;  
}
//Capture TraceQueue chunks from server, if there is a match then concat the arrays
//if there is not a match, add it to the array under the new ID
function receiveTraceFromServer(ID, color, newTraceQueue) {
  var found = false; 
  if(ID != myID) //Make sure the array isn't storing this client's traceQueues
  {
    if(fellowArtists.length > 0) { 
      fellowArtists.forEach( function(artist, index, array)  {
        found = false;
        if(artist.ID == ID) { //This should read array[index].ID
          artist.TraceQueue = artist.TraceQueue.concat(newTraceQueue);
          found = true;
        }
      });
      if(found == false) {
        fellowArtists.Add({ID: ID, Color: color, TraceQueue: traceQueue});
      }
    }
    else {
      fellowArtists.Add({ID: ID, Color: color, TraceQueue: traceQueue});  
    }
  }      
  drawTraceFromServer();
}
//drawTraceFromServer
//context.strokeStyle = '#ff0000';

//Draw the captured traces from the server,
// shifting the drawn points off each respective artist's TraceQueue
function drawTraceFromServer() {
  for(var i=0; i<fellowArtists.length; ++i) { //Artist loop
    for(var j=0; j<fellowArtists[i].TraceQueue.length; ++j) { //Artist's TraceQueue loop
      var artistColorToStyle = fellowArtists[i].Color; //This has to be hash #000000 to #ffffff
      canvasContext.strokeStyle = artistColorToStyle;
      canvasContext.moveTo(fellowArtists[i].TraceQueue[0].X, fellowArtists[i].TraceQueue[0].Y); //Watch out for shortening the length
      canvasContext.lineTo(fellowArtists[i].TraceQueue[1].X, fellowArtists[i].TraceQueue[1].Y);
      canvasContext.stroke();
      var lastPointRemoved = fellowArtists[i].TraceQueue.shift();
    }
  }  
}

//function submitTraceToServer //triggered by time.Events every SUBMIT_DELAY seconds
// send mouseTrail queue to server, 
// pull X from top and wait Xsecs before sending again