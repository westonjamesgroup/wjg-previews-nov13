(function(){
var steps=[].slice.call(document.querySelectorAll('.step')),imgs=[].slice.call(document.querySelectorAll('.stage img')),stage=document.querySelector('.stage'),
cap=document.querySelector('.scap .smc'),cr=document.querySelector('.scap .cr'),cur=-1;
function set(i){if(i===cur)return;cur=i;steps.forEach(function(s,k){s.classList.toggle('on',k===i)});imgs.forEach(function(m,k){m.classList.toggle('on',k===i)});
 var s=steps[i];cap.textContent=s.dataset.cap;cr.textContent=s.dataset.cr||'';stage.href=s.querySelector('a.go').href;stage.setAttribute('aria-label',s.dataset.title)}
function pick(){var mid=innerHeight*.5,best=0,bd=1e9;steps.forEach(function(s,k){var r=s.getBoundingClientRect(),c=r.top+r.height/2,d=Math.abs(c-mid);if(d<bd){bd=d;best=k}});set(best)}
addEventListener('scroll',pick,{passive:true});addEventListener('resize',pick);
steps.forEach(function(s,k){s.addEventListener('focusin',function(){set(k)});s.addEventListener('mouseenter',function(){set(k)})});
set(0);pick();
})();