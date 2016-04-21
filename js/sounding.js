/**
 * Created by tangz on 4/15/2016.
 */

var saved = (function() {
    var _savedSounding = {};
    var _savedTraces = null;

    return {
        setSounding: function(sounding) {
            _savedSounding = sounding;
            _savedTraces = traces(properties(_savedSounding).profile);
        },
        getSounding: function() {
            return _savedSounding;
        },
        soundingTraces: function () {
            return _savedTraces;
        }
    }
})();
