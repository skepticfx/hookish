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
    invalid: function(el, target){
      if(el.id === 'dragToMeInfo')
        return true;
      if(el.id === 'identifyFlowsButton')
        return true;
    },
    accepts: function(el, target, source, sibling){
      if(el.id === 'dragToMeInfo') return false;
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
    selected[el.getAttribute('data-type') + 's'].pushIfNotExist(el.getAttribute('data-name'), function(e){ return e === el.getAttribute('data-name')});
  }

  if(source.id === 'dragToMe' && (container.id === 'sources' || container.id === 'sinks')){
    selected[el.getAttribute('data-type') + 's'].removeElement(el.getAttribute('data-name'));
  }

  updateDragMeInfo();
});


drake.on('shadow', function(el, container){
  if(container.id === 'dragToMe'){
    $('dragToMeInfo').style.display = 'none';
  }
});

drake.on('dragend', function(el){
  updateDragMeInfo();
});

function $ (id) {
  return document.getElementById(id);
}


function updateDragMeInfo(){
  if(selected.sources.length + selected.sinks.length === 0){
    $('dragToMeInfo').style.display = 'block';
    $('identifyFlowsButton').style.display = 'none';
  } else {
    $('dragToMeInfo').style.display = 'none';
      if(selected.sources.length >= 1 && selected.sinks.length >= 1){
        $('identifyFlowsButton').style.display = 'block';
      } else {
        $('identifyFlowsButton').style.display = 'none';
      }
  }
}


document.addEventListener("DOMContentLoaded", function(event) {
  $('identifyFlowsButton').onclick = function(e){
    identifyDomFlows(selected.sources, selected.sinks);
  };


});