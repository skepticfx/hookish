// Utils.js

var Utils = {

  stripped: function(data, len) {
    if (len <= 10) return data;
    if (data.length <= len) return data;
    return data.substr(0, len - 4) + " ...";
  },

  addToDomssTable: function(stat) {
    // EwweH ! Soo ugly!!
    $('#domssTableBody').prepend('<tr><td><strong>' + htmlEscape(stat.nature) + '</strong></td><td title="' + htmlEscape(stat.meta) + '">' + htmlEscape(stat.type) + '</td><td title="' + htmlEscape(stat.data) + '">' + this.stripped(htmlEscape(stat.data), 50) + '</td><td>' + stat.href + '</td></tr>');
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