// Utils.js

var Utils = {

  stripped: function(data, len) {
    if (len <= 10) return data;
    if (data.length <= len) return data;
    return data.substr(0, len - 4) + " ...";
  },

  addToDomssTable: function(stat) {
    // EwweH ! Soo ugly!!
    $('#domssTableBody').prepend('<tr><td><strong>' + htmlEscape(stat.nature) + '</strong></td><td class="callStack" data-callStack="' + htmlEscape(stat.meta) + '">' + htmlEscape(stat.type) + '</td><td title="' + htmlEscape(stat.data) + '">' + this.stripped(htmlEscape(stat.data), 50) + '</td><td>' + stat.href + '</td></tr>');
  },

  addToWsTable: function(ws) {
    // EwweH ! Soo ugly!!
    $('#wsTableBody').prepend('<tr><td>' + htmlEscape(ws.type) + '</td><td>' + htmlEscape(ws.data) + '</td></tr>');
  },

  addToXhrTable: function(xhr) {
    // EwweH ! Soo ugly!!
    $('#xhrTableBody').prepend('<tr><td>' + htmlEscape(xhr.method) + '</td><td>' + htmlEscape(xhr.url) + '</td></tr>');
  },

  addToUnsafeAnchorTable: function(links) {
    $('#unsafeAnchorTableBody').prepend('<tr><td><strong>' + htmlEscape(links.href) + '</strong></td><td>' + htmlEscape(links.string) + '</td></tr>');
  }


}


function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
  console.log(tr);
  thead.appendChild(tr);
  table.appendChild(thead);
  var tableBody = document.createElement('table');
  tableBody.id = 'section_table_body_' + settingName;
  table.appendChild(tableBody);
  div1.appendChild(table);
  section.appendChild(div1);

  return section;
}

function populateHookishSections(id, settings) {
  var body = $('#' + id);
  var settingNames = Object.keys(settings);
  settingNames.forEach(function(settingName) {
    body.append(createHookishSection(settings[settingName]));
  });
}