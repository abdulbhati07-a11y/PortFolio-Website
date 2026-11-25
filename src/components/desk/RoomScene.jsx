import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { constrainRoomCamera, roomOrbitPosition, roomFieldOfView } from '../../lib/roomCamera';
import { createCornerPlant } from './CornerPlant';
import { createWallDecor } from './WallDecor';

const PINK = '#ff9ebb';
const home = { position:[5.15,3.7,6.6], target:[0,1.65,-.8] };
const views = {
  projects:{position:[-.78,2.08,-.9],target:[-.78,2.08,-.035]},
  about:{position:[-.62,2.25,-.45],target:[-.62,2.25,-1.16]},
  experience:{position:[2.54,2.65,.7],target:[2.54,2.65,-3.13]},
  contact:{position:[.82,4.1,1.82],target:[.82,1.31,.62]},
  futurepath:{position:[3.62,1.58,-.8],target:[3.62,1.22,-2.18]},
  'blueprint-futurepath':{position:[2.7,3.25,-.45],target:[4.9,3.25,-.45]},
  'blueprint-visionguard':{position:[2.7,3.25,1.45],target:[4.9,3.25,1.45]},
};

function canvasTexture(width,height,paint) {
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  paint(canvas.getContext('2d'),width,height);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

export default function RoomScene({ entered, active, onReady, onNavigate, onDocked, reduced }) {
  const mount=useRef(null), api=useRef(null);
  const callbacks=useRef({onReady,onNavigate,onDocked});
  useEffect(()=>{callbacks.current={onReady,onNavigate,onDocked};},[onReady,onNavigate,onDocked]);

  useEffect(()=>{
    const host=mount.current;
    let renderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'}); }
    catch { callbacks.current.onReady(false);return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
    host.appendChild(renderer.domElement);
    const scene=new THREE.Scene();scene.background=new THREE.Color('#181927');scene.fog=new THREE.FogExp2('#181927',.021);
    const camera=new THREE.PerspectiveCamera(43,1,.05,90);
    const target=new THREE.Vector3(-.62,2.25,-1.16);
    camera.position.set(-.62,2.25,-.45);
    const meshes=[],resources=[],hotspots=[];
    let navigating=false,current=null,disposed=false,frame,drag=null,dragged=false,orbit=0,pitch=0,renderOrbit=0,renderPitch=0,previousTime=0;
    const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
    const dark=material('#222532'),metal=material('#303544',{metalness:.55,roughness:.37}),wood=material('#4c3939'),cream=material('#b8aaa3');
    const glowing=(color,intensity=1,stage='accents')=>{const result=material(color,{emissive:color,emissiveIntensity:intensity});result.userData.lightStage=stage;return result;};
    const add=(geo,mat,pos,parent=scene)=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);meshes.push(mesh);return mesh;};
    const box=(size,pos,mat,parent)=>add(new THREE.BoxGeometry(...size),mat,pos,parent);
    const round=(w,h,d,r,pos,mat,parent=scene)=>{
      const shape=new THREE.Shape();const x=-w/2,y=-h/2;
      shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
      return add(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1,curveSegments:6}),mat,[pos[0],pos[1],pos[2]-d/2],parent);
    };
    const cylinder=(r,h,pos,mat,parent)=>add(new THREE.CylinderGeometry(r,r,h,16),mat,pos,parent);
    const rod=(a,b,r,mat,parent)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const mesh=cylinder(r,delta.length(),start.clone().add(end).multiplyScalar(.5).toArray(),mat,parent);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return mesh;};
    const sphere=(r,pos,mat,parent)=>add(new THREE.SphereGeometry(r,18,12),mat,pos,parent);
    const plane=(w,h,pos,mat,parent)=>add(new THREE.PlaneGeometry(w,h),mat,pos,parent);
    function point(key,label,position,action) {
      const el=document.createElement('button');el.className='room-marker';el.type='button';el.setAttribute('aria-label',`Open ${label}`);el.innerHTML=`<span class="marker-diamond"></span><span class="marker-label">${label}</span>`;
      el.addEventListener('click',action||(()=>callbacks.current.onNavigate(key)));host.appendChild(el);
      hotspots.push({el,point:new THREE.Vector3(...position)});
      return el;
    }

    // Indirect dusk light, a warm desk lamp and the pink glow of the robot.
    const hemisphere=new THREE.HemisphereLight('#ddd1da','#53444a',1.65);scene.add(hemisphere);
    const sun=new THREE.DirectionalLight('#ffd4b5',3.0);sun.position.set(-3,5,-5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:24});sun.shadow.bias=-.001;scene.add(sun);
    const fill=new THREE.DirectionalLight('#c1c1d6',1.05);fill.position.set(3,4,6);scene.add(fill);
    const pinkLight=new THREE.PointLight(PINK,1.35,4,2);pinkLight.position.set(-.62,2.25,-1.03);scene.add(pinkLight);
    const lampLight=new THREE.PointLight('#ffd6a0',8.2,4,2);lampLight.position.set(-2.1,2.3,-.3);lampLight.castShadow=true;scene.add(lampLight);
    pinkLight.userData.lightStage=lampLight.userData.lightStage='task';

    // Herringbone floor and dark acoustic wall panels.
    const floorTex=canvasTexture(1024,1024,(ctx)=>{
      ctx.fillStyle='#493e40';ctx.fillRect(0,0,1024,1024);
      for(let row=-4;row<18;row++)for(let col=-4;col<18;col++){
        ctx.save();ctx.translate(col*100+row%2*50,row*100);ctx.rotate(Math.PI/4);
        for(let k=0;k<2;k++){ctx.fillStyle=['#51444a','#5f5050','#413e45','#6d5955'][(row+col+k+40)%4];ctx.fillRect(k*39,0,37,160);ctx.strokeStyle='#312c34';ctx.lineWidth=2;ctx.strokeRect(k*39,0,37,160);for(let j=0;j<4;j++){ctx.strokeStyle='#ffffff07';ctx.beginPath();ctx.moveTo(k*39+7+j*7,0);ctx.lineTo(k*39+7+j*7,160);ctx.stroke();}}
        ctx.restore();
      }
    });floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(3,3);resources.push(floorTex);
    box([10,.12,9],[0,-.08,.1],material('#aaa1a3',{map:floorTex,roughness:.85}));
    const wall=material('#49454c');box([10,5,.12],[0,2.5,-3.4],wall);box([.12,5,8],[-4.6,2.5,.6],wall);
    const seam=material('#171923');
    for(let x=-4.5;x<=5;x+=1.25)box([.014,5,.03],[x,2.5,-3.32],seam);
    for(let y=0;y<=5;y+=1.05)box([10,.014,.025],[0,y,-3.32],seam);
    for(let z=-3.3;z<=4;z+=1.2)box([.025,5,.014],[-4.52,2.5,z],seam);
    for(let y=0;y<=5;y+=1.05)box([.025,.014,8],[-4.52,y,.5],seam);
    box([10,.09,.09],[0,.08,-3.28],metal);box([.09,.09,8],[-4.48,.08,.5],metal);

    // Complete the enclosure with matching panels, visible from inside the room.
    const rightWall=new THREE.Group();rightWall.position.set(5,2.5,.6);rightWall.rotation.y=-Math.PI/2;scene.add(rightWall);
    plane(8,5,[0,0,0],wall,rightWall);
    for(let z=-3.3;z<=4.6;z+=1.2)plane(.014,5,[z-.6,0,.015],seam,rightWall);
    for(let y=0;y<=5;y+=1.05)plane(8,.014,[0,y-2.5,.015],seam,rightWall);
    plane(8,.09,[0,.08-2.5,.03],metal,rightWall);

    const frontWall=new THREE.Group();frontWall.name='front-wall';frontWall.position.set(.2,2.5,4.6);frontWall.rotation.y=Math.PI;scene.add(frontWall);
    plane(9.6,5,[0,0,0],wall,frontWall);
    for(let x=-4.5;x<=5;x+=1.25)plane(.014,5,[.2-x,0,.015],seam,frontWall);
    for(let y=0;y<=5;y+=1.05)plane(9.6,.014,[0,y-2.5,.015],seam,frontWall);
    plane(9.6,.09,[0,.08-2.5,.03],metal,frontWall);

    // Right-hand corner when facing the front wall from inside the room.
    const doorPanel=material('#39313e'),doorInset=material('#443b49');
    box([1.4,2.7,.10],[3.95,-1.15,.04],metal,frontWall);
    const door=box([1.22,2.54,.035],[3.95,-1.18,.11],doorPanel,frontWall);door.name='front-door';
    for(const y of[-.64,-1.78])box([.94,.91,.018],[3.95,y,.14],doorInset,frontWall);
    box([.08,.24,.025],[3.53,-1.29,.16],metal,frontWall);
    rod([3.53,-1.29,.19],[3.73,-1.29,.19],.025,cream,frontWall);
    box([1.34,.035,.15],[3.95,-2.47,.08],metal,frontWall);

    const ceiling=new THREE.Group();ceiling.position.set(.2,5,.6);ceiling.rotation.x=Math.PI/2;scene.add(ceiling);
    const ceilingPanel=wall.clone();ceilingPanel.emissive.set('#49454c');ceilingPanel.emissiveIntensity=.4;ceilingPanel.userData.lightStage='base';
    plane(9.6,8,[0,0,0],ceilingPanel,ceiling);
    for(let x=-4.5;x<=5;x+=1.25)plane(.014,8,[x-.2,0,.015],seam,ceiling);
    for(let z=-3.3;z<=4.6;z+=1.2)plane(9.6,.014,[0,z-.6,.015],seam,ceiling);
    // Keep the existing lighting and shadows on all furnishings unchanged.
    rightWall.traverse(mesh=>{mesh.castShadow=false;});frontWall.traverse(mesh=>{mesh.castShadow=false;});ceiling.traverse(mesh=>{mesh.castShadow=false;});

    // A compact ceiling fan centered within the room, with a quiet, steady spin.
    const ceilingFan=new THREE.Group();ceilingFan.name='ceiling-fan';ceilingFan.position.set(.2,0,.6);scene.add(ceilingFan);
    cylinder(.16,.07,[0,4.955,0],metal,ceilingFan);
    cylinder(.032,.27,[0,4.80,0],metal,ceilingFan);
    cylinder(.19,.16,[0,4.63,0],metal,ceilingFan);
    cylinder(.13,.025,[0,4.54,0],dark,ceilingFan);
    cylinder(.045,.012,[0,4.52,0],cream,ceilingFan);
    const fanRotor=new THREE.Group();fanRotor.name='ceiling-fan-rotor';fanRotor.position.y=4.65;ceilingFan.add(fanRotor);
    const bladeShape=new THREE.Shape();bladeShape.moveTo(.13,-.06);bladeShape.lineTo(.9,-.18);bladeShape.quadraticCurveTo(1.28,-.21,1.3,-.06);bladeShape.quadraticCurveTo(1.32,.10,1.10,.12);bladeShape.lineTo(.13,.065);bladeShape.closePath();
    const bladeGeometry=new THREE.ExtrudeGeometry(bladeShape,{depth:.025,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:2,curveSegments:8});
    const bladeMaterial=material('#584952',{roughness:.48,metalness:.12});
    for(let i=0;i<3;i++){const arm=new THREE.Group();arm.rotation.y=i/3*Math.PI*2;fanRotor.add(arm);const blade=add(bladeGeometry,bladeMaterial,[0,0,0],arm);blade.rotation.x=Math.PI/2+.11;}
    ceilingFan.traverse(mesh=>{mesh.castShadow=false;});

    // Soft local washes keep the accent lights warm and restrained.
    const softGlow=canvasTexture(128,128,(ctx,w,h)=>{const gradient=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gradient.addColorStop(0,'rgba(255,255,255,.55)');gradient.addColorStop(.35,'rgba(255,255,255,.22)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);});resources.push(softGlow);
    const glowMaterial=(color,opacity)=>{const result=new THREE.MeshBasicMaterial({map:softGlow,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});result.userData.lightStage='accents';return result;};
    const deskGlow=plane(5.4,3.9,[-.65,.058,.1],glowMaterial('#edb690',.28));deskGlow.name='desk-floor-glow';deskGlow.rotation.x=-Math.PI/2;deskGlow.castShadow=deskGlow.receiveShadow=false;
    const underDeskLight=new THREE.PointLight('#ffd4a1',.18,3.2,2);underDeskLight.name='desk-ambient-light';underDeskLight.position.set(-.65,.30,1.3);scene.add(underDeskLight);
    const shelfLight=new THREE.PointLight('#ffd4a5',2.0,2.6,2);shelfLight.name='shelf-ambient-light';shelfLight.position.set(-4.01,1.94,-1.55);scene.add(shelfLight);
    underDeskLight.userData.lightStage=shelfLight.userData.lightStage='accents';
    const shelfWash=plane(2.65,1.55,[-4.505,1.7,-1.55],glowMaterial('#ffd1a0',.18));shelfWash.rotation.y=Math.PI/2;shelfWash.castShadow=shelfWash.receiveShadow=false;
    const pinboardHalo=plane(3.6,2.3,[2.45,2.91,-3.285],glowMaterial('#bac7fa',.45));pinboardHalo.name='pinboard-halo';pinboardHalo.castShadow=pinboardHalo.receiveShadow=false;
    const pinboardLight=new THREE.PointLight('#c3d0ff',.7,2.2,2);pinboardLight.position.set(2.45,3,-3.265);pinboardLight.userData.lightStage='accents';scene.add(pinboardLight);

    // A city at dusk, painted into the view beyond the window.
    const city=canvasTexture(1536,1024,(ctx,w,h)=>{
      const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#6c597e');sky.addColorStop(.43,'#cb8798');sky.addColorStop(.7,'#efa99a');sky.addColorStop(1,'#e5b69a');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      ctx.fillStyle='#f4c5ad';ctx.beginPath();ctx.arc(310,345,65,0,Math.PI*2);ctx.fill();
      let seed=7;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
      for(let layer=0;layer<3;layer++){for(let x=-30;x<w;x+=85+random()*65){const bw=85+random()*130,bh=160+random()*(layer===0?340:490),y=h-bh+layer*30;ctx.fillStyle=layer===0?'#8a7487':layer===1?'#736274':'#625361';ctx.fillRect(x,y,bw,bh);ctx.fillStyle='#514658';ctx.fillRect(x-4,y,bw+8,7);for(let a=x+10;a<x+bw-10;a+=20)for(let b=y+16;b<h;b+=29){ctx.fillStyle=random()>.54?'#f6d89a':random()>.6?'#978e9c':'#4f4c5d';ctx.fillRect(a,b,10,16);}}}
      for(const [x,y,s]of[[290,830,1.1],[1090,740,.9],[760,990,1.35]]){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle='#333d3b';ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(0,150);ctx.quadraticCurveTo(15,-110,0,-240);ctx.stroke();for(let i=0;i<9;i++){const angle=i/9*Math.PI*2;ctx.save();ctx.translate(0,-235);ctx.rotate(angle);ctx.fillStyle=i%2?'#425249':'#53604e';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(80,-65,200,20);ctx.quadraticCurveTo(75,-20,0,0);ctx.fill();ctx.restore();}ctx.restore();}
    });resources.push(city);
    box([3.94,3.05,.12],[-1.45,3.0,-3.20],metal);
    plane(3.74,2.86,[-1.45,3.0,-3.12],new THREE.MeshBasicMaterial({map:city}));
    box([.055,3,.07],[-1.45,3,-3.05],dark);box([3.98,.1,.24],[-1.45,1.49,-3.05],dark);

    // Rug, rounded desk and subtle warm perimeter strip.
    box([4.8,.025,3.6],[-.65,.01,.1],material('#85808a'));box([4.54,.028,3.34],[-.65,.025,.1],dark);box([4.46,.03,3.26],[-.65,.03,.1],material('#87818b'));box([4.26,.032,3.06],[-.65,.035,.1],material('#6c6875'));
    round(3.6,1.15,1.65,.15,[-.65,.64,.1],material('#252633'));
    const strip=round(3.78,.07,1.8,.15,[-.65,1.235,.1],glowing('#ffdba6',2));strip.castShadow=false;
    const underDeskStrip=glowing('#efbd8e',1.25);
    box([3.26,.022,.018],[-.65,.14,.965],underDeskStrip).castShadow=false;
    for(const x of[-2.47,1.17])box([.018,.022,1.42],[x,.14,.1],underDeskStrip).castShadow=false;
    round(3.8,.12,1.84,.18,[-.65,1.32,.1],wood);
    // Desktop is an extruded rounded rectangle turned flat.
    const top=round(3.8,1.84,.1,.18,[-.65,1.4,.1],wood);top.rotation.x=-Math.PI/2;
    const mat=round(2.1,.87,.016,.07,[-.4,1.47,.17],material('#141721'));mat.rotation.x=-Math.PI/2;
    // Monitor and screen, lit with a tiny tiling desktop.
    const monitor=new THREE.Group();monitor.name='project-monitor';monitor.position.set(-.78,0,.05);monitor.rotation.y=Math.PI;scene.add(monitor);
    box([.55,.045,.38],[0,1.49,.1],metal,monitor);box([.10,.35,.1],[0,1.67,-.02],metal,monitor);
    round(1.7,1.03,.10,.055,[0,2.08,0],dark,monitor);
    const desktop=canvasTexture(1024,640,(ctx,w,h)=>{
      ctx.fillStyle='#0d0e19';ctx.fillRect(0,0,w,h);ctx.fillStyle='#252536';ctx.fillRect(12,10,w-24,30);ctx.font='14px monospace';ctx.fillStyle=PINK;ctx.fillText('0 all    1 futurepath    2 pawfect    3 luna wash',24,31);
      const colors=['#c0a7c5','#91aca4','#dcc8b0','#8e9cc7'];for(let i=0;i<4;i++){const x=14+i%2*500,y=52+Math.floor(i/2)*286;ctx.fillStyle='#282737';ctx.fillRect(x,y,486,273);ctx.fillStyle='#f1e7e5';ctx.font='bold 19px monospace';ctx.fillText(['FuturePath AI','PawFect','LÜNA WASH','abdullah@desk:~'][i],x+15,y+28);ctx.fillStyle=i===3?'#10121b':colors[i];ctx.fillRect(x+8,y+41,470,224);if(i===3){ctx.fillStyle=PINK;ctx.font='15px monospace';ctx.fillText('$ building intelligent systems',x+20,y+80);ctx.fillStyle='#b8b2c7';ctx.fillText('Python · React · Machine learning',x+20,y+111);}else{ctx.fillStyle='#242332';ctx.font='bold 30px sans-serif';ctx.fillText(['One decision.','Care for your','A fresh start.'][i],x+25,y+112);ctx.fillText(['Three paths.','best friend.','Every day.'][i],x+25,y+150);}}
    });resources.push(desktop);
    const monitorScreen=plane(1.56,.89,[0,2.08,.085],new THREE.MeshBasicMaterial({map:desktop}),monitor);monitorScreen.name='monitor-screen';monitorScreen.userData.go='projects';
    box([1.6,.035,.025],[0,1.58,.07],metal,monitor);
    // Keyboard, mouse and trackpad detail.
    const keyboard=box([1.03,.055,.37],[-.62,1.52,-.57],cream);keyboard.name='keyboard';
    const keymat=material('#dad4d3');for(let r=0;r<4;r++)for(let c=0;c<14;c++)box([.056,.023,.055],[-1.08+c*.07,1.56,-.70+r*.075],c===0?dark:keymat);
    const mouse=sphere(.095,[.18,1.53,-.57],cream);mouse.scale.set(.75,.52,1.15);box([.012,.03,.04],[.18,1.575,-.59],dark);

    // Robot: TV head, pale housing, articulated hands and a small antenna.
    const robot=new THREE.Group();robot.name='typing-robot';robot.position.set(-.62,-.38,-1.5);scene.add(robot);
    round(.52,.69,.41,.05,[0,1.83,0],cream,robot);box([.35,.09,.47],[0,1.48,.04],metal,robot);
    // Bent legs and an office chair make the seated pose physically grounded.
    for(const x of[-.16,.16]){box([.12,.12,.42],[x,1.4,.2],cream,robot);sphere(.075,[x,1.32,.4],metal,robot);rod([x,1.32,.4],[x,.68,.4],.055,cream,robot);box([.17,.09,.28],[x,.61,.49],dark,robot);}
    round(.68,.13,.65,.07,[0,1.30,.02],dark,robot);
    round(.68,.91,.13,.10,[0,1.82,-.31],metal,robot);
    cylinder(.06,.72,[0,.91,0],metal,robot);
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2,x=Math.sin(a)*.43,z=Math.cos(a)*.43;rod([0,.53,0],[x,.49,z],.028,metal,robot);sphere(.055,[x,.45,z],dark,robot);}
    for(let j=0;j<3;j++)box([.27,.023,.02],[0,1.99-j*.1,.22],metal,robot);
    cylinder(.105,.13,[0,2.22,0],metal,robot);
    round(.91,.72,.57,.12,[0,2.63,0],dark,robot);const robotFace=round(.76,.57,.025,.085,[0,2.63,.30],glowing(PINK,.7,'screens'),robot);robotFace.name='robot-face';
    const eyes=[];for(const x of[-.18,.18]){eyes.push(box([.09,.19,.02],[x,2.65,.365],material('#202134'),robot));}
    round(.95,.07,.61,.03,[0,3.04,0],cream,robot);
    rod([-.18,3.05,0],[-.3,3.24,0],.016,metal,robot);rod([.18,3.05,0],[.3,3.27,0],.016,metal,robot);sphere(.03,[-.3,3.24,0],dark,robot);sphere(.03,[.3,3.27,0],dark,robot);
    const typingArms=[],typingFingers=[];
    for(const side of[-1,1]){
      sphere(.105,[side*.36,2.03,0],metal,robot);rod([side*.37,2.03,0],[side*.47,1.91,.39],.06,cream,robot);sphere(.075,[side*.47,1.91,.39],metal,robot);
      const arm=new THREE.Group();arm.name=side===-1?'typing-left-arm':'typing-right-arm';arm.position.set(side*.47,1.91,.39);robot.add(arm);typingArms.push({arm,phase:side===-1?0:Math.PI});
      rod([0,0,0],[-side*.19,.05,.45],.055,cream,arm);box([.17,.06,.17],[-side*.19,.04,.49],metal,arm);
      for(let j=0;j<4;j++){const finger=box([.025,.04,.14],[-side*.19-.055+j*.037,.04,.57],cream,arm);typingFingers.push({finger,phase:j*1.3+(side===-1?0:2.1)});}
    }
    // Desk lamp with a conical rose shade.
    cylinder(.18,.045,[-2.04,1.47,-.3],metal);rod([-2.04,1.5,-.3],[-2.3,2.13,-.4],.025,metal);rod([-2.3,2.13,-.4],[-2.03,2.48,-.4],.026,metal);
    const shade=add(new THREE.ConeGeometry(.25,.29,28,1,true),material('#ab6289',{side:THREE.DoubleSide}),[-2.03,2.38,-.4]);shade.rotation.z=-.25;
    sphere(.07,[-2.03,2.25,-.4],glowing('#ffe5b3',3,'task'));
    // Phone lying on the desk. Its camera destination opens the contact card.
    const phone=new THREE.Group();phone.position.set(.82,1.49,.63);phone.rotation.set(-Math.PI/2,0,-.23);scene.add(phone);
    round(.3,.57,.035,.055,[0,0,0],metal,phone);round(.26,.52,.005,.04,[0,0,.025],material('#161722'),phone);const ph=plane(.23,.43,[0,-.015,.03],glowing('#aaa0c2',.15),phone);ph.userData.go='contact';
    for(const x of[-.07,.025])sphere(.035,[x,.19,.029],dark,phone);
    // Pinboard and genuinely relevant study/project badges.
    box([2.2,1.37,.07],[2.45,2.91,-3.19],metal);box([2.12,1.29,.08],[2.45,2.91,-3.14],material('#141824'));
    const boardBacklight=glowing('#c4d4ff',.7);
    for(const y of[2.21,3.61])box([2.24,.014,.014],[2.45,y,-3.22],boardBacklight).castShadow=false;
    for(const x of[1.32,3.58])box([.014,1.4,.014],[x,2.91,-3.22],boardBacklight).castShadow=false;
    for(let x=1.45;x<3.45;x+=.09)for(let y=2.33;y<3.5;y+=.09)sphere(.009,[x,y,-3.09],dark);
    const badgeColors=['#ff9ebb','#8cb3c4','#c9b6eb','#edca8b'];
    for(let i=0;i<4;i++){
      const x=1.68+i*.51;box([.015,.43,.015],[x,2.99,-3.04],material(badgeColors[i]));round(.35,.42,.012,.018,[x,2.55,-3.04],cream);
      const badge=canvasTexture(192,224,(ctx,w,h)=>{ctx.fillStyle='#e5dfe2';ctx.fillRect(0,0,w,h);ctx.fillStyle=badgeColors[i];ctx.fillRect(0,0,w,47);ctx.fillStyle='#292b3d';ctx.textAlign='center';ctx.font='bold 15px monospace';ctx.fillText(['COMPUTER SCIENCE','WEB DEVELOPMENT','PYTHON','AI & DATA'][i],w/2,28);ctx.beginPath();ctx.arc(w/2,92,25,0,Math.PI*2);ctx.fill();ctx.fillStyle=badgeColors[i];ctx.font='bold 20px monospace';ctx.fillText(['CS','</>','PY','AI'][i],w/2,99);ctx.fillStyle='#373446';ctx.font='bold 14px monospace';ctx.fillText('ABDULLAH',w/2,145);ctx.font='10px monospace';ctx.fillText(['STUDENT','INDEPENDENT BUILDER','CERTIFIED LEARNING','LEARNING BY BUILDING'][i],w/2,168);for(let j=0;j<16;j++){ctx.fillRect(38+j*7,187,j%3===0?4:2,16);}});resources.push(badge);plane(.33,.40,[x,2.55,-2.999],new THREE.MeshBasicMaterial({map:badge}));
    }
    // Cabinet, speaker, laptop and wireless router at the right of the desk.
    box([1.32,.63,.62],[2.32,.39,-2.44],dark);box([1.38,.08,.67],[2.32,.74,-2.44],metal);box([.018,.56,.03],[2.32,.4,-2.1],seam);for(const x of[2.24,2.4])box([.018,.17,.04],[x,.42,-2.07],material('#bda27d'));
    box([1.26,.018,.02],[2.32,.72,-2.09],glowing('#c5c8eb',.6)).castShadow=false;
    const consoleGlow=plane(2.15,1.3,[2.32,.065,-2.3],glowMaterial('#ba9cdd',.22));consoleGlow.rotation.x=-Math.PI/2;consoleGlow.castShadow=consoleGlow.receiveShadow=false;
    round(.4,.58,.31,.045,[2.05,1.07,-2.4],metal);const speaker=cylinder(.145,.032,[2.05,1.07,-2.22],dark);speaker.rotation.x=Math.PI/2;
    for(const r of[.14,.095]){const ring=add(new THREE.TorusGeometry(r,.012,8,32),material('#bc7f9c',{metalness:.6}),[2.05,1.07,-2.195]);ring.rotation.z=.2;}sphere(.047,[2.05,1.07,-2.19],dark);
    box([1.1,.065,.73],[3.62,.83,-1.96],metal);for(const x of[3.13,4.11])for(const z of[-2.23,-1.68])box([.035,.78,.035],[x,.41,z],dark);
    box([.91,.045,.58],[3.62,.9,-1.97],dark);
    const laptopDisplay=new THREE.Group();laptopDisplay.position.set(3.62,1.22,-2.23);laptopDisplay.rotation.x=-.13;scene.add(laptopDisplay);
    const laptop=round(.91,.58,.035,.025,[0,0,0],metal,laptopDisplay);laptop.userData.go='futurepath';
    const futurePathTexture=new THREE.TextureLoader().load('/assets/screenshots/futurepath-live.webp');futurePathTexture.colorSpace=THREE.SRGBColorSpace;futurePathTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());resources.push(futurePathTexture);
    const laptopScreen=plane(.82,.49,[0,0,.049],new THREE.MeshBasicMaterial({map:futurePathTexture}),laptopDisplay);laptopScreen.name='futurepath-laptop-screen';laptopScreen.userData.go='futurepath';
    box([.5,.08,.3],[3.62,.20,-1.97],cream);for(const x of[3.43,3.81])rod([x,.25,-2.04],[x,.52,-2.04],.013,dark);
    // Left shelf, books, warm lighting and framed pixel art.
    box([.65,.065,2.1],[-4.19,2.1,-1.55],dark);
    box([.018,.022,1.98],[-3.85,2.075,-1.55],glowing('#ffd1a0',1.65)).castShadow=false;
    for(let i=0;i<10;i++){const col=['#28476a','#886982','#bd9181','#62888e'][i%4];box([.35,.42+i%3*.06,.12],[-4.16,2.35+i%3*.03,-2.39+i*.17],material(col));box([.36,.018,.125],[-4.16,2.37+i%3*.03,-2.39+i*.17],cream);}
    const artTexture=canvasTexture(256,320,(ctx,w,h)=>{const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#36345f');g.addColorStop(.5,'#c8839a');g.addColorStop(1,'#ebbb93');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#ecccaa';ctx.fillRect(136,62,50,50);for(let i=0;i<18;i++){ctx.fillStyle=['#423e65','#706080','#ad7f94'][i%3];ctx.fillRect(i*18-20,150+(i*31)%80,45,h);}ctx.fillStyle='#f0c7a9';ctx.font='bold 18px monospace';ctx.fillText('STAY CURIOUS',18,290);});resources.push(artTexture);
    const art=new THREE.Group();art.position.set(-4.49,3.65,-1.6);art.rotation.y=Math.PI/2;scene.add(art);box([.85,1.04,.08],[0,0,0],dark,art);box([.75,.94,.02],[0,0,.05],cream,art);plane(.62,.79,[0,0,.07],new THREE.MeshBasicMaterial({map:artTexture}),art);
    // A soft beanbag and sleeping cat provide the room's quiet corner.
    const bean=sphere(.55,[-3.45,.39,.75],material('#bc8b9a'));bean.scale.set(1,.65,.95);
    const catMat=material('#b9aca5');const cat=sphere(.23,[-3.45,.71,.75],catMat);cat.scale.set(1.4,.55,.9);sphere(.12,[-3.68,.75,.85],catMat);for(const x of[-3.75,-3.62])add(new THREE.ConeGeometry(.055,.1,3),catMat,[x,.84,.85]);
    // A leafy floor plant softens the open corner beside the laptop.
    scene.add(createCornerPlant());
    const wallDecor=createWallDecor({softGlow,reduced});scene.add(wallDecor.group);meshes.push(...wallDecor.interactiveMeshes);resources.push(...wallDecor.textures);
    point('projects','Projects',[-.78,2.7,.10]);point('about','About',[-.62,3.05,-1.5]);point('experience','Experience',[2.45,3.85,-3.04]);point('contact','Contact',[.82,1.85,.63]);
    point('futurepath','FuturePath AI',[3.62,1.88,-2.2]);
    point('blueprint-futurepath','FuturePath AI blueprint',[4.76,4.04,-.45]);point('blueprint-visionguard','VisionGuard blueprint',[4.76,4.04,1.45]);
    const artMarker=point('ml-art','Animate ML artwork',[-4.38,3.46,2.05],wallDecor.playArtwork);artMarker.setAttribute('aria-label','Animate ML artwork');artMarker.title='Trace the best-fit line through the data points.';artMarker.addEventListener('focus',()=>wallDecor.setFocused(true));artMarker.addEventListener('blur',()=>wallDecor.setFocused(false));artMarker.addEventListener('pointerenter',wallDecor.playArtwork);

    // The room wakes in stages: screens, daylight, the lamp, then accent LEDs.
    const roomLighting={base:reduced?1:.035,task:reduced?1:0,accents:reduced?1:0,screens:reduced?1:.65};
    const lightTracks=[],emissiveTracks=[],glowTracks=[],seenMaterials=new Set();
    scene.traverse(object=>{
      if(object.isLight)lightTracks.push({light:object,intensity:object.intensity,stage:object.userData.lightStage||'base'});
      for(const mat of object.material?(Array.isArray(object.material)?object.material:[object.material]):[]){
        if(seenMaterials.has(mat))continue;seenMaterials.add(mat);
        if(!mat.userData.lightStage)continue;
        if(mat.emissive)emissiveTracks.push({mat,intensity:mat.emissiveIntensity,stage:mat.userData.lightStage});
        else if(mat.transparent)glowTracks.push({mat,opacity:mat.opacity,stage:mat.userData.lightStage});
      }
    });
    function illuminateRoom(){
      if(reduced)return;
      gsap.to(roomLighting,{screens:1,duration:.9,ease:'power2.out'});
      gsap.to(roomLighting,{base:1,duration:3.4,delay:.25,ease:'power2.inOut'});
      gsap.to(roomLighting,{task:1,duration:2.1,delay:.4,ease:'power2.inOut'});
      gsap.to(roomLighting,{accents:1,duration:2.6,delay:1,ease:'power2.inOut'});
    }

    const roomHome=()=>host.clientWidth<700?[4.6,4.2,8.4]:home.position;
    const baseFov=()=>host.clientWidth<700?55:43;
    function applyOrbit(yaw=renderOrbit,elevation=renderPitch){
      const desired=roomOrbitPosition(roomHome(),home.target,yaw,elevation);
      const position=constrainRoomCamera(desired,home.target);
      camera.position.fromArray(position);target.fromArray(home.target);
      camera.fov=roomFieldOfView(baseFov(),desired,position,home.target);camera.updateProjectionMatrix();
    }
    function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;if(api.current?.entered&&!current&&!navigating)applyOrbit();else{camera.fov=baseFov();camera.updateProjectionMatrix();}}
    const ro=new ResizeObserver(resize);ro.observe(host);resize();
    const raycaster=new THREE.Raycaster(),hoverPointer=new THREE.Vector2(2,2);let hoverDirty=false;
    function down(e){
      if(current||navigating||!api.current?.entered||!e.isPrimary||e.button!==0||e.target.closest('button,a,input,textarea'))return;
      wallDecor.setHovered(false);host.removeAttribute('data-room-hover');
      drag={x:e.clientX,y:e.clientY,orbit,pitch};dragged=false;host.classList.add('is-dragging');host.setPointerCapture(e.pointerId);
    }
    function move(e){
      if(!drag){const rect=host.getBoundingClientRect();hoverPointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);hoverDirty=true;return;}
      const dx=(e.clientX-drag.x)/host.clientWidth,dy=(e.clientY-drag.y)/host.clientHeight;
      dragged||=Math.abs(dx)+Math.abs(dy)>.008;
      const offset=new THREE.Vector3(...roomHome()).sub(new THREE.Vector3(...home.target));
      const homePhi=Math.acos(offset.y/offset.length());
      orbit=drag.orbit-dx*Math.PI*1.1;
      pitch=THREE.MathUtils.clamp(drag.pitch+dy*Math.PI*.65,.25-homePhi,Math.PI-.25-homePhi);
      if(reduced){renderOrbit=orbit;renderPitch=pitch;applyOrbit();}
    }
    function cancelDrag(){drag=null;host.classList.remove('is-dragging');}
    function up(e){
      if(!drag)return;cancelDrag();if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);if(dragged)return;
      const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
      const hit=raycaster.intersectObjects(meshes).find(hit=>hit.object.userData.go||hit.object.userData.hover);if(hit?.object.userData.go)callbacks.current.onNavigate(hit.object.userData.go);else if(hit?.object.userData.hover)wallDecor.playArtwork();
    }
    function leave(){hoverDirty=false;wallDecor.setHovered(false);host.removeAttribute('data-room-hover');}
    host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',cancelDrag);host.addEventListener('lostpointercapture',cancelDrag);host.addEventListener('pointerleave',leave);
    const clock=new THREE.Clock();renderer.shadowMap.needsUpdate=true;
    function draw(){if(disposed)return;frame=requestAnimationFrame(draw);const t=clock.getElapsedTime(),dt=Math.min(t-previousTime,.05);previousTime=t;
      wallDecor.update(t,dt);
      lightTracks.forEach(({light,intensity,stage})=>light.intensity=intensity*roomLighting[stage]);emissiveTracks.forEach(({mat,intensity,stage})=>mat.emissiveIntensity=intensity*roomLighting[stage]);glowTracks.forEach(({mat,opacity,stage})=>mat.opacity=opacity*roomLighting[stage]);
      if(!reduced){fanRotor.rotation.y=t*.65;robot.rotation.y=Math.sin(t*.35)*.012;const blink=t%5.6>5.43?.12:1;eyes.forEach(eye=>eye.scale.y=blink);typingArms.forEach(({arm,phase})=>arm.rotation.x=Math.sin(t*9+phase)*.022);typingFingers.forEach(({finger,phase})=>finger.position.y=.04-Math.max(0,Math.sin(t*12+phase))*.012);}
      if(api.current?.entered&&!current&&!navigating){const blend=reduced?1:1-Math.exp(-dt*12);renderOrbit+=(orbit-renderOrbit)*blend;renderPitch+=(pitch-renderPitch)*blend;applyOrbit();}
      camera.lookAt(target);camera.updateMatrixWorld();
      if(hoverDirty&&!drag&&!current&&!navigating&&api.current?.entered){raycaster.setFromCamera(hoverPointer,camera);const hit=raycaster.intersectObjects(meshes)[0];const isArt=hit?.object.userData.hover==='ml-art';wallDecor.setHovered(isArt);host.dataset.roomHover=isArt?'art':hit?.object.userData.go?'action':'';hoverDirty=false;}
      for(const {el,point}of hotspots){const p=point.clone().project(camera);el.style.left=`${(p.x*.5+.5)*host.clientWidth}px`;el.style.top=`${(-p.y*.5+.5)*host.clientHeight}px`;el.hidden=!!current||navigating||!api.current?.entered||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;}
      renderer.render(scene,camera);
    }
    api.current={entered:false,go(key,opening=false){
      if(opening)illuminateRoom();
      leave();wallDecor.setFocused(false);
      current=key;navigating=true;cancelDrag();callbacks.current.onDocked(false);gsap.killTweensOf(camera.position);gsap.killTweensOf(target);gsap.killTweensOf(camera);
      const dest=views[key]||home,desired=key?dest.position:roomHome();const position=constrainRoomCamera(desired,dest.target);
      if(!key){orbit=0;pitch=0;renderOrbit=0;renderPitch=0;}
      const duration=reduced?0:opening?3:1.45;
      gsap.to(camera,{fov:roomFieldOfView(baseFov(),desired,position,dest.target),duration,ease:'power3.inOut',onUpdate:()=>camera.updateProjectionMatrix()});
      gsap.to(camera.position,{x:position[0],y:position[1],z:position[2],duration,ease:'power3.inOut'});
      gsap.to(target,{x:dest.target[0],y:dest.target[1],z:dest.target[2],duration,ease:'power3.inOut',onComplete:()=>{if(disposed)return;navigating=false;callbacks.current.onDocked(true);}});
    }};
    draw();callbacks.current.onReady(true);
    return()=>{disposed=true;cancelAnimationFrame(frame);ro.disconnect();gsap.killTweensOf(roomLighting);gsap.killTweensOf(camera.position);gsap.killTweensOf(target);gsap.killTweensOf(camera);cancelDrag();leave();host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',cancelDrag);host.removeEventListener('lostpointercapture',cancelDrag);host.removeEventListener('pointerleave',leave);hotspots.forEach(h=>h.el.remove());scene.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove();api.current=null;};
  },[reduced]);

  useEffect(()=>{if(!api.current||!entered)return;const opening=!api.current.entered;api.current.entered=true;api.current.go(active,opening);},[entered,active]);
  return <div className="desk-scene" ref={mount} aria-label="An interactive 3D room with a robot at a desk. Drag to look around, or use the section navigation." />;
}
