/**
 * params: {
 *  left/top:,
 *  width/height:,
 *  menubar:
 *  toolbar:
 *  location:
 *  status:
 *  resizable:
 *  scrollbars:  
 * }
 *
 */
function windowOpen(what, name, params) {
    var param = '';
    for (var i in params) {
        param += i + '=' + params[i] + ',';
    }
    window.open(what, name, param);
}