/**
 * Created by tangz on 4/15/2016.
 */

var saved = (function() {
    var _savedSounding = {};
    var _savedProfiles = null;

    return {
        setSounding: function(sounding) {
            _savedSounding = sounding;
            _savedProfiles = profiles(_savedSounding);
        },
        getSounding: function() {
            return _savedSounding;
        },
        soundingProfiles: function () {
            return _savedProfiles;
        }
    }
})();
