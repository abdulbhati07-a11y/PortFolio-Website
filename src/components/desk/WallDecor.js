import * as THREE from 'three';
import { blueprints } from '../../data/blueprints';
import { fitLine } from '../../lib/regression';

// Everything is mounted on inward-facing wall surfaces. New lights share the
// room's accent stage so the existing opening reveal also lights the decor.
export function createWallDecor({softGlow,reduced=false}) {
  const group=new THREE.Group();group.name='wall-decor';
  const textures=[],interactiveMeshes=[];
  const ink=new THREE.MeshStandardMaterial({color:'#252733',roughness:.65});
  const edge=new THREE.MeshStandardMaterial({color:'#62606c',metalness:.48,roughness:.43});
  const cream=new THREE.MeshStandardMaterial({color:'#d6c8ba',roughness:.72});
  const warm=new THREE.MeshStandardMaterial({color:'#f1c89e',emissive:'#ffd6aa',emissiveIntensity:1.1});warm.userData.lightStage='accents';
  const pink=new THREE.MeshStandardMaterial({color:'#ff9ebb',emissive:'#ff9ebb',emissiveIntensity:.65});pink.userData.lightStage='accents';
  function mesh(geometry,material,parent=group){const object=new THREE.Mesh(geometry,material);object.castShadow=false;object.receiveShadow=true;parent.add(object);return object;}
  function box(size,position,material,parent){const object=mesh(new THREE.BoxGeometry(...size),material,parent);object.position.set(...position);return object;}
  function plane(width,height,position,material,parent){const object=mesh(new THREE.PlaneGeometry(width,height),material,parent);object.position.set(...position);return object;}
  function cylinder(radius,height,position,material,parent){const object=mesh(new THREE.CylinderGeometry(radius,radius,height,24),material,parent);object.position.set(...position);return object;}
  function texture(width,height,paint){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');paint(ctx,width,height);const result=new THREE.CanvasTexture(canvas);result.colorSpace=THREE.SRGBColorSpace;textures.push(result);return {texture:result,ctx,canvas};}
  function mount(name,position,rotation){const object=new THREE.Group();object.name=name;object.position.set(...position);object.rotation.y=rotation;group.add(object);return object;}
  function glow(width,height,position,color,opacity,parent){const material=new THREE.MeshBasicMaterial({map:softGlow,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});material.userData.lightStage='accents';return plane(width,height,position,material,parent);}
  function frame(parent,width,height){
    box([width+.12,height+.12,.055],[0,0,0],ink,parent);
    box([width+.035,height+.035,.022],[0,0,.035],edge,parent);
    const backlight=new THREE.MeshStandardMaterial({color:'#c9cad8',emissive:'#c9d3f4',emissiveIntensity:.38});backlight.userData.lightStage='accents';
    for(const y of[-height/2-.065,height/2+.065])box([width+.13,.008,.012],[0,y,-.012],backlight,parent);
    glow(width+1,height+.8,[0,0,-.022],'#bdc6ec',.14,parent);
  }

  for(const [index,blueprint]of blueprints.entries()){
    const art=mount(`blueprint-${blueprint.id}`,[4.91,3.25,index===0?-.45:1.45],-Math.PI/2);frame(art,1.57,1.16);
    const {texture:map}=texture(960,710,(ctx,w,h)=>{
      ctx.fillStyle='#111d2c';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#abc2df10';ctx.lineWidth=1;
      for(let x=0;x<w;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
      for(let y=0;y<h;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
      ctx.fillStyle=blueprint.accent;ctx.font='18px monospace';ctx.fillText(blueprint.label,54,50);ctx.fillStyle='#eee6e2';ctx.font='bold 58px sans-serif';ctx.fillText(blueprint.title,50,119);
      ctx.strokeStyle=blueprint.accent;ctx.lineWidth=2;
      blueprint.steps.forEach((step,i)=>{const y=166+i*88;ctx.fillStyle='#182638';ctx.fillRect(149,y,662,61);ctx.strokeRect(149,y,662,61);ctx.fillStyle='#e3dee7';ctx.font='25px monospace';ctx.textAlign='center';ctx.fillText(step,480,y+39);if(i<3){ctx.beginPath();ctx.moveTo(480,y+61);ctx.lineTo(480,y+83);ctx.stroke();ctx.beginPath();ctx.moveTo(475,y+77);ctx.lineTo(480,y+84);ctx.lineTo(485,y+77);ctx.stroke();}});
      blueprint.outputs.forEach((label,i)=>{const x=52+i*292;ctx.fillStyle='#1c3040';ctx.fillRect(x,548,272,60);ctx.strokeRect(x,548,272,60);ctx.fillStyle=blueprint.accent;ctx.font='20px monospace';ctx.fillText(label,x+136,586);});
      ctx.fillStyle='#aebaca';ctx.font='18px sans-serif';ctx.fillText(blueprint.note,480,660);ctx.textAlign='left';
    });
    const screen=plane(1.57,1.16,[0,0,.052],new THREE.MeshStandardMaterial({map,roughness:.85}),art);screen.name=`blueprint-surface-${blueprint.id}`;screen.userData.go=`blueprint-${blueprint.id}`;interactiveMeshes.push(screen);
  }

  // A restrained warm-white sign with a pink underline on the front wall.
  const sign=mount('lab-nameplate',[.65,3.2,4.49],Math.PI);
  box([3.24,.88,.065],[0,0,0],ink,sign);glow(4.1,1.55,[0,0,-.04],'#ffe0ba',.18,sign);
  const signMap=texture(1400,360,(ctx,w,h)=>{ctx.fillStyle='#151721';ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff0dc';ctx.textAlign='center';ctx.font='bold 112px sans-serif';ctx.fillText('ABDULLAH’S LAB',w/2,205);ctx.fillStyle='#e6a3bd';ctx.fillRect(315,257,770,4);}).texture;
  const signMaterial=new THREE.MeshStandardMaterial({map:signMap,emissiveMap:signMap,emissive:'#fff0dd',emissiveIntensity:.8,roughness:.7});signMaterial.userData.lightStage='accents';
  plane(3.1,.76,[0,0,.043],signMaterial,sign);

  // Real Pakistan time. Hour/minute hands remain correct in reduced motion.
  const clock=mount('pkt-wall-clock',[-2.35,3.25,4.49],Math.PI);
  const clockRim=cylinder(.45,.065,[0,0,0],edge,clock);clockRim.rotation.x=Math.PI/2;
  const clockFaceMap=texture(512,512,(ctx,w,h)=>{
    ctx.fillStyle='#171c28';ctx.fillRect(0,0,w,h);ctx.translate(w/2,h/2);ctx.strokeStyle='#d8cbbf';
    for(let i=0;i<60;i++){const angle=i/60*Math.PI*2,r=i%5===0?196:211;ctx.lineWidth=i%5===0?5:2;ctx.beginPath();ctx.moveTo(Math.sin(angle)*r,-Math.cos(angle)*r);ctx.lineTo(Math.sin(angle)*224,-Math.cos(angle)*224);ctx.stroke();}
    ctx.fillStyle='#b6aabd';ctx.textAlign='center';ctx.font='20px monospace';ctx.fillText('PKT',0,105);ctx.font='12px monospace';ctx.fillText('ASIA / KARACHI',0,127);
  }).texture;
  const face=mesh(new THREE.CircleGeometry(.411,48),new THREE.MeshStandardMaterial({map:clockFaceMap,roughness:.9}),clock);face.position.z=.04;
  function hand(name,length,width,material,z){const pivot=new THREE.Group();pivot.name=name;pivot.position.z=z;clock.add(pivot);box([width,length,.009],[0,length/2,0],material,pivot);return pivot;}
  const hour=hand('pkt-hour-hand',.205,.025,cream,.055),minute=hand('pkt-minute-hand',.304,.017,cream,.068),second=hand('pkt-second-hand',.336,.006,pink,.079);second.visible=!reduced;
  const hub=cylinder(.027,.014,[0,0,.087],cream,clock);hub.rotation.x=Math.PI/2;
  const timeFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  let clockSecond=-1;

  // A small floating shelf beneath the two blueprints, with warm underside LEDs.
  const shelf=mount('wall-display-shelf',[4.66,1.97,.5],-Math.PI/2);
  box([3.35,.075,.48],[0,0,0],ink,shelf);box([3.2,.016,.015],[0,-.045,.247],warm,shelf);
  for(const x of[-1.25,1.25]){box([.04,.26,.04],[x,-.14,-.17],edge,shelf);box([.04,.04,.38],[x,-.22,-.01],edge,shelf);}
  glow(3.6,1.2,[0,-.40,-.20],'#ffd5a3',.18,shelf);
  const bookColors=['#a9909e','#648c8b','#d1b89b','#8e86a7'];
  for(let i=0;i<4;i++){
    const height=.31+(i%3)*.045,x=-1.25+i*.13;box([.105,height,.23],[x,.038+height/2,.02],new THREE.MeshStandardMaterial({color:bookColors[i],roughness:.85}),shelf);
    const map=texture(128,512,(ctx,w,h)=>{ctx.fillStyle=bookColors[i];ctx.fillRect(0,0,w,h);ctx.fillStyle='#eee3da';ctx.translate(w/2,h/2);ctx.rotate(-Math.PI/2);ctx.font='bold 37px monospace';ctx.textAlign='center';ctx.fillText(['PYTHON','SYSTEMS','DESIGN','AI'][i],0,13);}).texture;
    plane(.098,height-.02,[x,.038+height/2,.14],new THREE.MeshStandardMaterial({map,roughness:.85}),shelf);
  }
  const miniature=new THREE.Group();miniature.name='shelf-miniature-robot';miniature.position.set(.15,.04,.02);shelf.add(miniature);
  for(const x of[-.055,.055]){box([.06,.055,.09],[x,.028,.035],edge,miniature);box([.035,.08,.04],[x,.09,0],cream,miniature);}
  box([.18,.17,.11],[0,.20,0],cream,miniature);box([.25,.22,.16],[0,.40,0],ink,miniature);box([.215,.176,.012],[0,.40,.09],pink,miniature);
  for(const x of[-.05,.05])box([.022,.053,.009],[x,.41,.102],ink,miniature);
  box([.27,.025,.18],[0,.525,0],cream,miniature);
  for(const side of[-1,1])box([.035,.13,.045],[side*.118,.19,0],edge,miniature);
  const tokenMap=texture(256,256,(ctx,w,h)=>{ctx.fillStyle='#202534';ctx.fillRect(0,0,w,h);ctx.textAlign='center';ctx.fillStyle='#cbb8cf';ctx.font='bold 100px monospace';ctx.fillText('{ }',w/2,161);}).texture;
  box([.3,.3,.055],[1.08,.19,.02],edge,shelf);plane(.276,.276,[1.08,.19,.053],new THREE.MeshStandardMaterial({map:tokenMap,roughness:.8}),shelf);

  // A real least-squares drawing. Hover traces the fit and its residuals.
  const art=mount('ml-artwork',[-4.46,2.6,2.05],Math.PI/2);frame(art,1.91,1.32);
  const data=[{x:12,y:20},{x:23,y:35},{x:35,y:30},{x:43,y:49},{x:56,y:56},{x:68,y:63},{x:78,y:83},{x:89,y:77}],model=fitLine(data);
  let hovered=false,focused=false,playUntil=0,progress=0,lastPaint=-Infinity,lastProgress=-1;
  function paintScatter(ctx,w,h,time=0){
    ctx.fillStyle='#14202b';ctx.fillRect(0,0,w,h);ctx.fillStyle='#b7c9c8';ctx.font='18px monospace';ctx.fillText('MACHINE LEARNING / LEAST SQUARES',45,44);ctx.fillStyle='#eee7df';ctx.font='bold 40px sans-serif';ctx.fillText('Find the signal.',42,99);
    const x=value=>70+value*6.8,y=value=>432-value*2.85;
    ctx.strokeStyle='#a5c8d51a';ctx.lineWidth=1;for(let value=0;value<=100;value+=20){ctx.beginPath();ctx.moveTo(x(value),137);ctx.lineTo(x(value),432);ctx.stroke();ctx.beginPath();ctx.moveTo(70,y(value));ctx.lineTo(750,y(value));ctx.stroke();}
    ctx.save();ctx.beginPath();ctx.rect(70,137,680,295);ctx.clip();
    ctx.strokeStyle=`rgba(229,167,194,${.14+progress*.7})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x(0),y(model.intercept));ctx.lineTo(x(100*Math.max(.12,progress)),y(model.intercept+model.slope*100*Math.max(.12,progress)));ctx.stroke();
    for(const point of data){if(progress>.02){ctx.setLineDash([4,5]);ctx.strokeStyle=`rgba(155,203,188,${progress*.45})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x(point.x),y(point.y));ctx.lineTo(x(point.x),y(model.slope*point.x+model.intercept));ctx.stroke();ctx.setLineDash([]);}ctx.fillStyle='#a5cec3';ctx.beginPath();ctx.arc(x(point.x),y(point.y),5,0,Math.PI*2);ctx.fill();}
    if(progress>.7){const travel=(time*.16)%1;ctx.fillStyle='#fff0dc';ctx.beginPath();ctx.arc(x(travel*100),y(model.intercept+model.slope*travel*100),5,0,Math.PI*2);ctx.fill();}
    ctx.restore();ctx.fillStyle='#bdadca';ctx.font='17px monospace';ctx.fillText(`y = ${model.slope.toFixed(2)}x + ${model.intercept.toFixed(2)}     R² ${model.r2.toFixed(3)}`,45,478);ctx.fillStyle='#90a5ac';ctx.font='15px monospace';ctx.fillText('HOVER OR TAP TO TRACE THE FIT',45,513);
  }
  const drawing=texture(820,550,paintScatter),artScreen=plane(1.91,1.32,[0,0,.052],new THREE.MeshStandardMaterial({map:drawing.texture,roughness:.85}),art);artScreen.name='ml-artwork-surface';artScreen.userData.hover='ml-art';interactiveMeshes.push(artScreen);
  function update(time,dt){
    const now=Date.now(),secondNow=Math.floor(now/1000);
    if(secondNow!==clockSecond){clockSecond=secondNow;const parts=Object.fromEntries(timeFormat.formatToParts(new Date(now)).filter(item=>item.type!=='literal').map(item=>[item.type,Number(item.value)]));hour.rotation.z=-((parts.hour%12)+parts.minute/60)*Math.PI/6;minute.rotation.z=-(parts.minute+parts.second/60)*Math.PI/30;second.rotation.z=-parts.second*Math.PI/30;clock.userData.pktTime=`${parts.hour}:${String(parts.minute).padStart(2,'0')}:${String(parts.second).padStart(2,'0')}`;}
    const target=hovered||focused||performance.now()<playUntil?1:0;progress=reduced?target:progress+(target-progress)*(1-Math.exp(-dt*8));
    if(performance.now()-lastPaint>50&&(Math.abs(progress-lastProgress)>.006||(!reduced&&progress>.7))){paintScatter(drawing.ctx,820,550,time);drawing.texture.needsUpdate=true;lastPaint=performance.now();lastProgress=progress;}
    art.userData.hoverProgress=progress;
  }
  return {group,textures,interactiveMeshes,update,setHovered:value=>{hovered=value;},setFocused:value=>{focused=value;},playArtwork:()=>{playUntil=performance.now()+2200;}};
}
