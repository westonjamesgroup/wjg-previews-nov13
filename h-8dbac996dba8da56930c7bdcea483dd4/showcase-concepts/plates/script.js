(function(){var b=[].slice.call(document.querySelectorAll('.band'));
if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){b.forEach(function(e){e.classList.add('in')});return}
var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{threshold:.25});
b.forEach(function(e){o.observe(e)})})();