import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { constrainRoomCamera, roomOrbitPosition, roomFieldOfView, advanceRoomPitch } from '../../lib/roomCamera';
import { createCornerPlant } from './CornerPlant';
import { createWallDecor } from './WallDecor';
import { ROOM_PULLBACK_DELAY, ROOM_PULLBACK_DURATION, ROOM_REVEAL_DELAY } from '../../lib/roomIntro';
import { batchRoomMeshes } from '../../lib/batchRoomMeshes';
import { createInteractiveCat } from './InteractiveCat';
import { createRobotGaze } from '../../lib/robotGaze';
import { createRobotMechanics } from './RobotMechanics';

const PINK = '#edabc3';
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

export default function RoomScene({ entered, active, onReady, onNavigate, onDocked, reduced, music, cameraControl }) {
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
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
    host.appendChild(renderer.domElement);
    const scene=new THREE.Scene();scene.background=new THREE.Color('#1a1d2c');scene.fog=new THREE.FogExp2('#1a1d2c',.017);
    const camera=new THREE.PerspectiveCamera(43,1,.05,90);
    const target=new THREE.Vector3(-.62,2.25,-1.16);
    camera.position.set(-.62,2.25,-.45);
    const meshes=[],resources=[],hotspots=[];
    let navigating=false,current=null,disposed=false,frame,drag=null,dragged=false,orbit=0,pitch=0,renderOrbit=0,renderPitch=0,previousTime=0;
    const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
    const dark=material('#242938'),metal=material('#343b4c',{metalness:.48,roughness:.43}),wood=material('#514047'),cream=material('#cbbeb3');
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
    const instances=(geometry,mat,positions,name)=>{
      const batch=new THREE.InstancedMesh(geometry,mat,positions.length),matrix=new THREE.Matrix4();
      positions.forEach((position,index)=>batch.setMatrixAt(index,matrix.makeTranslation(...position)));
      batch.instanceMatrix.needsUpdate=true;batch.name=name;batch.castShadow=true;batch.receiveShadow=true;batch.computeBoundingSphere();scene.add(batch);return batch;
    };
    const plane=(w,h,pos,mat,parent)=>add(new THREE.PlaneGeometry(w,h),mat,pos,parent);
    const markerTaglines={
      projects:'Explore my projects',
      about:'Meet the developer',
      experience:'Explore my experience',
      contact:'Let’s build together',
      futurepath:'Explore FuturePath AI',
      spotify:'Play your soundtrack',
      cat:'Say hello kitty',
      'blueprint-futurepath':'Inside FuturePath AI',
      'blueprint-visionguard':'Explore VisionGuard blueprint',
      'ml-art':'Watch data connect',
    };
    function point(key,label,position,action) {
      const el=document.createElement('button');el.className='room-marker';el.dataset.roomObject=key;el.type='button';el.setAttribute('aria-label',`Open ${label}`);el.setAttribute('aria-describedby',`room-tip-${key}`);el.innerHTML=`<span class="marker-diamond" aria-hidden="true"></span><span class="marker-label" id="room-tip-${key}" role="tooltip">${markerTaglines[key]}</span>`;
      el.addEventListener('click',action||(()=>callbacks.current.onNavigate(key)));host.appendChild(el);
      hotspots.push({el,point:new THREE.Vector3(...position)});
      return el;
    }

    // Indirect dusk light, a warm desk lamp and the pink glow of the robot.
    const hemisphere=new THREE.HemisphereLight('#d9d8e8','#60535d',1.35);scene.add(hemisphere);
    const sun=new THREE.DirectionalLight('#ffe0c2',1.35);sun.position.set(-3,5,-5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:24});sun.shadow.bias=-.001;scene.add(sun);
    const fill=new THREE.DirectionalLight('#bbc8df',1.08);fill.position.set(3,4,6);scene.add(fill);
    const pinkLight=new THREE.PointLight(PINK,1.05,4,2);pinkLight.position.set(-.62,2.65,-.65);scene.add(pinkLight);
    const lampLight=new THREE.PointLight('#ffe2bf',6.4,4,2);lampLight.position.set(-2.1,2.3,-.3);lampLight.castShadow=true;scene.add(lampLight);
    pinkLight.userData.lightStage=lampLight.userData.lightStage='task';

    // Herringbone floor and dark acoustic wall panels.
    const floorTex=canvasTexture(1024,1024,(ctx)=>{
      ctx.fillStyle='#4c4449';ctx.fillRect(0,0,1024,1024);
      for(let row=-4;row<18;row++)for(let col=-4;col<18;col++){
        ctx.save();ctx.translate(col*100+row%2*50,row*100);ctx.rotate(Math.PI/4);
        for(let k=0;k<2;k++){ctx.fillStyle=['#51474d','#574c50','#4b454d','#5b4e51'][(row+col+k+40)%4];ctx.fillRect(k*39,0,37,160);ctx.strokeStyle='#443d46';ctx.lineWidth=2;ctx.strokeRect(k*39,0,37,160);for(let j=0;j<4;j++){ctx.strokeStyle='#ffffff07';ctx.beginPath();ctx.moveTo(k*39+7+j*7,0);ctx.lineTo(k*39+7+j*7,160);ctx.stroke();}}
        ctx.restore();
      }
    });floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(3,3);resources.push(floorTex);
    box([10,.12,9],[0,-.08,.1],material('#aaa1a3',{map:floorTex,roughness:.85}));
    const wall=material('#464653');box([10,5,.12],[0,2.5,-3.4],wall);box([.12,5,8],[-4.6,2.5,.6],wall);
    const seam=material('#343440');
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
    const ceilingPanel=wall.clone();ceilingPanel.emissive.set('#464653');ceilingPanel.emissiveIntensity=.22;ceilingPanel.userData.lightStage='base';
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
    const deskGlow=plane(5.4,3.9,[-.65,.058,.1],glowMaterial('#dcc5ad',.24));deskGlow.name='desk-floor-glow';deskGlow.rotation.x=-Math.PI/2;deskGlow.castShadow=deskGlow.receiveShadow=false;
    const underDeskLight=new THREE.PointLight('#ffd4a1',.28,3.2,2);underDeskLight.name='desk-ambient-light';underDeskLight.position.set(-.65,.30,1.3);scene.add(underDeskLight);
    const shelfLight=new THREE.PointLight('#f2d7b8',1.9,2.6,2);shelfLight.name='shelf-ambient-light';shelfLight.position.set(-4.01,1.94,-1.55);scene.add(shelfLight);
    underDeskLight.userData.lightStage=shelfLight.userData.lightStage='accents';
    const shelfWash=plane(2.65,1.55,[-4.505,1.7,-1.55],glowMaterial('#efd5ba',.14));shelfWash.rotation.y=Math.PI/2;shelfWash.castShadow=shelfWash.receiveShadow=false;
    const pinboardHalo=plane(3.6,2.3,[2.45,2.91,-3.285],glowMaterial('#b8c6e8',.27));pinboardHalo.name='pinboard-halo';pinboardHalo.castShadow=pinboardHalo.receiveShadow=false;
    const pinboardLight=new THREE.PointLight('#c0cde8',.55,2.2,2);pinboardLight.position.set(2.45,3,-3.265);pinboardLight.userData.lightStage='accents';scene.add(pinboardLight);

    // A city at dusk, painted into the view beyond the window.
    const city=canvasTexture(1536,1024,(ctx,w,h)=>{
      const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#565b87');sky.addColorStop(.28,'#977c9c');sky.addColorStop(.56,'#d59aab');sky.addColorStop(.8,'#e3b29f');sky.addColorStop(1,'#d5b9aa');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      ctx.fillStyle='#f4c5ad';ctx.beginPath();ctx.arc(310,345,65,0,Math.PI*2);ctx.fill();
      let seed=7;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
      for(let layer=0;layer<3;layer++){for(let x=-30;x<w;x+=85+random()*65){const bw=85+random()*130,bh=160+random()*(layer===0?340:490),y=h-bh+layer*30;ctx.fillStyle=layer===0?'#8c7e94':layer===1?'#6a657e':'#4d536c';ctx.fillRect(x,y,bw,bh);ctx.fillStyle='#514658';ctx.fillRect(x-4,y,bw+8,7);for(let a=x+10;a<x+bw-10;a+=20)for(let b=y+16;b<h;b+=29){ctx.fillStyle=random()>.54?'#e7c9a1':random()>.6?'#978e9c':'#4f4c5d';ctx.fillRect(a,b,10,16);}}}
      for(const [x,y,s]of[[290,830,1.1],[1090,740,.9],[760,990,1.35]]){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle='#333d3b';ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(0,150);ctx.quadraticCurveTo(15,-110,0,-240);ctx.stroke();for(let i=0;i<9;i++){const angle=i/9*Math.PI*2;ctx.save();ctx.translate(0,-235);ctx.rotate(angle);ctx.fillStyle=i%2?'#425249':'#53604e';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(80,-65,200,20);ctx.quadraticCurveTo(75,-20,0,0);ctx.fill();ctx.restore();}ctx.restore();}
    });resources.push(city);
    box([3.94,3.05,.12],[-1.45,3.0,-3.20],metal);
    plane(3.74,2.86,[-1.45,3.0,-3.12],new THREE.MeshBasicMaterial({map:city,color:'#b6bfd1'}));
    box([.055,3,.07],[-1.45,3,-3.05],dark);box([3.98,.1,.24],[-1.45,1.49,-3.05],dark);

    // Rug, rounded desk and subtle warm perimeter strip.
    box([4.8,.025,3.6],[-.65,.01,.1],material('#777c90'));box([4.54,.028,3.34],[-.65,.025,.1],dark);box([4.46,.03,3.26],[-.65,.03,.1],material('#87818b'));box([4.26,.032,3.06],[-.65,.035,.1],material('#6c6875'));
    round(3.6,1.15,1.65,.15,[-.65,.64,.1],material('#252633'));
    const strip=round(3.78,.07,1.8,.15,[-.65,1.235,.1],glowing('#d6af91',.36));strip.castShadow=false;
    const underDeskStrip=glowing('#d6b399',.32);
    box([3.26,.022,.018],[-.65,.14,.965],underDeskStrip).castShadow=false;
    for(const x of[-2.47,1.17])box([.018,.022,1.42],[x,.14,.1],underDeskStrip).castShadow=false;
    round(3.8,.12,1.84,.18,[-.65,1.32,.1],wood);
    // Desktop is an extruded rounded rectangle turned flat.
    const top=round(3.8,1.84,.1,.18,[-.65,1.4,.1],wood);top.rotation.x=-Math.PI/2;
    const mat=round(2.1,.87,.016,.07,[-.4,1.47,.17],material('#141721'));mat.rotation.x=-Math.PI/2;
    // Monitor and screen, lit with a tiny tiling desktop.
    const monitor=new THREE.Group();monitor.name='project-monitor';monitor.position.set(-.78,0,.05);monitor.rotation.y=Math.PI;scene.add(monitor);
    const monitorAlloy=material('#656575',{metalness:.72,roughness:.38});
    const monitorHousing=material('#303442',{metalness:.26,roughness:.54});
    const monitorInset=material('#171d28',{roughness:.76});
    // Weighted foot, articulated neck and a layered rear housing give the
    // monitor a believable silhouette from both the room and the robot side.
    round(.62,.035,.42,.065,[0,1.49,.02],monitorAlloy,monitor);
    rod([0,1.51,-.08],[0,1.86,-.17],.045,monitorAlloy,monitor);
    const hinge=cylinder(.065,.22,[0,1.84,-.14],metal,monitor);hinge.rotation.z=Math.PI/2;
    round(1.72,1.05,.09,.045,[0,2.08,0],monitorAlloy,monitor);
    round(1.68,1.01,.11,.045,[0,2.08,.012],dark,monitor);
    round(1.58,.91,.085,.07,[0,2.08,-.075],monitorHousing,monitor);
    round(.28,.24,.025,.025,[0,1.86,-.135],metal,monitor);
    // Recessed ventilation, corner fasteners and a restrained manufacturer badge.
    for(let i=0;i<19;i++)box([.035,.058,.008],[-.59+i*.065,2.43,-.13],monitorInset,monitor);
    for(const x of[-.69,.69])for(const y of[1.73,2.40]){
      const screw=cylinder(.012,.008,[x,y,-.13],monitorAlloy,monitor);screw.rotation.x=Math.PI/2;
      box([.012,.002,.002],[x,y,-.136],monitorInset,monitor);
    }
    box([.22,.018,.008],[0,2.30,-.13],monitorAlloy,monitor);
    for(const x of[-.20,-.11,.02])box([.055,.023,.012],[x,1.70,-.13],monitorInset,monitor);
    // Routed display cable follows the stand down to the desktop.
    const monitorCable=new THREE.CatmullRomCurve3([new THREE.Vector3(-.12,1.70,-.14),new THREE.Vector3(-.10,1.61,-.21),new THREE.Vector3(.02,1.53,-.19),new THREE.Vector3(.27,1.48,-.20)]);
    add(new THREE.TubeGeometry(monitorCable,16,.009,6,false),monitorInset,[0,0,0],monitor);

    const desktop=canvasTexture(1024,640,(ctx,w,h)=>{
      ctx.fillStyle='#0d0e19';ctx.fillRect(0,0,w,h);ctx.fillStyle='#252536';ctx.fillRect(12,10,w-24,30);ctx.font='14px monospace';ctx.fillStyle=PINK;ctx.fillText('0 all    1 futurepath    2 pawfect    3 luna wash',24,31);
      const colors=['#c0a7c5','#91aca4','#dcc8b0','#8e9cc7'];for(let i=0;i<4;i++){const x=14+i%2*500,y=52+Math.floor(i/2)*286;ctx.fillStyle='#282737';ctx.fillRect(x,y,486,273);ctx.fillStyle='#f1e7e5';ctx.font='bold 19px monospace';ctx.fillText(['FuturePath AI','PawFect','LÜNA WASH','abdullah@desk:~'][i],x+15,y+28);ctx.fillStyle=i===3?'#10121b':colors[i];ctx.fillRect(x+8,y+41,470,224);if(i===3){ctx.fillStyle=PINK;ctx.font='15px monospace';ctx.fillText('$ building intelligent systems',x+20,y+80);ctx.fillStyle='#b8b2c7';ctx.fillText('Python · React · Machine learning',x+20,y+111);}else{ctx.fillStyle='#242332';ctx.font='bold 30px sans-serif';ctx.fillText(['One decision.','Care for your','A fresh start.'][i],x+25,y+112);ctx.fillText(['Three paths.','best friend.','Every day.'][i],x+25,y+150);}}
    });resources.push(desktop);
    const monitorScreen=plane(1.56,.89,[0,2.08,.085],new THREE.MeshBasicMaterial({map:desktop}),monitor);monitorScreen.name='monitor-screen';monitorScreen.userData.go='projects';
    const projectLabel=canvasTexture(1024,256,(ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#d9b2c5';ctx.font='700 192px monospace';ctx.fillText('PROJECTS',w/2,h/2);});resources.push(projectLabel);
    const monitorBackLabel=plane(1.42,.355,[0,2.13,-.165],new THREE.MeshBasicMaterial({map:projectLabel,transparent:true,depthWrite:false}),monitor);monitorBackLabel.rotation.y=Math.PI;monitorBackLabel.name='projects-monitor-back-label';monitorBackLabel.userData.go='projects';
    box([1.55,.038,.018],[0,1.59,.078],monitorHousing,monitor);
    const powerLed=sphere(.009,[.69,1.60,.09],glowing('#b8c9ce',.35,'screens'),monitor);powerLed.castShadow=false;
    // Keyboard, mouse and trackpad detail.
    const keyboard=box([1.03,.055,.37],[-.62,1.52,-.57],cream);keyboard.name='keyboard';
    const keymat=material('#dad4d3'),lightKeys=[],darkKeys=[];for(let r=0;r<4;r++)for(let c=0;c<14;c++)(c===0?darkKeys:lightKeys).push([-1.08+c*.07,1.56,-.70+r*.075]);
    instances(new THREE.BoxGeometry(.056,.023,.055),keymat,lightKeys,'keyboard-light-keys');instances(new THREE.BoxGeometry(.056,.023,.055),dark,darkKeys,'keyboard-dark-keys');
    const mouse=sphere(.095,[.18,1.53,-.57],cream);mouse.scale.set(.75,.52,1.15);box([.012,.03,.04],[.18,1.575,-.59],dark);

    // Robot: TV head, pale housing, articulated hands and a small antenna.
    const robot=new THREE.Group();robot.name='typing-robot';robot.position.set(-.62,-.38,-1.5);scene.add(robot);
    round(.52,.69,.41,.05,[0,1.83,0],cream,robot);box([.35,.09,.47],[0,1.48,.04],metal,robot);
    const mechanics=createRobotMechanics({add,box,round,cylinder,material,glowing});mechanics.torso(robot);
    // Bent legs and an office chair make the seated pose physically grounded.
    for(const x of[-.16,.16]){box([.12,.12,.42],[x,1.4,.2],cream,robot);sphere(.075,[x,1.32,.4],metal,robot);rod([x,1.32,.4],[x,.68,.4],.055,cream,robot);box([.17,.09,.28],[x,.61,.49],dark,robot);}
    for(const side of[-1,1])mechanics.joint([side*.225,1.32,.4],side,.07,robot);
    round(.68,.13,.65,.07,[0,1.30,.02],dark,robot);
    round(.68,.91,.13,.10,[0,1.82,-.31],metal,robot);
    cylinder(.06,.72,[0,.91,0],metal,robot);
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2,x=Math.sin(a)*.43,z=Math.cos(a)*.43;rod([0,.53,0],[x,.49,z],.028,metal,robot);sphere(.055,[x,.45,z],dark,robot);}
    cylinder(.105,.13,[0,2.22,0],metal,robot);
    const robotHead=new THREE.Group();robotHead.name='robot-tracking-head';robotHead.position.set(0,2.3,0);robot.add(robotHead);
    const headStart=robot.children.length;
    round(.91,.72,.57,.12,[0,2.63,0],dark,robot);const robotFace=round(.76,.57,.025,.085,[0,2.63,.30],glowing(PINK,.7,'screens'),robot);robotFace.name='robot-face';
    const eyes=[];for(const x of[-.18,.18]){eyes.push(box([.09,.19,.02],[x,2.65,.365],material('#202134'),robot));}
    round(.95,.07,.61,.03,[0,3.04,0],cream,robot);
    rod([-.18,3.05,0],[-.3,3.24,0],.016,metal,robot);rod([.18,3.05,0],[.3,3.27,0],.016,metal,robot);sphere(.03,[-.3,3.24,0],dark,robot);sphere(.03,[.3,3.27,0],dark,robot);
    robot.updateWorldMatrix(true,true);robot.children.slice(headStart).forEach(part=>robotHead.attach(part));
    robotHead.scale.setScalar(.94);
    const robotGaze=createRobotGaze(robotHead);
    const typingArms=[],typingFingers=[];
    for(const side of[-1,1]){
      sphere(.105,[side*.36,2.03,0],metal,robot);rod([side*.37,2.03,0],[side*.47,1.91,.39],.06,cream,robot);sphere(.075,[side*.47,1.91,.39],metal,robot);
      mechanics.joint([side*.48,2.03,0],side,.105,robot);
      const arm=new THREE.Group();arm.name=side===-1?'typing-left-arm':'typing-right-arm';arm.position.set(side*.47,1.91,.39);robot.add(arm);typingArms.push({arm,phase:side===-1?0:Math.PI});
      mechanics.joint([side*.078,0,0],side,.073,arm);
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
    const boardBacklight=glowing('#bccce9',.48);
    for(const y of[2.21,3.61])box([2.24,.014,.014],[2.45,y,-3.22],boardBacklight).castShadow=false;
    for(const x of[1.32,3.58])box([.014,1.4,.014],[x,2.91,-3.22],boardBacklight).castShadow=false;
    const pinholes=[];for(let x=1.45;x<3.45;x+=.09)for(let y=2.33;y<3.5;y+=.09)pinholes.push([x,y,-3.09]);
    instances(new THREE.SphereGeometry(.009,18,12),dark,pinholes,'soft-board-pinholes');
    const experienceLabel=canvasTexture(1024,192,(ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#d5d5ec';ctx.font='600 92px monospace';ctx.fillText('EXPERIENCE',w/2,h/2);});resources.push(experienceLabel);
    const boardHeading=plane(1.68,.315,[2.45,3.33,-3.065],new THREE.MeshBasicMaterial({map:experienceLabel,transparent:true,depthWrite:false}));boardHeading.name='experience-board-heading';boardHeading.userData.go='experience';
    const badgeColors=['#ff9ebb','#8cb3c4','#c9b6eb','#edca8b'];
    for(let i=0;i<4;i++){
      const x=1.68+i*.51;box([.015,.43,.015],[x,2.99,-3.04],material(badgeColors[i]));round(.35,.42,.012,.018,[x,2.55,-3.04],cream);
      const badge=canvasTexture(192,224,(ctx,w,h)=>{ctx.fillStyle='#e5dfe2';ctx.fillRect(0,0,w,h);ctx.fillStyle=badgeColors[i];ctx.fillRect(0,0,w,47);ctx.fillStyle='#292b3d';ctx.textAlign='center';ctx.font='bold 15px monospace';ctx.fillText(['COMPUTER SCIENCE','WEB DEVELOPMENT','PYTHON','AI & DATA'][i],w/2,28);ctx.beginPath();ctx.arc(w/2,92,25,0,Math.PI*2);ctx.fill();ctx.fillStyle=badgeColors[i];ctx.font='bold 20px monospace';ctx.fillText(['CS','</>','PY','AI'][i],w/2,99);ctx.fillStyle='#373446';ctx.font='bold 14px monospace';ctx.fillText('ABDULLAH',w/2,145);ctx.font='10px monospace';ctx.fillText(['STUDENT','INDEPENDENT BUILDER','CERTIFIED LEARNING','LEARNING BY BUILDING'][i],w/2,168);for(let j=0;j<16;j++){ctx.fillRect(38+j*7,187,j%3===0?4:2,16);}});resources.push(badge);plane(.33,.40,[x,2.55,-2.999],new THREE.MeshBasicMaterial({map:badge}));
    }
    // Cabinet, speaker, laptop and wireless router at the right of the desk.
    box([1.32,.63,.62],[2.32,.39,-2.44],dark);box([1.38,.08,.67],[2.32,.74,-2.44],metal);box([.018,.56,.03],[2.32,.4,-2.1],seam);for(const x of[2.24,2.4])box([.018,.17,.04],[x,.42,-2.07],material('#bda27d'));
    box([1.26,.018,.02],[2.32,.72,-2.09],glowing('#bec8e1',.45)).castShadow=false;
    const consoleGlow=plane(2.15,1.3,[2.32,.065,-2.3],glowMaterial('#b7a8d5',.16));consoleGlow.rotation.x=-Math.PI/2;consoleGlow.castShadow=consoleGlow.receiveShadow=false;
    const speakerBody=round(.4,.58,.31,.045,[2.05,1.07,-2.4],metal);speakerBody.userData.go='spotify';
    const speaker=cylinder(.145,.032,[2.05,1.07,-2.22],dark);speaker.rotation.x=Math.PI/2;speaker.userData.go='spotify';
    const speakerRingMaterial=material('#bc7f9c',{metalness:.6,emissive:'#8be3b1',emissiveIntensity:0});
    for(const r of[.14,.095]){const ring=add(new THREE.TorusGeometry(r,.012,8,32),speakerRingMaterial,[2.05,1.07,-2.195]);ring.rotation.z=.2;ring.userData.go='spotify';}sphere(.047,[2.05,1.07,-2.19],dark).userData.go='spotify';
    const speakerTexture=canvasTexture(768,256,ctx=>{ctx.fillStyle='#0b1615';ctx.fillRect(0,0,768,256);});resources.push(speakerTexture);
    const speakerDisplay=plane(.35,.117,[2.05,1.287,-2.19],new THREE.MeshBasicMaterial({map:speakerTexture}));speakerDisplay.userData.go='spotify';speakerDisplay.name='spotify-speaker-display';
    function updateSpeaker(state){
      const ctx=speakerTexture.image.getContext('2d');
      ctx.fillStyle='#0b1615';ctx.fillRect(0,0,768,256);
      ctx.fillStyle='#8be3b1';ctx.font='bold 32px monospace';ctx.fillText('SPOTIFY',24,48);
      ctx.fillStyle='#e6f1e9';ctx.font='bold 42px sans-serif';
      const title=state?.title||'Choose a song';
      ctx.fillText(title.length>28?`${title.slice(0,27)}…`:title,24,125,720);
      ctx.fillStyle='#92b2a3';ctx.font='28px monospace';ctx.fillText(state?.isBuffering?'BUFFERING':state?.isPlaying?'NOW PLAYING':state?.uri?'PAUSED / READY':'TAP TO LISTEN',24,207);
      speakerTexture.needsUpdate=true;
      speakerRingMaterial.color.set(state?.isPlaying?'#8be3b1':'#bc7f9c');speakerRingMaterial.emissiveIntensity=state?.isPlaying ? .5 : 0;
      host.dataset.speakerTitle=title;host.dataset.speakerPlaying=String(Boolean(state?.isPlaying));
    }
    updateSpeaker(null);
    box([1.1,.065,.73],[3.62,.83,-1.96],metal);for(const x of[3.13,4.11])for(const z of[-2.23,-1.68])box([.035,.78,.035],[x,.41,z],dark);
    box([.91,.045,.58],[3.62,.9,-1.97],dark);
    const laptopDisplay=new THREE.Group();laptopDisplay.position.set(3.62,1.22,-2.23);laptopDisplay.rotation.x=-.13;scene.add(laptopDisplay);
    const laptop=round(.91,.58,.035,.025,[0,0,0],metal,laptopDisplay);laptop.userData.go='futurepath';
    let finishLaptopTexture;const laptopTextureReady=new Promise(resolve=>{finishLaptopTexture=resolve;});
    const futurePathTexture=new THREE.TextureLoader().load('/assets/screenshots/futurepath-live.webp',finishLaptopTexture,undefined,finishLaptopTexture);futurePathTexture.colorSpace=THREE.SRGBColorSpace;futurePathTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());resources.push(futurePathTexture);
    const laptopScreen=plane(.82,.49,[0,0,.049],new THREE.MeshBasicMaterial({map:futurePathTexture}),laptopDisplay);laptopScreen.name='futurepath-laptop-screen';laptopScreen.userData.go='futurepath';
    box([.5,.08,.3],[3.62,.20,-1.97],cream);for(const x of[3.43,3.81])rod([x,.25,-2.04],[x,.52,-2.04],.013,dark);
    // Left shelf, books, warm lighting and framed pixel art.
    box([.65,.065,2.1],[-4.19,2.1,-1.55],dark);
    box([.018,.022,1.98],[-3.85,2.075,-1.55],glowing('#dfbfa4',.48)).castShadow=false;
    for(let i=0;i<10;i++){const col=['#28476a','#886982','#bd9181','#62888e'][i%4];box([.35,.42+i%3*.06,.12],[-4.16,2.35+i%3*.03,-2.39+i*.17],material(col));box([.36,.018,.125],[-4.16,2.37+i%3*.03,-2.39+i*.17],cream);}
    const artTexture=canvasTexture(256,320,(ctx,w,h)=>{const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#36345f');g.addColorStop(.5,'#c8839a');g.addColorStop(1,'#ebbb93');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#ecccaa';ctx.fillRect(136,62,50,50);for(let i=0;i<18;i++){ctx.fillStyle=['#423e65','#706080','#ad7f94'][i%3];ctx.fillRect(i*18-20,150+(i*31)%80,45,h);}ctx.fillStyle='#f0c7a9';ctx.font='bold 18px monospace';ctx.fillText('STAY CURIOUS',18,290);});resources.push(artTexture);
    const art=new THREE.Group();art.position.set(-4.49,3.65,-1.6);art.rotation.y=Math.PI/2;scene.add(art);box([.85,1.04,.08],[0,0,0],dark,art);box([.75,.94,.02],[0,0,.05],cream,art);plane(.62,.79,[0,0,.07],new THREE.MeshBasicMaterial({map:artTexture}),art);
    const catLight=new THREE.PointLight('#e6c5b0',1.25,2.5,2);catLight.position.set(-2.8,1.65,2.1);catLight.userData.lightStage='accents';scene.add(catLight);
    const robotRim=new THREE.PointLight('#bac8df',1.35,2.8,2);robotRim.position.set(.35,3.35,-1.6);robotRim.userData.lightStage='task';scene.add(robotRim);
    const cat=createInteractiveCat({host,reduced});scene.add(cat.group);meshes.push(...cat.interactiveMeshes);
    // A leafy floor plant softens the open corner beside the laptop.
    scene.add(createCornerPlant());
    const wallDecor=createWallDecor({softGlow,reduced});scene.add(wallDecor.group);meshes.push(...wallDecor.interactiveMeshes);resources.push(...wallDecor.textures);
    point('projects','Projects',[-.78,2.7,.10]);point('about','About',[-.62,3.05,-1.5]);point('experience','Experience',[2.45,3.85,-3.04]);point('contact','Contact',[.82,1.85,.63]);
    point('futurepath','FuturePath AI',[3.62,1.88,-2.2]);
    point('spotify','Spotify speaker',[2.05,1.68,-2.20]);
    const catTarget=point('cat','Pet the cat',cat.anchor,cat.pet);catTarget.classList.add('cat-pet-target');catTarget.setAttribute('aria-label','Pet the cat');
    point('blueprint-futurepath','FuturePath AI blueprint',[4.76,4.04,-.45]);point('blueprint-visionguard','VisionGuard blueprint',[4.76,4.04,1.45]);
    const artMarker=point('ml-art','Animate ML artwork',[-4.38,3.46,2.05],wallDecor.playArtwork);artMarker.setAttribute('aria-label','Animate ML artwork');artMarker.addEventListener('focus',()=>wallDecor.setFocused(true));artMarker.addEventListener('blur',()=>wallDecor.setFocused(false));artMarker.addEventListener('pointerenter',wallDecor.playArtwork);

    batchRoomMeshes(scene,[robot,fanRotor,cat.group,...['pkt-hour-hand','pkt-minute-hand','pkt-second-hand'].map(name=>scene.getObjectByName(name))]);
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
      gsap.to(roomLighting,{screens:1,duration:2.2,delay:ROOM_REVEAL_DELAY,ease:'sine.inOut'});
      gsap.to(roomLighting,{base:1,duration:3.8,delay:ROOM_REVEAL_DELAY,ease:'sine.inOut'});
      gsap.to(roomLighting,{task:1,duration:3.2,delay:ROOM_REVEAL_DELAY+.2,ease:'sine.inOut'});
      gsap.to(roomLighting,{accents:1,duration:3.3,delay:ROOM_REVEAL_DELAY+.45,ease:'sine.inOut'});
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
    const interactiveMeshes=meshes.filter(mesh=>mesh.userData.go||mesh.userData.hover||mesh.userData.action);
    function down(e){
      if(current||navigating||!api.current?.entered||!e.isPrimary||e.button!==0||e.target.closest('button,a,input,textarea'))return;
      wallDecor.setHovered(false);host.removeAttribute('data-room-hover');
      drag={x:e.clientX,y:e.clientY,lastY:e.clientY,orbit};dragged=false;host.classList.add('is-dragging');host.setPointerCapture(e.pointerId);
    }
    function move(e){
      if(!drag){const rect=host.getBoundingClientRect();hoverPointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);hoverDirty=true;return;}
      const dx=(e.clientX-drag.x)/host.clientWidth;
      dragged||=Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7;
      if(!dragged)return;
      if(dragged)robotGaze.begin(camera);
      orbit=drag.orbit-dx*Math.PI*1.1;
      pitch=advanceRoomPitch(pitch,(e.clientY-drag.lastY)/host.clientHeight*Math.PI*.65);drag.lastY=e.clientY;
      if(reduced){renderOrbit=orbit;renderPitch=pitch;applyOrbit();}
    }
    function control(direction){
      if(!api.current?.entered||current||navigating)return;
      cancelDrag();
      if(direction==='reset'){orbit=0;pitch=0;robotGaze.reset();}
      else {robotGaze.begin(camera);if(direction==='left')orbit-=.18;if(direction==='right')orbit+=.18;if(direction==='up')pitch=advanceRoomPitch(pitch,-.09);if(direction==='down')pitch=advanceRoomPitch(pitch,.09);}
      if(reduced){renderOrbit=orbit;renderPitch=pitch;applyOrbit();}
    }
    function keydown(e){const direction={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Home:'reset'}[e.key];if(direction&&e.target===host){e.preventDefault();control(direction);}}
    host.addEventListener('keydown',keydown);
    function cancelDrag(){drag=null;host.classList.remove('is-dragging');}
    function up(e){
      if(!drag)return;cancelDrag();if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);if(dragged)return;
      const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
      const hit=raycaster.intersectObjects(interactiveMeshes)[0];if(hit?.object.userData.action==='pet-cat')cat.pet();else if(hit?.object.userData.go)callbacks.current.onNavigate(hit.object.userData.go);else if(hit?.object.userData.hover)wallDecor.playArtwork();
    }
    function leave(){hoverDirty=false;wallDecor.setHovered(false);host.removeAttribute('data-room-hover');}
    host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',cancelDrag);host.addEventListener('lostpointercapture',cancelDrag);host.addEventListener('pointerleave',leave);
    const clock=new THREE.Clock(),markerPoint=new THREE.Vector3(),lastCameraMatrix=new THREE.Matrix4(),lastProjectionMatrix=new THREE.Matrix4();renderer.shadowMap.needsUpdate=true;
    function draw(){if(disposed)return;frame=requestAnimationFrame(draw);const t=clock.getElapsedTime(),dt=Math.min(t-previousTime,.05);previousTime=t;
      wallDecor.update(t,dt);
      lightTracks.forEach(({light,intensity,stage})=>light.intensity=intensity*roomLighting[stage]);emissiveTracks.forEach(({mat,intensity,stage})=>mat.emissiveIntensity=intensity*roomLighting[stage]);glowTracks.forEach(({mat,opacity,stage})=>mat.opacity=opacity*roomLighting[stage]);
      if(!reduced){fanRotor.rotation.y=t*.65;robot.rotation.y=Math.sin(t*.35)*.012;const blink=t%5.6>5.43?.12:1;eyes.forEach(eye=>eye.scale.y=blink);typingArms.forEach(({arm,phase})=>arm.rotation.x=Math.sin(t*9+phase)*.022);typingFingers.forEach(({finger,phase})=>finger.position.y=.04-Math.max(0,Math.sin(t*12+phase))*.012);}
      if(api.current?.entered&&!current&&!navigating&&(Math.abs(orbit-renderOrbit)+Math.abs(pitch-renderPitch)>1e-5)){const blend=reduced?1:1-Math.exp(-dt*12);renderOrbit+=(orbit-renderOrbit)*blend;renderPitch+=(pitch-renderPitch)*blend;applyOrbit();}
      camera.lookAt(target);camera.updateMatrixWorld();
      robotGaze.update(camera,dt,!!api.current?.entered&&!current&&!navigating,reduced);
      cat.update(camera,!!api.current?.entered&&!current&&!navigating);
      if(hoverDirty&&!drag&&!current&&!navigating&&api.current?.entered){raycaster.setFromCamera(hoverPointer,camera);const hit=raycaster.intersectObjects(interactiveMeshes)[0];const isArt=hit?.object.userData.hover==='ml-art';wallDecor.setHovered(isArt);host.dataset.roomHover=isArt?'art':hit?.object.userData.go||hit?.object.userData.action?'action':'';hoverDirty=false;}
      const cameraChanged=!lastCameraMatrix.equals(camera.matrixWorld)||!lastProjectionMatrix.equals(camera.projectionMatrix);
      for(const {el,point}of hotspots){
        if(current||navigating||!api.current?.entered){if(!el.hidden)el.hidden=true;continue;}
        if(!cameraChanged&&!el.hidden)continue;
        const p=markerPoint.copy(point).project(camera),hidden=p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;
        if(el.hidden!==hidden)el.hidden=hidden;
        if(!hidden){const anchorX=(p.x*.5+.5)*host.clientWidth;el.style.setProperty('--label-shift',`${Math.max(120-anchorX,Math.min(0,host.clientWidth-120-anchorX))}px`);el.style.left=`${anchorX}px`;el.style.top=`${(-p.y*.5+.5)*host.clientHeight}px`;}
      }
      lastCameraMatrix.copy(camera.matrixWorld);lastProjectionMatrix.copy(camera.projectionMatrix);
      renderer.render(scene,camera);
    }
    api.current={entered:false,control,setMusic:updateSpeaker,go(key,opening=false){
      if(opening)illuminateRoom();
      leave();wallDecor.setFocused(false);robotGaze.reset();
      current=key;navigating=true;cancelDrag();callbacks.current.onDocked(false);gsap.killTweensOf(camera.position);gsap.killTweensOf(target);gsap.killTweensOf(camera);
      const dest=views[key]||home,desired=key?dest.position:roomHome();const position=constrainRoomCamera(desired,dest.target);
      if(!key){orbit=0;pitch=0;renderOrbit=0;renderPitch=0;}
      const duration=reduced?0:opening?ROOM_PULLBACK_DURATION:1.45;
      const delay=opening&&!reduced?ROOM_PULLBACK_DELAY:0;
      gsap.to(camera,{fov:roomFieldOfView(baseFov(),desired,position,dest.target),duration,delay,ease:'power3.inOut',onUpdate:()=>camera.updateProjectionMatrix()});
      gsap.to(camera.position,{x:position[0],y:position[1],z:position[2],duration,delay,ease:'power3.inOut'});
      gsap.to(target,{x:dest.target[0],y:dest.target[1],z:dest.target[2],duration,delay,ease:'power3.inOut',onComplete:()=>{if(disposed)return;navigating=false;callbacks.current.onDocked(true);}});
    }};
    // Compile shaders, upload textures and bake the first shadow frame before
    // enabling Enter. The cinematic never has to pay that first-frame cost.
    async function prepare(){
      try {
        await laptopTextureReady;
        if(disposed)return;
        await renderer.compileAsync(scene,camera);
        if(disposed)return;
        for(const texture of resources)if(texture.isTexture&&texture.image)renderer.initTexture(texture);
        renderer.render(scene,camera);
        frame=requestAnimationFrame(()=>{if(disposed)return;draw();callbacks.current.onReady(true);});
      } catch {if(!disposed)callbacks.current.onReady(false);}
    }
    prepare();
    return()=>{disposed=true;cat.dispose();cancelAnimationFrame(frame);ro.disconnect();gsap.killTweensOf(roomLighting);gsap.killTweensOf(camera.position);gsap.killTweensOf(target);gsap.killTweensOf(camera);cancelDrag();leave();host.removeEventListener('keydown',keydown);host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',cancelDrag);host.removeEventListener('lostpointercapture',cancelDrag);host.removeEventListener('pointerleave',leave);hotspots.forEach(h=>h.el.remove());scene.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove();api.current=null;};
  },[reduced]);

  useEffect(()=>{if(!api.current||!entered)return;const opening=!api.current.entered;api.current.entered=true;api.current.go(active,opening);},[entered,active]);
  useEffect(()=>{api.current?.setMusic(music);},[music]);
  useEffect(()=>{if(cameraControl)api.current?.control(cameraControl.direction);},[cameraControl]);
  return <div className="desk-scene" ref={mount} tabIndex={entered&&!active?0:-1} aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home" aria-label="An interactive 3D room with a robot at a desk. Use arrow keys to look around and Home to reset, drag, or use the camera buttons and section navigation." />;
}
