
(function(){
var rail=document.querySelector('.rail');if(!rail)return;
var bar=document.querySelector('.prog i'),prev=document.querySelector('.ctrl .p'),next=document.querySelector('.ctrl .n');
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function upd(){var max=rail.scrollWidth-rail.clientWidth,f=max>0?rail.scrollLeft/max:0,w=Math.max(.12,rail.clientWidth/rail.scrollWidth);
 bar.style.width=(w*100)+'%';bar.style.transform='translateX('+(f*(1/w-1)*100)+'%)';
 if(prev)prev.disabled=rail.scrollLeft<4;if(next)next.disabled=rail.scrollLeft>max-4}
function step(d){var it=rail.querySelector('.it');var s=it.getBoundingClientRect().width+parseFloat(getComputedStyle(rail).columnGap||32);
 rail.scrollBy({left:d*s,behavior:reduce?'auto':'smooth'})}
prev&&prev.addEventListener('click',function(){step(-1)});next&&next.addEventListener('click',function(){step(1)});
rail.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
rail.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();step(1)}if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}});
/* mouse drag; touch uses native swipe */
var down=false,x0=0,s0=0,moved=false;
rail.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;x0=e.clientX;s0=rail.scrollLeft});
addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-x0;if(Math.abs(dx)>6){moved=true;rail.classList.add('drag')}if(moved)rail.scrollLeft=s0-dx});
addEventListener('pointerup',function(){if(!down)return;down=false;rail.classList.remove('drag')});
rail.addEventListener('click',function(e){if(moved){e.preventDefault();moved=false}},true);
rail.querySelectorAll('img').forEach(function(i){i.draggable=false});
})();
