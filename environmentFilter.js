(function ($) {
    bgd.environmentFilter = function(isActive) {
        this.isActive = isActive;
        this.value = null;
        this.defaultValue = null;
    };
    
    bgd.environmentFilter.prototype = {
        initialize: function() {
            log('>>> environmentFilter#initialize');
            if (this.isActive) {
                this.value = $('#liveSwitch').prop('checked') ? 'LIVE' : 'DEV';
                this.defaultValue = this.value;
                var self = this;
                $('#liveSwitch').change(function() {
                    log('!!! #liveSwitch.change');
                    self.value = this.checked ? 'LIVE' : 'DEV';
                });
            } else {
                $('#environmentFilter').remove();
            }
            log('<<< environmentFilter#initialize');
        },
        
        reset: function() {
            log('>>> environmentFilter#reset');
            if (this.isActive) {
                this.value = this.defaultValue;
                $('#liveSwitch').prop('checked', this.value == 'LIVE');
            }
            log('<<< environmentFilter#reset');
        }
    };
}(jQuery));
