//AHHHHHHHHHHHHHHH

var world = [];
var ts = 10; //tile size
var ta = 30; //tile amount in one direction
var thicknessE = "100-(abs(cos(a))*50)";
var joint;
var end;
var length;
var wastedPlacements = 0;
var percision = 1.6;
var cur;
var dir;
var jumpLength;
const Fill = false;
var canvas2;
var ctx;
var equationInput;
var equationButton;
var checkboxes;

//ALWAYS put the right side sections first
//Left side sections do the filling, and stop when they hit a tile
var angles = [[90,55],[0,64],[0,-70],[-90,-60],[-90,-118],[-180,-110],[180,110],[90,118]];
var colors = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"];
var swaps = [true, false, false, true, true, false, false, true];

var sections = [];

function setup() {
  createCanvas(800, 800, WEBGL);
  angleMode(DEGREES);
  for(let y=0; y<ta; y++){
    world[y] = [];
    for(let x=0; x<ta; x++){
      world[y][x] = [];
      for(let z=0; z<ta; z++){
        world[y][x][z] = 0;
      }
    }
  }
  
  joint = createVector(9,15,0);
  end = createVector(9,15,19);
  joint.mult(ts);
  end.mult(ts);
  length = joint.dist(end);
  
  cur = end.copy().sub(joint);
  jumpLength = 0;
  if(cur.x!=0) jumpLength += (cur.x/cur.x);
  if(cur.y!=0) jumpLength += (cur.y/cur.y);
  if(cur.z!=0) jumpLength += (cur.z/cur.z);
  jumpLength = sqrt(jumpLength);
  if(jumpLength == 1) percision = 1;

  sections = []
  for(let b = 0; b < angles.length; b++){
    sections.push({a1: angles[b][0], a2: angles[b][1], side:"right", swapXY: swaps[b]});
    if((abs(angles[b][0])>90||abs(angles[b][1])>90)) sections[sections.length-1].side = "left";
  }
  
  
  var canvas = document.createElement('canvas');
  canvas.id = "canvas2";
  canvas.width = 600;
  canvas.height = 600;
  canvas.style.position = "absolute";
  canvas.style.left = "900px";
  canvas.style.top = "0px";
  canvas.style.border = "1px solid";


  var body = document.getElementsByTagName("body")[0];
  body.appendChild(canvas);

  canvas2 = document.getElementById("canvas2");
  ctx = canvas2.getContext("2d");

  equationInput = createInput(thicknessE);
  equationInput.position(900,620);
  equationInput.size(500,30);
  equationButton = createButton("submit");
  equationButton.position(900+510,620);
  equationButton.size(100,36);
  equationButton.mouseClicked(()=>{
    thicknessE = equationInput.value()
    
    reset();
  })
  checkboxes = [];
  for(let b = 0; b < swaps.length; b++){
    checkboxes.push(createCheckbox("", swaps[b]));
    if(b<4) checkboxes[b].position(955+(map(b,0,4,0,600)),500);
    if(b>=4) checkboxes[b].position(955+(map(b,4,swaps.length,0,600)),560);
    checkboxes[b].changed(() => {
      swaps[b] = checkboxes[b].checked();
      //reset();
    })
  }
}

function mousePressed(){
  if(mouseX>900 && mouseX<1500){
    if(mouseY < 600){
      let mVec = createVector(mouseX,mouseY);
      mVec.sub(createVector(1200, 300))
      
      for(let b = 0; b < angles.length; b++){
        if(abs(angles[b][0]-mVec.heading()) < 5){
          console.log(angles[b][0]);
          selected = [b,0];
          if(abs(angles[b][0]) == 90 || abs(angles[b][0]) == 180 || abs(angles[b][0]) == 0){
            selected = null;
          }
        }
        else if(abs(angles[b][1]-mVec.heading()) < 5){
          console.log(angles[b][1]);
          selected = [b,1];
          if(abs(angles[b][1]) == 90 || abs(angles[b][1]) == 180 || abs(angles[b][1]) == 0){
            selected = null;
          }
        }
      }
    }
  }
}

function mouseReleased(){
  selected = null;
}

function mouseDragged(){
  if(mouseX>900 && mouseX<1500){
    if(mouseY < 600){
      let mVec = createVector(mouseX,mouseY);
      mVec.sub(createVector(1200, 300))
      angles[selected[0]][selected[1]] = mVec.heading().toFixed(1);

      reset();
    }
  }
}

var i = 0;
var r = 0;
function draw() {
  ctx.fillStyle = "rgba(220, 220, 220, 1)";
  ctx.fillRect(0,0,600,600);
  ctx.translate(300,300);
  for(let b = 0; b < angles.length; b++){
    ctx.fillStyle = colors[b];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(100*cos(angles[b][0]), 100*sin(angles[b][0]));
    ctx.lineTo(100*cos(angles[b][1]), 100*sin(angles[b][1]));
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";
    if(b<4) ctx.fillText(angles[b], 65+(map(b,0,4,0,600))-300, 495-300);
    if(b>=4) ctx.fillText(angles[b], 65+(map(b,4,swaps.length,0,600))-300, 556-300);
  }
  ctx.translate(-300,-300);
  

  background(220);
  orbitControl();
  translate(ts*ta*-0.5,ts*ta*-0.5,ts*ta*-0.5);
  
  if((frameCount % 10 == 0) && i<length){
    cur = end.copy().sub(joint);
    cur.normalize();
    cur.mult(i*ts);
    cur.add(joint);
    //placeCube(cur.x,cur.y,cur.z,55);

    for(let s=0; s<sections.length; s++){
      section(cur.x,cur.y,cur.z,sections[s].a1,sections[s].a2,thicknessE,sections[s].side,sections[s].swapXY);
    }
    
    i+=jumpLength*(1/percision);
    //console.log(wastedPlacements); //REDUCE THIS MORE!
    wastedPlacements = 0;
  }
  
  
  
  for(let y=0; y<ta; y++){
    for(let x=0; x<ta; x++){
      for(let z=0; z<ta; z++){
        if(world[y][x][z] != 0){
          push();
          translate(x*ts,y*ts,z*ts);
          fill(255);
          fill(255*(1-((world[y][x][z]-1)/5)), 255, 255);
          box(ts);
          pop();
        }
        
      }
    }
  }
  if(cur && dir){
    push();
    translate((cur.x+dir.x)*ts,(cur.y+dir.y)*ts,(cur.z+dir.z)*ts);
    fill(255,0,0);
    box(15);
    pop();
  }
  drawArrow(joint.copy(), end.copy().sub(joint), "red");
}

function placeCube(x,y,z,lineNumber){
  x = floor(x/ts);
  y = floor(y/ts);
  z = floor(z/ts);
  

  if(x >= 0 && x < ta && y >= 0 && y < ta && z >= 0 && z < ta){
    if(world[y][x][z] != 0){
      wastedPlacements ++;
      //console.log("line: "+lineNumber+", xyz: "+`${x},${y},${z}`);
    }
    world[y][x][z] += 1;
  }
}

function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  translate(base.x, base.y, base.z);
  line(0, 0, 0, vec.x, vec.y, vec.z);
  pop();
}

function section(x,y,z,a1,a2,radius,side,swapXY){
  let vec = createVector();
  side = side=="right" ? 1:-1
  let a = a1+0;
  let c = createVector(x,y);
  
  //start the vector off at the correct distance away from the center
  vec.x = c.x+(ts*floor((eval(radius)*cos(a))/ts));
  vec.y = c.y+(ts*floor((eval(radius)*sin(a))/ts));
  
  //subtle differences ahead, I dont know how to compress this code more :p
  if(swapXY){
    while(abs(a-a2)>5){
      placeOrFill(vec.x,vec.y,z,side==-1); //only fill if side is left

      vec.x += ts*side;
      a = vec.copy().sub(c).heading();

      if(c.dist(vec) > eval(radius)){
        vec.y += ts*side*(a1>a2 ? -1:1);
        a = vec.copy().sub(c).heading();
      }
      if(c.dist(vec) < eval(radius)){
        vec.y += ts*side*(a1>a2 ? 1:-1);
        a = vec.copy().sub(c).heading();
      }
    }
    return;
  }
  else{
    while(abs(a-a2)>5){
      placeOrFill(vec.x,vec.y,z,side==-1);

      vec.y += ts*side*(a1>a2 ? -1:1);
      a = vec.copy().sub(c).heading();

      if(c.dist(vec) > eval(radius)){
        vec.x -= ts*side;
        a = vec.copy().sub(c).heading();
      }
      if(c.dist(vec) < eval(radius)){
        vec.x += ts*side;
        a = vec.copy().sub(c).heading();
      }
    }
    return;
  }
}

function fillLine(x1,y1,z1,x2,y2,z2){ //fills a line between x1,y1 to x2,y2
  let vec1 = createVector(x1,y1,z1);
  let vec2 = createVector(x2,y2,z2);
  let dir = vec2.copy().sub(vec1).normalize().mult(ts);
  while(world[floor(vec1.y/ts)][floor(vec1.x/ts)][floor(vec1.z/ts)] == 0){
    placeCube(vec1.x,vec1.y,vec1.z);
    vec1.add(dir);
  }
}

function placeOrFill(x,y,z,fillBool){
  if(fillBool){
    if(Fill) fillLine(x,y,z,x+1,y,z);
    else placeCube(x,y,z);
  }
  else{
    placeCube(x,y,z);
  }
}

function reset(){
  i = 0;
  for(let y=0; y<ta; y++){
    for(let x=0; x<ta; x++){
      for(let z=0; z<ta; z++){
        world[y][x][z] = 0;
      }
    }
  }

  sections = [];
  for(let b = 0; b < angles.length; b++){
    sections.push({a1: angles[b][0], a2: angles[b][1], side:"right", swapXY: swaps[b]});
    if((abs(angles[b][0])>90||abs(angles[b][1])>90)) sections[sections.length-1].side = "left";
  }
}