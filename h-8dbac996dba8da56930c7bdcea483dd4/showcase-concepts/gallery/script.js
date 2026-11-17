(function(){
var tabs=[].slice.call(document.querySelectorAll('.tab')),panels=[].slice.call(document.querySelectorAll('.panel')),cnt=document.querySelector('.count'),pv=document.querySelector('.nav2 .p'),nx=document.querySelector('.nav2 .n');
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function cur(){return panels.filter(function(p){return !p.hidden})[0].querySelector('.track')}
function upd(){var t=cur(),its=[].slice.call(t.querySelectorAll('.it')),x=t.scrollLeft,i=Math.min(its.length-1,Math.round(x/(its[0].offsetWidth+24)));
 cnt.textContent=('0'+(i+1)).slice(-2)+' / '+('0'+its.length).slice(-2);
 var max=t.scrollWidth-t.clientWidth;pv.disabled=x<4;nx.disabled=x>max-4}
function sel(k){tabs.forEach(function(t,j){t.setAttribute('aria-selected',j===k);t.tabIndex=j===k?0:-1});panels.forEach(function(p,j){p.hidden=j!==k});cur().scrollLeft=0;upd()}
tabs.forEach(function(t,k){t.addEventListener('click',function(){sel(k)});t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var j=(k+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;sel(j);tabs[j].focus()}})});
function step(d){var t=cur(),it=t.querySelector('.it');t.scrollBy({left:d*(it.getBoundingClientRect().width+24),behavior:reduce?'auto':'smooth'})}
pv.addEventListener('click',function(){step(-1)});nx.addEventListener('click',function(){step(1)});
[].forEach.call(document.querySelectorAll('.track'),function(t){t.addEventListener('scroll',upd,{passive:true});
 var down=false,x0=0,s0=0,mv=false;
 t.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;mv=false;x0=e.clientX;s0=t.scrollLeft});
 addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-x0;if(Math.abs(dx)>6){mv=true;t.classList.add('drag')}if(mv)t.scrollLeft=s0-dx});
 addEventListener('pointerup',function(){down=false;t.classList.remove('drag')});
 t.addEventListener('click',function(e){if(mv){e.preventDefault();mv=false}},true);
 [].forEach.call(t.querySelectorAll('img'),function(i){i.draggable=false})});
addEventListener('resize',upd);sel(0);
})();