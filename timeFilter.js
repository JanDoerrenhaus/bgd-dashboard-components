(function ($) {
    bgd.timeFilter = function(isRange) {
        this.isRange = isRange;
        this.nowValue = moment().startOf('day');
        this.defaultNowValue = moment(this.nowValue);
        this.untilValue = null;
        this.defaultUntilValue = null;
    };
    
    bgd.timeFilter.prototype = {
        initialize: function() {
            log('>>> timeFilter#initialize');
            this.initializeDatePicker('#now-datepicker', 'nowValue', {
                defaultDate: moment(this.nowValue),
                maxDate: moment().startOf('day')
            });
            if (this.isRange) {
                this.untilValue = moment(this.nowValue).subtract(30, 'days');
                this.defaultUntilValue = moment(this.untilValue);
                this.initializeDatePicker('#until-datepicker', 'untilValue', {
                    defaultDate: moment(this.untilValue),
                    maxDate: moment().startOf('day')
                });
            } else {
                $('#timeRangeFilter').remove();
                this.untilValue = null;
            }
            log('<<< timeFilter#initialize');
        },
        
        reset: function() {
            log('>>> timeFilter#reset');
            this.nowValue = moment(this.defaultNowValue);
            $('#now-datepicker').data('DateTimePicker').date(moment(this.nowValue));
            if (this.isRange) {
                this.untilValue = moment(this.defaultUntilValue);
                $('#until-datepicker').data('DateTimePicker').date(moment(this.untilValue));
            }
            log('<<< timeFilter#reset');
        },
            
        initializeDatePicker: function(datepicker, valueFieldName, additionalOptions) {
            log('>>> timeFilter#initializeDatePicker');
            $(datepicker).datetimepicker(
                $.extend(true, {
                    icons: {
                        time: 'fa fa-clock-o',
                        date: 'fa fa-calendar',
                        up: 'fa fa-chevron-up',
                        down: 'fa fa-chevron-down',
                        previous: 'fa fa-chevron-left',
                        next: 'fa fa-chevron-right',
                        today: 'fa fa-crosshairs',
                        clear: 'fa fa-trash'
                    },
                    format: 'YYYY-MM-DD'
                }, additionalOptions));
            var self = this;
            $(datepicker).on('dp.change', function(e) {
                log('!!! ' + datepicker + '.change');
                self[valueFieldName] = moment(e.date);
            });

            log('<<< timeFilter#initializeDatePicker');
        }
    };
}(jQuery));
