(function(){
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var form = document.getElementById("email-form");
  var field = document.getElementById("field");
  var wrap = document.querySelector(".code-field");
  var dots = document.querySelector(".code-dots");
  var fail = document.querySelector(".w-form-fail");

  function syncField(){
    if(!field || !wrap) return;
    var has = field.value.length > 0;
    wrap.classList.toggle("has-value", has);
    wrap.classList.toggle("is-active", document.activeElement === field);
    if(!dots) return;
    var n = field.value.length;
    var current = dots.children.length;
    if(n > current){
      for(var i=current;i<n;i++){
        var el = document.createElement("i");
        dots.appendChild(el);
      }
    } else if(n < current){
      while(dots.children.length > n) dots.removeChild(dots.lastChild);
    }
  }

  function showError(){
    if(!fail) return;
    fail.classList.add("is-visible");
    fail.setAttribute("data-open","true");
    fail.removeAttribute("hidden");
    if(form) form.classList.add("has-error");
    if(field){
      field.setAttribute("aria-invalid","true");
      field.setAttribute("aria-describedby","password-error");
    }
    if(form && !reduce){
      form.classList.remove("is-shake");
      void form.offsetWidth;
      form.classList.add("is-shake");
      form.addEventListener("animationend", function h(){
        form.classList.remove("is-shake");
        form.removeEventListener("animationend", h);
      });
    }
  }

  function hideError(){
    if(!fail) return;
    fail.classList.remove("is-visible");
    fail.setAttribute("data-open","false");
    if(form) form.classList.remove("has-error");
    if(field){
      field.removeAttribute("aria-invalid");
    }
  }

  if(field){
    field.addEventListener("focus", syncField);
    field.addEventListener("blur", syncField);
    field.addEventListener("input", function(){
      hideError();
      syncField();
    });
  }

  if(form){
    form.addEventListener("submit", function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      showError();
      if(field) field.focus();
    });
  }

  // Webflow shows the fail state when the URL has ?e=1
  if(/[?&]e=1(?:&|$)/.test(location.search)){
    showError();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", syncField);
  } else {
    syncField();
  }
})();
