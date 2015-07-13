// Polyfills

// String.prototype.startsWith
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}


var backgroundPage = chrome.extension.getBackgroundPage();

// These are very hook specific and its better to be here for now.
var addToTableBody = {

  stripped: function(data, len) {
    if (len <= 10) return data;
    if (data.length <= len) return data;
    return data.substr(0, len - 4) + " ...";
  },

  document_location_hash: function(obj, node) {
    node.prepend('<tr class="showRowOptions"><td><strong>' + htmlEscape(obj.name) + '</strong></td><td class="callStack" data-callStack="' + htmlEscape(obj.meta) + '">' + htmlEscape(obj.type) + '</td><td title="' + htmlEscape(obj.data) + '">' + this.stripped(htmlEscape(obj.data), 50) + '</td><td>' + htmlEscape(obj.href) + '</td></tr>');
  },

  dom_nodes: function(obj, node) {
    node.prepend('<tr class="showRowOptions '+obj.hookishTagSettings.taintedClassName+'"><td><strong>' + htmlEscape(obj.name) + '</strong></td><td class="callStack" data-callStack="' + htmlEscape(obj.meta) + '">' + htmlEscape(obj.type) + '</td><td title="' + htmlEscape(obj.data) + '">' + this.stripped(htmlEscape(obj.data), 50) + '</td><td>' + htmlEscape(obj.href) + '</td></tr>');
  },

  window_name: function(obj, node) {
    node.prepend('<tr class="showRowOptions"><td><strong>' + htmlEscape(obj.name) + '</strong></td><td class="callStack" data-callStack="' + htmlEscape(obj.meta) + '">' + htmlEscape(obj.type) + '</td><td title="' + htmlEscape(obj.data) + '">' + this.stripped(htmlEscape(obj.data), 50) + '</td><td>' + htmlEscape(obj.href) + '</td></tr>');
  },

  document_referrer: function(obj, node) {
    node.prepend('<tr class="showRowOptions"><td><strong>' + htmlEscape(obj.name) + '</strong></td><td class="callStack" data-callStack="' + htmlEscape(obj.meta) + '">' + htmlEscape(obj.type) + '</td><td title="' + htmlEscape(obj.data) + '">' + this.stripped(htmlEscape(obj.data), 50) + '</td><td>' + htmlEscape(obj.href) + '</td></tr>');
  },

  document_cookie: function(obj, node) {
    node.prepend('<tr class="showRowOptions"><td><strong>' + htmlEscape(obj.name) + '</strong></td><td class="callStack" data-callStack="' + htmlEscape(obj.meta) + '">' + htmlEscape(obj.type) + '</td><td title="' + htmlEscape(obj.data) + '">' + this.stripped(htmlEscape(obj.data), 50) + '</td><td>' + htmlEscape(obj.href) + '</td></tr>');
  },

  dom_text_node_mutation: function(obj, node) {
    node.prepend('<tr class="showRowOptions"><td><strong>' + htmlEscape(obj.name) + '</strong></td><td class="callStack" data-callStack="No CallTracer for DOM Mutation events yet.">' + htmlEscape(obj.type) + '</td><td title="' + htmlEscape(obj.data) + '">' + this.stripped(htmlEscape(obj.data), 50) + '</td><td>' + htmlEscape(obj.href) + '</td></tr>');
  },

  window_eval: function(obj, node) {
    node.prepend('<tr class="showRowOptions"><td><strong>' + htmlEscape(obj.name) + '</strong></td><td class="callStack" data-callStack="' + htmlEscape(obj.meta) + '">' + htmlEscape(obj.type) + '</td><td title="' + htmlEscape(obj.data) + '">' + this.stripped(htmlEscape(obj.data), 50) + '</td><td>' + htmlEscape(obj.href) + '</td></tr>');
  },

  document_write: function(obj, node) {
    node.prepend('<tr class="showRowOptions"><td><strong>' + htmlEscape(obj.name) + '</strong></td><td class="callStack" data-callStack="' + htmlEscape(obj.meta) + '">' + htmlEscape(obj.type) + '</td><td title="' + htmlEscape(obj.data) + '">' + this.stripped(htmlEscape(obj.data), 50) + '</td><td>' + htmlEscape(obj.href) + '</td></tr>');
  },

  ws: function(obj, node) {
    node.prepend('<tr class="showRowOptions"><td>' + htmlEscape(obj.type) + '</td><td>' + htmlEscape(obj.data) + '</td></tr>');
  },

  xhr: function(obj, node) {
    node.prepend('<tr class="showRowOptions"><td>' + htmlEscape(obj.method) + '</td><td>' + htmlEscape(obj.url) + '</td></tr>');
  }

}




function populateSectionTableBodyWithHooks(db) {
  var hookSettingNames = Object.keys(db.settings.hooks);
  hookSettingNames.forEach(function(hookSettingName) {
    var hookSetting = db.settings.hooks[hookSettingName];
    var hooksList = db.hooks[hookSettingName];

    if ((hookSetting.do_not_list_preference_key === undefined || db.settings.preferences[hookSetting.do_not_list_preference_key].enabled !== true) && hookSetting.enabled && hooksList.length > 0) {
      var hookSectionName = hooksList[0].section;
      $('#empty_section_table_body_' + hookSectionName).hide();
      hooksList.forEach(function(actualHookObject) {
        hookSectionName = actualHookObject.section;
        addToTableBody[actualHookObject.name](actualHookObject, $("#section_table_body_" + hookSectionName));
      })
    }
  })
}

function createHookishSection(setting) {
  var displayName = setting.displayName;
  var settingName = setting.settingName;
  var tableHeadings = setting.tableHeadings;
  var section = document.createElement('section');
  section.id = 'section_' + settingName;
  var div1 = document.createElement('div');
  div1.className = 'container';
  var div2 = document.createElement('div');
  div2.className = 'col-lg-12- canToggle';
  var h3 = document.createElement('h3');
  h3.innerText = displayName;
  div2.appendChild(h3);
  div1.appendChild(div2);
  var table = document.createElement('table');
  table.className = 'table table-striped toggleMe';
  table.id = 'section_table_' + settingName;
  var thead = document.createElement('thead');
  var tr = document.createElement('tr');
  tableHeadings.forEach(function(th) {
    var cell = document.createElement('th');
    cell.innerText = th;
    tr.appendChild(cell);
  });
  thead.appendChild(tr);
  table.appendChild(thead);
  var tableBody = document.createElement('tbody');
  tableBody.id = 'section_table_body_' + settingName;
  var tempTr = $('<tr>').append("<td id='empty_section_table_body_" + settingName + "' colspan='4'>No stats collected yet!</td>");
  $(tableBody).append(tempTr);
  table.appendChild(tableBody);
  div1.appendChild(table);
  section.appendChild(div1);

  return section;
}

function populateHookishSections(id, db) {
  var settings = db.sections;
  var body = $('#' + id);
  var settingNames = Object.keys(settings);
  settingNames.forEach(function(settingName) {
    body.append(createHookishSection(settings[settingName]));
  });

  // Add stackTrace wherever applicable. An eventListener on all the table nodes we just setup.
  $('tbody').on('click', '.callStack', function() {
    console.log($(this).data('callstack'));
  });

}

function createSettingsBody(setting) {
  var div1 = $("<div class='row-lg-12'>");
  var checkboxId = "setting_" + setting.settingName;
  var checkboxNode = $("<input type='checkbox' id='" + checkboxId + "' data-size='mini'>");
  var p = $("<p> " + setting.description + " </p>");
  var span = $("<span></span>");
  $(span).append(checkboxNode);
  $(p).append($(span));
  $(div1).append($(p));
  // Enable bootstrapSwitch
  $(checkboxNode).bootstrapSwitch('state', setting.enabled);
  $(checkboxNode).on('switchChange.bootstrapSwitch', function(event, state) {
    chrome.storage.local.get("settings", function(db) {

      db.settings[setting.settingType][setting.settingName].enabled = state;
      chrome.storage.local.set({
        settings: db.settings
      })
    })
  });
  return div1;
}

function populateSettingsBody(id, db) {
  var settings = getAllSettings(db.settings);
  var body = $('#' + id);
  var settingNames = Object.keys(settings);
  settingNames.forEach(function(settingName) {
    body.append(createSettingsBody(settings[settingName]));
  });
}

function promptBootBox(db, preservePerviousConfig){
  bootbox.prompt({
    title: 'Enter the domain you want to run Hookish! (Eg: github.com)',
    value: getHostname(db.domain),
    callback: function(domain) {console.log(domain);
      domain = getHostname(domain);
      if (domain != null && domain.length > 0) {
        db.state = true;
        db.domain = domain;
        chrome.storage.local.set(db);
        chrome.storage.local.set({
          hooks: backgroundPage.initializedDB.hooks
        });

        $('#domain').html(domain);
        setTimeout(function() {
          location.reload()
        }, 200);
        // clear table
      } else {
        if(!preservePerviousConfig) {
          $('#status').bootstrapSwitch('state', false);
          initializeDB();
          $('#domain').html('');
        }
      }
    }
  });
}

function setupPage(db) {
  var statusNode = $('#status');
  var domainNode = $('#domain');
  $(domainNode).click(function(){
    promptBootBox(db, true);
  });

  statusNode.bootstrapSwitch('state', db.state);
  if (db.state) {$('#domain').html(getHostname(db.domain));}

  statusNode.on('switchChange.bootstrapSwitch', function(event, state) {
    if (state == true) {
      promptBootBox(db, false);
    } else {
      initializeDB();
      $('#domain').html('');

      // need to update table,
    }
  });
}


function updateSectionTableBodyWithHooks(changes, db) {
  if (changes.hooks !== null && changes.hooks !== undefined) {
    var hooks = changes.hooks;
    Object.keys(hooks.newValue).forEach(function(hookName) {
      if (hooks.newValue[hookName].length !== hooks.oldValue[hookName].length) {
        var hookObject = hooks.newValue[hookName][hooks.newValue[hookName].length - 1];
        if(db.settings.hooks[hookObject.name].do_not_list_preference_key !== undefined &&
          db.settings.preferences[db.settings.hooks[hookObject.name].do_not_list_preference_key].enabled == true)
            return;
        var hookSectionName = hookObject.section;
        console.log('#empty_section_table_body_' + hookSectionName);
        // Need to optimize to run only when table has no elements.
        $('#empty_section_table_body_' + hookSectionName).hide();
        addToTableBody[hookObject.name](hookObject, $("#section_table_body_" + hookSectionName));
      }
    })
  }

}

// Grabs db.settings and compiles a simple array of objects with all setting types
// For now hooks and preferences
function getAllSettings(settings) {
  var allSettings = [];
  var settingTypes = Object.keys(settings);
  settingTypes.forEach(function(settingType) {
    var currentSettings = Object.keys(settings[settingType]);
    currentSettings.forEach(function(currentSetting) {
      var obj = settings[settingType][currentSetting];
      obj.settingName = currentSetting;
      obj.settingType = settingType;
      allSettings.push(obj)
    })
  })
  return allSettings;
}


// Stuff which doesn't require the DB yet.
function initPage() {
  // Update the version info
  $('#version-info').text("v" + chrome.runtime.getManifest().version);
  // Setup toggle for all canToggle divs
  $('.canToggle').click(function() {
    $(this).parent().find('.toggleMe').slideToggle();
  });

  setupContextMenu();

}

function setupContextMenu(){
  var menu = contextmenu([
    {
      label: "First Item",
      onclick: function (e){
        document.body.style.background = "black";
        setTimeout(function() {
          document.body.style.background = "";
        }, 500);
      }
    },
    {label: "Second Item"},
    {hr : true},
    {
      label: "Sub menu",
      children: [
        {
          label: "Another Item"
        }
      ]
    }
  ]);


// Right click the container
  $(document).on("contextmenu", ".showRowOptions", function(e){
    e.preventDefault();
    console.log(e)
    console.log(this)
    contextmenu.show(menu, this.clientX, this.clientY);
  })
  //contextmenu.attach($(".showRowOptions"), menu);
}

// Real Utils.
function printDB() {
  chrome.storage.local.get(null, function(x) {
    console.log(x)
  })
}


function initializeDB() {
  chrome.storage.local.set({
    state: false
  });
  chrome.storage.local.set({
    hooks: backgroundPage.initializedDB.hooks
  });
}

function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getHostname(input){console.log(input)
  if(input === null || input === undefined || input.length === 0)
    return 'localhost';
  input = input.toString().trim();
  if(!input.startsWith('http://') && !input.startsWith('https://'))
    input = 'https://'+input;
  var url = new URL(input);
  return url.hostname;
}