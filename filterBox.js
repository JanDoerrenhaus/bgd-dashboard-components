(function ($) {

    bgd.filterBox = function(options) {
        this.options = options;
        this.timeFilter = new bgd.timeFilter(this.options.timeRange);
        this.environmentFilter = new bgd.environmentFilter(this.options.environmentToggle);
        this.channelFilter = new bgd.channelFilter(this.options.channelFilter);
        this.spaceFilter = new bgd.spaceFilter(this.options.multiSpace);
        this.applyFiltersCallbacks = [];
    };
    
    bgd.filterBox.prototype = {
        initialize: function() {
            log('>>> filterbox#initialize');
            
            this.timeFilter.initialize();
            this.environmentFilter.initialize();
            this.channelFilter.initialize();
            this.spaceFilter.initialize();
            
            if (!this.options.channelFilter && !this.options.multiSpace) {
                $('#additionalFilters').remove();
            }
            
            this.updateFilterHeader();
            
            var self = this;
            $('#applyFilterButton').click(function() {
                self.updateFilterHeader();
                $.each(self.applyFiltersCallbacks, function(index, callbackObject) {
                    callbackObject.callback.call(callbackObject.context);
                });
            });
            $('#resetFilterButton').click(function() {
                self.timeFilter.reset();
                self.environmentFilter.reset();
                self.channelFilter.reset();
                self.spaceFilter.reset();
            });
            
            log('<<< filterbox#initialize');
        },
        
        registerApplyFiltersCallback: function(callback, context) {
            this.applyFiltersCallbacks.push({callback: callback, context: context});
        },
        
        updateFilterHeader: function() {
            var headerText = '(' + 
                (this.spaceFilter.value != null ? this.spaceFilter.value + ' ' : '') +
                (this.environmentFilter.value != null ? this.environmentFilter.value + ': ' : '') + 
                this.timeFilter.nowValue.format('YYYY-MM-DD') + 
                (this.timeFilter.untilValue != null ? ' to ' + this.timeFilter.untilValue.format('YYYY-MM-DD') : '') +
                (this.channelFilter.channelValue != null ? ' - ' + this.channelFilter.channelValue : '') +
                (this.channelFilter.campaignValue != null ? ' > ' + this.channelFilter.campaignValue : '') +
                (this.channelFilter.siteValue != null ? ' > ' + this.channelFilter.siteValue : '') +
                ')';
            $('#filterHeader').text(headerText);
        }
    };

}(jQuery));
