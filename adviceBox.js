(function ($) {

    bgd.adviceBox = function(definition) {
        this.definition = definition;
        this.dataContainer = null;
        this.dataTable = null;
    };
    
    bgd.adviceBox.prototype = {
        initialize: function(dataContainer) {
            log('>>> adviceBox#initialize');
            this.contentBox = new bgd.contentBox(this.definition);
            this.contentBox.initialize();
            this.dataContainer = dataContainer;
            this.dataContainer.registerLoadStateChangeCallback(this.redrawContent, this);
            log('<<< adviceBox#initialize');
        },
        
        render: function(parent) {
            log('>>> adviceBox#render');
            this.contentBox.render(parent);
            $('#' + this.definition.id).css('min-height', '75px');
            this.redrawContent();
            log('<<< adviceBox#render');
        },
        
        redrawContent: function() {
            log('>>> adviceBox#redrawContent');
            switch (this.dataContainer.state) {
                case 'initialized':
                case 'loading':
                    this.dataTable = null;
                    this.contentBox.showLoadingBubbles();
                    break;
                case 'nodata':
                    this.dataTable = null;
                    this.contentBox.showNoDataMessage();
                    break;
                case 'error':
                    this.dataTable = null;
                    this.contentBox.showErrorMessage(this.dataContainer.errorMessage);
                    break;
                case 'loaded':
                    var data = this.dataContainer.data;
                    var valueIndex = $.inArray(this.definition.series, data[0]);
                    var value;
                    if (this.definition.value == 'latest') {
                        value = data[data.length - 1][valueIndex];
                    } else {
                        log('    adviceBox ' + this.definition.id + ' has unsupported value: ' + this.definition.value);
                    }
                    log('    ' + value);
                    this.contentBox.content.empty();
                    var adviceText = '';
                    var thresholdMatch = false;
                    $.each(this.definition.thresholds, function(index, threshold) {
                        if (!thresholdMatch && value < threshold.value) {
                            adviceText = threshold.message;
                            thresholdMatch = true;
                        }
                    });
                    this.contentBox.content.append($('<div style=\'text-align: center; font-size: 200%;\'>' + adviceText + '</div>'));
                    break;
            }
            log('<<< adviceBox#redrawContent');
        }
    }

    if (bgd.widgetRenderers == null || bgd.widgetRenderers == undefined) {
        bgd.widgetRenderers = {};
    }
    bgd.widgetRenderers['adviceBox'] = bgd.adviceBox;

}(jQuery));
