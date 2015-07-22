'use strict';

Array.prototype.inArray = function(comparer) {
  for(var i=0; i < this.length; i++) {
    if(comparer(this[i])) return true;
  }
  return false;
};

Array.prototype.pushIfNotExist = function(element, comparer) {
  if (!this.inArray(comparer)) {
    this.push(element);
  }
};

Array.prototype.removeElement = function(el){
  var index = this.indexOf(el);
  return this.splice(index, 1);
};

var selected = {};
selected.sources = [];
selected.sinks = [];


var drake = dragula([$('sources'), $('sinks'), $('dragToMe')],{
    revertOnSpill: true,
    accepts: function(el, target, source, sibling){
      if(target.id === 'dragToMe')
        return true;
      if((target.id === 'sinks' && el.getAttribute('data-type') === 'source') || (target.id === 'sources' && el.getAttribute('data-type') === 'sink'))
        return false;
      return true;
    }
  }
);

drake.on('drop', function(el, container, source){
  if(container.id === 'dragToMe'){
    selected[el.getAttribute('data-type') + 's'].pushIfNotExist(el.innerText, function(e){ return e === el.innerText});
    console.log(selected.sources, selected.sinks)
  }

  if(source.id === 'dragToMe' && (container.id === 'sources' || container.id === 'sinks')){
    selected[el.getAttribute('data-type') + 's'].removeElement(el.innerText);
    console.log(selected.sources, selected.sinks)
  }
});


function $ (id) {
  return document.getElementById(id);
}

