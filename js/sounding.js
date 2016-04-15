/**
 * Created by tangz on 4/15/2016.
 */

var saved = (function() {
    var _savedSounding = {};

    return {
        setSounding: function(sounding) {
            _savedSounding = sounding;
        },
        getSounding: function() {
            return _savedSounding;
        }
    }
})();
