(function ($) {

    bgd.widgetDataContainer = function(source) {
        this.source = $.extend({}, source);
        this.state = 'initialized';
        this.data = null;
        this.loadStateChangeCallbacks = [];
        this.errorMessage = null;
    };
    
    bgd.widgetDataContainer.prototype = {
        initialize: function() {
            log('>>> widgetDataContainer#initialize');
            log('<<< widgetDataContainer#initialize');
        },
        
        registerLoadStateChangeCallback: function(callback, context) {
            log('>>> widgetDataContainer#setLoadStateChangeCallback');
            this.loadStateChangeCallbacks.push({callback: callback, context: context});
            log('<<< widgetDataContainer#setLoadStateChangeCallback');
        },
        
        setState: function(newState) {
            log('>>> widgetDataContainer#setState');
            this.state = newState;
            $.each(this.loadStateChangeCallbacks, function(index, callbackObject) {
                callbackObject.callback.call(callbackObject.context);
            });
            log('<<< widgetDataContainer#setState');
        },
        
        load: function(queryFragment) {
            log('>>> widgetDataContainer#load');
            this.data = null;
            this.errorMessage = null;
            this.setState('loading');
            var query = $.extend({}, this.source.query);
            query = $.extend(true, query, queryFragment);
            var url = 'api/dataaccess?query=' + JSON.stringify(query);
            $.ajax({
                url: url,
                context: this,
                dataType: 'json'
            }).done(function(data, textStatus) {
                log('!!! widgetDataContainer#load.done');
                this.data = data instanceof Array ? data : JSON.parse(data);
                log('    received data: ' + JSON.stringify(this.data));
                if (this.data.length <= 1) {
                    this.setState('nodata');
                } else {
                    this.setState('loaded');
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                log('!!! widgetDataContainer#load.fail');
                log('    error: ' + textStatus + ' ' + jqXHR.status + ' ' + jqXHR.responseText);
                var errorMessage = 'Server error, please try again later.';
                if (jqXHR.status == 422) {
                    var responseJson = JSON.parse(jqXHR.responseText);
                    errorMessage = responseJson.errors.GLOBAL[0].parameters.RootCause;
                    if (errorMessage == null || errorMessage == undefined) {
                        errorMessage = responseJson.errors.GLOBAL[0].parameters.Exception;
                    }
                    errorMessage += '.';
                }
                errorMessage += ' (' + jqXHR.status + ')';
                this.errorMessage = errorMessage;
                this.setState('error');
            });
            log('<<< widgetDataContainer#load');
        }
    };

}(jQuery));
