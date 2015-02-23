// Utils.js

var Utils = {

  stripped: function(data, len) {
    if (len <= 10) return data;
    if (data.length <= len) return data;
    return data.substr(0, len - 4) + " ...";
  },

  addToDomssTable: function(stat) {
    // EwweH ! Soo ugly!!
    $('#domssTableBody').prepend('<tr><td><strong>' + stat.nature + '</strong></td><td>' + stat.type + '</td><td title="' + stat.data.replace(/"/gi, '%22') + '">' + this.stripped(stat.data, 50) + '</td><td>' + stat.href + '</td></tr>');
  },

  addToXhrTable: function(xhr) {
    // EwweH ! Soo ugly!!
    $('#xhrTableBody').prepend('<tr><td><strong>' + xhr.method + '</strong></td><td>' + xhr.url + '</td></tr>');
  }


}