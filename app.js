const defaults={temperature:32,humidity:62,rain:0,wind:18,heat:58,sun:72};
const $=id=>document.getElementById(id);
const inputs=['temperature','humidity','rain','wind','heat','sun'];
const labels={temperature:'temperature-output',humidity:'humidity-output',rain:'rain-output',wind:'wind-output',heat:'heat-output',sun:'sun-output'};
function values(){return Object.fromEntries(inputs.map(id=>[id,Number($(id).value)]));}
function buildShingles(){
  const ns='http://www.w3.org/2000/svg', roof=$('roof-shingles');
  const slopes=[{x:90,y:168,dx:210,dy:-104},{x:300,y:64,dx:210,dy:104}];
  slopes.forEach((s,side)=>{for(let i=0;i<6;i++){
    const x=s.x+s.dx*i/6, y=s.y+s.dy*i/6;
    const anchor=document.createElementNS(ns,'g');
    anchor.setAttribute('transform',`translate(${x} ${y}) rotate(${Math.atan2(s.dy,s.dx)*180/Math.PI})`);
    const blade=document.createElementNS(ns,'path');
    blade.setAttribute('d','M0 -6 L39 -6 L42 5 L0 5 Z');
    blade.setAttribute('class','section-shingle');
    blade.style.transitionDelay=`${(side*6+i)*35}ms`;
    const hinge=document.createElementNS(ns,'circle');
    hinge.setAttribute('class','shingle-hinge'); hinge.setAttribute('r','2.2');
    anchor.append(blade,hinge); roof.append(anchor);
  }});
}
function buildRain(){
  const layer=$('rain-lines');
  for(let i=0;i<34;i++){
    const drop=document.createElement('span');
    drop.className='rain-drop';
    drop.style.left=`${2+(i*37)%96}%`;
    drop.style.top=`${8+(i*29)%85}%`;
    drop.style.height=`${17+(i*11)%29}px`;
    drop.style.animationDelay=`-${((i*0.19)%1.7).toFixed(2)}s`;
    drop.style.animationDuration=`${(.85+(i%6)*.11).toFixed(2)}s`;
    layer.append(drop);
  }
}
function decide(v){
  let mode,title,copy,decision,opening,vent,protection,energy,trend,status,how,icon;
  const wet=v.rain>8||v.humidity>=78, hot=v.temperature>=29||v.heat>=66, cold=v.temperature<=20, windy=v.wind>=70;
  if(cold){mode='Thermal stability';title='Closed to retain stability';copy='Cooler outdoor air makes ventilation unnecessary, so the scales close around the home.';decision='Closed / thermal retention';opening=7;vent='Low';protection='Active';energy=.1;trend='Stable';status='EFFICIENT';how='Outdoor temperature is low enough to retain the indoor climate. The roof avoids unnecessary movement and uses almost no power.';icon='◒'}
  else if(windy||v.rain>=55){mode='Weather shield';title='Closed against the weather';copy='Rain or strong wind takes priority. The overlapping scales create a rain-safe seal.';decision='Closed / weather protection';opening=4;vent='Low';protection='Active';energy=.1;trend=hot?'Holding':'Stable';status='PROTECTED';how=windy?'Strong wind reduces the opening angle to protect the home while preserving thermal stability.':'Rain takes priority over ventilation. The scales close to prevent water entry, even when the inside is warm.';icon='⌁'}
  else if(hot&&wet){mode='Shielded ventilation';title=v.rain>8?'Ventilate, shielded from rain':'Protected ventilation for humid heat';copy=v.rain>8?'Heat calls for airflow, while light rain requires a protected opening.':'Heat calls for airflow, but high humidity asks the roof to stay protected.';decision='Angled scales / protected airflow';opening=42;vent='Medium';protection='Active';energy=.3;trend='Cooling';status='BALANCED';how=v.rain>8?'The roof uses overlapping, angled shingles to vent heat while their downhill overlap deflects light rain. Heavy rain closes the roof fully.':'Temperature and indoor heat call for ventilation, while humidity is high. The roof resolves the conflict with angled scales: air can escape through protected gaps.';icon='⌁'}
  else if(hot){mode='Passive ventilation';title='Open for passive cooling';copy='Warm and relatively dry — the roof opens to release trapped heat.';decision='Open / passive airflow';opening=74;vent='High';protection='Passive';energy=.2;trend='Cooling';status='OPTIMAL';how='The roof reads heat as a reason to vent, while humidity remains low enough for open airflow. No powered cooling is needed in this illustrative state.';icon='⌁'}
  else {mode='Adaptive neutral';title='Partially open / balanced';copy='Conditions are moderate, so the roof maintains a small breathing gap.';decision='Partially open / balanced';opening=26;vent='Low';protection='Passive';energy=.1;trend='Stable';status='BALANCED';how='No single condition dominates. A small opening keeps the roof responsive without over-ventilating the home.';icon='◌'}
  return {mode,title,copy,decision,opening,vent,protection,energy,trend,status,how,icon};
}
function render(){
  const v=values(), r=decide(v);
  inputs.forEach(id=>{$(labels[id]).textContent=id==='temperature'?`${v[id]}°`:`${v[id]}%`});
  $('decision-title').textContent=r.title;
  $('decision-copy').textContent=r.copy;
  $('telemetry-mode').textContent=r.mode.toUpperCase();
  $('telemetry-status').textContent=r.status;
  $('opening-metric').textContent=`${r.opening}%`;
  $('ventilation-metric').textContent=r.vent;
  $('indoor-metric').textContent=r.trend;
  $('energy-metric').textContent=r.energy.toFixed(1);
  $('opening-bar').style.width=`${r.opening}%`;
  $('ventilation-bar').style.width=r.vent==='High'?'92%':r.vent==='Medium'?'58%':'22%';
  $('indoor-bar').style.width=r.trend==='Cooling'?'34%':r.trend==='Warming'?'82%':'52%';
  $('energy-bar').style.width=`${Math.min(r.energy/3*100,100)}%`;
  $('sensor-outdoor').textContent=`${v.temperature}°C`;
  $('sensor-indoor').textContent=`${(v.temperature+(v.heat*.06)-(r.opening*.018)).toFixed(1)}°C`;
  $('sensor-humidity').textContent=`${v.humidity}%`;
  $('sensor-rain').textContent=r.protection==='Active'?(v.rain>8?'ACTIVE':'READY'):'OPEN';
  $('how-decided').textContent=r.how;
  const canvas=$('scene-canvas'); canvas.className=`scene-canvas mode-${r.mode.toLowerCase().replaceAll(' ','-')}`;
  const sunStrength=Math.max(.04,(v.sun/100)*(1-v.rain/105));
  canvas.style.setProperty('--sun-strength',sunStrength.toFixed(2));
  document.querySelector('.scene-sun').style.opacity=(.08+sunStrength*.92).toFixed(2);
  document.querySelectorAll('.section-shingle').forEach(blade=>{blade.style.transform=`rotate(${-r.opening*.65}deg)`});
  $('section-air').style.opacity=r.vent==='High'?'1':r.vent==='Medium'?'.55':'0';
  $('section-heat').style.opacity=r.trend==='Cooling'?'.3':'1';
  const rain=$('rain-lines');
  rain.style.opacity=v.rain>0?Math.min(1,.22+v.rain/85).toFixed(2):'0';
  rain.querySelectorAll('.rain-drop').forEach((drop,i)=>{drop.style.visibility=i<Math.ceil(v.rain/3)?'visible':'hidden'});
}
function placeDeviceNodes(){
  const {width,height}=$('scene-canvas').getBoundingClientRect();
  const scale=Math.min(width/600,height/300);
  const offsetX=(width-600*scale)/2, offsetY=(height-300*scale)/2;
  document.querySelectorAll('.device-node').forEach(node=>{
    node.style.left=`${offsetX+Number(node.dataset.x)*scale}px`;
    node.style.top=`${offsetY+Number(node.dataset.y)*scale}px`;
  });
}
inputs.forEach(id=>$(id).addEventListener('input',render));
$('reset-button').addEventListener('click',()=>{inputs.forEach(id=>$(id).value=defaults[id]);render()});
buildShingles();
buildRain();
render();
placeDeviceNodes();
new ResizeObserver(placeDeviceNodes).observe($('scene-canvas'));
