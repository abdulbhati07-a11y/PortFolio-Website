import * as THREE from 'three';

export function createCornerPlant() {
  const plant=new THREE.Group();plant.name='corner-plant';plant.position.set(4.25,0,-2.72);plant.scale.set(.88,1,.88);
  const ceramic=new THREE.MeshStandardMaterial({color:'#b6aaa1',roughness:.86});
  const soil=new THREE.MeshStandardMaterial({color:'#29231f',roughness:1});
  const stem=new THREE.MeshStandardMaterial({color:'#40533b',roughness:.83});
  const vein=new THREE.MeshStandardMaterial({color:'#6b8051',roughness:.85});
  const greens=['#315c47','#436f50','#557a54'].map(color=>new THREE.MeshStandardMaterial({color,roughness:.78,side:THREE.DoubleSide}));
  const mesh=(geometry,material,parent=plant)=>{const result=new THREE.Mesh(geometry,material);result.castShadow=result.receiveShadow=true;parent.add(result);return result;};
  const saucer=mesh(new THREE.CylinderGeometry(.33,.31,.035,32),ceramic);saucer.position.y=.018;
  const pot=mesh(new THREE.CylinderGeometry(.29,.23,.44,32),ceramic);pot.position.y=.255;
  const dirt=mesh(new THREE.CylinderGeometry(.274,.274,.012,32),soil);dirt.position.y=.479;
  const rim=mesh(new THREE.TorusGeometry(.282,.018,8,32),ceramic);rim.rotation.x=Math.PI/2;rim.position.y=.475;
  const stalk=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.48,0),new THREE.Vector3(.015,.95,.015),new THREE.Vector3(-.035,1.4,-.02),new THREE.Vector3(.015,1.83,.01)]);
  mesh(new THREE.TubeGeometry(stalk,20,.013,6,false),stem);

  for(let i=0;i<12;i++){
    const angle=i*2.39996,height=.78+i*.083,length=.47+(i%3)*.025,width=.135+(i%3)*.014;
    const start=new THREE.Vector3(0,height,0),end=new THREE.Vector3(Math.sin(angle)*.12,height+.10,Math.cos(angle)*.12);
    const branch=new THREE.CatmullRomCurve3([start,new THREE.Vector3(end.x*.5,height+.07,end.z*.5),end]);
    mesh(new THREE.TubeGeometry(branch,6,.007,5,false),stem);
    const leaf=new THREE.Group();leaf.name=`plant-leaf-${i+1}`;leaf.position.copy(end);leaf.rotation.set(-.18-(i%3)*.08,angle,0,'YXZ');plant.add(leaf);
    const positions=[],indices=[],segments=12;
    for(let row=0;row<=segments;row++){
      const t=row/segments,spread=Math.pow(Math.sin(Math.PI*t),.75)*width;
      for(let col=-1;col<=1;col++)positions.push(col*spread,.07*Math.sin(Math.PI*t)-.06*t*t-Math.abs(col)*.03*Math.sin(Math.PI*t),t*length);
    }
    for(let row=0;row<segments;row++)for(let col=0;col<2;col++){const a=row*3+col,b=a+3;indices.push(a,b,a+1,b,b+1,a+1);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    mesh(geometry,greens[i%greens.length],leaf);
    const centerVein=new THREE.CatmullRomCurve3([new THREE.Vector3(),new THREE.Vector3(0,.055,length*.45),new THREE.Vector3(0,-.058,length*.97)]);
    mesh(new THREE.TubeGeometry(centerVein,10,.0025,3,false),vein,leaf);
  }
  return plant;
}
