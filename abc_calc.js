/*
Program to do a abc-calculation for all locator in a HBR

 */


const numberOfColumns   = 14; // # of columns
const numberOfRows  = 13; // # of rows
const EAGasse    = 8; // column for inbound/outbound process
const factorA   = .30; // Percentag of locator used for A-items
const factorB   = .30; // Percentage of locator used for B-items
const distZwEbenen = 100; // in Pixel == cm
const distZwGassen = 400; 
const accHoriz = 175 ;  // 200 px/s²
const velocityHoriz = 300; // 300 px/s
const accVert = 100; // 100 px/s²
const velocityVert = 350; // 200/pxs
let locatorID = [];
let counterID = 0;
// variables used for canvas
let canvas = document.getElementById("canvasABC");
let ctx = canvas.getContext('2d');
let gapColumns = 5;
let gapRows = 5;
let containerHeight = 20;
let containerWidth = 35;
let freeSpace = 20;

// class definition for the locators 

class locator {
    constructor(ID,gasse, ebene, liRe){
        this.ID    = ID;
        this.gasse = gasse;
        this.ebene = ebene;
        this.liRe  = liRe; 
        this.abcDist  = "ABC";
        this.distUp = VerticalUpCalc(this.gasse,this.ebene);
        this.distDown = VerticalDownCalc(this.gasse, this.ebene);
        this.distHoriz = HorinzontalMove(this.gasse);
        this.distance = this.distUp+this.distDown+this.distHoriz;
        this.timeUp = TimeVertCalc(this.distUp);
        this.timehoriz =TimeHorizCalc(this.distHoriz);
        this.timeDown = TimeVertCalc(this.distDown);
        this.time = Math.round((this.timeUp+this.timehoriz+this.timeDown)*100)/100;
        this.abcTime = "ABC"
    }
};
// create locator based on # of rows&coulmns
for(let x=1;x<=numberOfColumns;x++){
    for(y=1;y<=numberOfRows;y++){
        locatorID[counterID] = new locator(counterID+1,x,y,"links");
        locatorID[counterID+1]  = new locator(counterID+2, x,y,"rechts")
        
        //console.log(JSON.stringify( locatorID[counterID]));
        //console.log(JSON.stringify( locatorID[counterID+1]));
        counterID +=2;
    }

}; 
// +++
console.log("Start Klassifizierung");

// Klassifizierung auf Basis der Distanz berechnen to be changed to a function

locatorID.sort(function(a, b) {
    return a.distance - b.distance;
  });
  let grenzvalueA = locatorID[Math.ceil(locatorID.length*factorA)].distance;
  let grenzvalueB = locatorID[Math.ceil(locatorID.length*(factorA+factorB))].distance;
for(i=0;i<locatorID.length;i++){ 
    if(locatorID[i].distance<=grenzvalueA){
        locatorID[i].abcDist = "A";
        //console.log("# "+i+" : "+JSON.stringify( locatorID[i]));
        continue;
    } 
    else if(locatorID[i].distance<=grenzvalueB){
        locatorID[i].abcDist = "B";
        //console.log("# "+i+" : "+JSON.stringify( locatorID[i]));
        continue;
    }
    else{
        locatorID[i].abcDist = "C";
    }

    //console.log("# "+i+" : "+JSON.stringify( locatorID[i]));
}
SortByID();

//console.log(JSON.stringify(locatorID));
ClassABCByTime();
console.log("New Line ********************************");
// Creating the canvas based on the entered coulumns and rows
canvas.width = numberOfColumns*(containerWidth*3+gapColumns*4)+freeSpace*2;
canvas.height = (numberOfRows+1)*(containerHeight+gapRows)+freeSpace+freeSpace;

locatorID.forEach(element => {
    let x = numberOfRows-element.ebene;
    let i = element.gasse-1;
    let recY = freeSpace+containerHeight+gapRows+((containerHeight+gapRows)*x);
    let recXlinks = freeSpace+(i*(4*gapColumns+3*containerWidth));
    let recXrechts = freeSpace+(i*(4*gapColumns+3*containerWidth))+(2*(gapColumns+containerWidth));
    ctx.font = "15px Arial";
    if(element.abcTime=="A"){
        ctx.fillStyle='green';
    }
    else if(element.abcTime=="B"){
        ctx.fillStyle='yellow';
    }
    else{ctx.fillStyle='orange';}
    if(element.liRe=="links"){
        ctx.fillRect(recXlinks, recY, containerWidth, containerHeight)     ;
        ctx.fillStyle='black';
        ctx.fillText(element.abcTime,recXlinks+containerWidth/2-3.5, recY+containerHeight/2+7);}
    else{
        ctx.fillRect(recXrechts, recY, containerWidth, containerHeight);
        ctx.fillStyle='black';
        ctx.fillText(element.abcTime,recXrechts+containerWidth/2-3.5, recY+containerHeight/2+7);}
    
    }

);
markerIO();

function markerIO(){
    let x = numberOfRows-1;
    let i = EAGasse -1;
    let recY = freeSpace+containerHeight+gapRows+((containerHeight+gapRows)*x);
    let recXmiddle = freeSpace+(i*(4*gapColumns+3*containerWidth))+((gapColumns+containerWidth));
    ctx.fillStyle='blue';
    ctx.fillRect(recXmiddle,recY,containerWidth,containerHeight);
    ctx.fillStyle='white';
    ctx.fillText("I/O",recXmiddle+10,recY+15);


}
console.log("New Line ********************************");





/* Functions for calculating ABC classification */



function ClassABCByTime(){
    locatorID.sort(function(a, b) {
        return a.time - b.time;
      });
      let grenzvalueA = locatorID[Math.ceil(locatorID.length*factorA)].time;
      let grenzvalueB = locatorID[Math.ceil(locatorID.length*(factorA+factorB))].time;
    for(i=0;i<locatorID.length;i++){ 
        if(locatorID[i].time<=grenzvalueA){
            locatorID[i].abcTime = "A";
            //console.log("# "+i+" : "+JSON.stringify( locatorID[i]));
            continue;
        } 
        else if(locatorID[i].time<=grenzvalueB){
            locatorID[i].abcTime = "B";
            //console.log("# "+i+" : "+JSON.stringify( locatorID[i]));
            continue;
        }
        else{
            locatorID[i].abcTime = "C";
        }  
    }
    SortByID();
}



// sort array by ID
function SortByID(){
locatorID.sort(function(a, b) {
    return a.ID - b.ID;
  });}


function totalDistance(gasse, ebene){
    if(gasse===EAGasse){
        return VerticalDownCalc(gasse,ebene);
    }
    else {
        return VerticalUpCalc(gasse, ebene) + HorinzontalMove(gasse) + numberOfRows*distZwEbenen;
    }
}

function VerticalUpCalc(gasse, ebene){
    if(gasse===EAGasse){return 0;}
    return (numberOfRows+1-ebene)*distZwEbenen
} ;

function VerticalDownCalc(gasse, ebene){
    if(gasse===EAGasse){
        return (ebene-1)*distZwEbenen
    }
    return numberOfRows*distZwEbenen;
};
function HorinzontalMove(gasse){
    if(gasse===EAGasse){return 0;}
    else if(gasse<EAGasse){
        return (EAGasse-gasse)*distZwGassen
    ;}
    else{ return (gasse-EAGasse)*distZwGassen;
    }
};

function TimeVertCalc(distVert){
    // if distance == 0 == time == 0
    if(distVert==0){return 0;}
    // if distance <= (distance for acceleration and distance for deceleration)  ==> .5 x a x (v/a)² (twice = one for acc, one for dec)
    // ==> velocity x (velocity/accVert) (assuming accelarion equal decelartion)
    else if(distVert <= velocityVert*(velocityVert/accVert)){ // if distance is smaller than needed distance for acc/decelleration
        return Math.sqrt(distVert*2/accVert);
    }
    else {
        let distanceAcc = velocityVert * (velocityVert) / accVert; // Calc the distance for acc&decelleartion
        let timeFullSpeed = (distVert-distanceAcc)/velocityVert;
        let timeUp = Math.sqrt(distanceAcc*2/accVert) + timeFullSpeed;
        return timeUp;
    }
};
// function for the horizontal calc similiar to the vert calc
function TimeHorizCalc(distHoriz){
    if(distHoriz==0){
        return 0;}
    else if(distHoriz <= Math.pow(velocityHoriz,2)/accHoriz){ 
        return Math.sqrt(distHoriz *2/accHoriz);
    }
    else {
        let distanceAcc = Math.pow(velocityHoriz,2) / accHoriz;
        let timeFullSpeed = (distHoriz-distanceAcc)/velocityHoriz;
        let timeHoriz = Math.sqrt(distanceAcc*2/accHoriz) + timeFullSpeed;
        //console.log(timeHoriz);
        return timeHoriz;
    }
};

