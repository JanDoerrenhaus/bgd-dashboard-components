(function ($) {

    bgd.valueBox = function(definition) {
        this.definition = definition;
        this.dataContainer = null;
        this.content = null;
    };
    
    bgd.valueBox.prototype = {
        initialize: function(dataContainer) {
            log('>>> valueBox#initialize');
            this.dataContainer = dataContainer;
            this.dataContainer.registerLoadStateChangeCallback(this.redrawContent, this);
            log('<<< valueBox#initialize');
        },
        
        render: function(parent) {
            log('>>> valueBox#render');
            var html = bgd.valueBox.templates.box;
            $.each(this.definition, function(key, value) {
                html = html.replace('%' + key + '%', value);
            });
            html = html.replace('%textColor%', 'white');
            html = html.replace('%textShadowColor%', 'black');
            parent.append($(html));
            this.content = $('#' + this.definition.id);
            this.redrawContent();
            log('<<< valueBox#render');
        },
        
        redrawContent: function() {
            log('>>> valueBox#redrawContent');
            switch (this.dataContainer.state) {
                case 'initialized':
                case 'loading':
                    this.dataTable = null;
                    this.showLoadingBubbles();
                    break;
                case 'nodata':
                    this.dataTable = null;
                    this.showNoDataMessage();
                    break;
                case 'error':
                    this.dataTable = null;
                    this.showErrorMessage(this.dataContainer.errorMessage);
                    break;
                case 'loaded':
                    var data = this.dataContainer.data;
                    var valueIndex = $.inArray(this.definition.series, data[0]);
                    var value;
                    if (this.definition.value == 'latest') {
                        value = data[data.length - 1][valueIndex];
                    } else {
                        log('    valueBox ' + this.definition.id + ' has unsupported value: ' + this.definition.value);
                    }
                    this.content.empty();
                    var valueText = '';
                    if (this.definition.valueType == 'number') {
                        valueText = numeral(value).format(this.definition.valueFormat != null ? this.definition.valueFormat : '0,0');
                    } else {
                        log('    valueBox ' + this.definition.id + ' has unsupported valueType: ' + this.definition.valueType);
                    }
                    log('    ' + valueText);
                    this.content.append($('<span>' + valueText + '</span>'));
                    break;
            }
            log('<<< valueBox#redrawContent');
        },

        showLoadingBubbles: function() {
            this.content.empty();
            this.content.append($(bgd.valueBox.templates.loadingBubbles));
        },

        showNoDataMessage: function() {
            this.content.empty();
            this.content.append($('<div class=\'noData\'>---</div>'));
        },

        showErrorMessage: function(errorMessage) {
            this.content.empty();
            this.content.append($('<div class=\'errorMessage\'>ERROR</div>'));
        }
    };

    bgd.valueBox.templates = {
        box: '<div class=\'col-lg-3 col-sm-6\'><div class=\'panel widget bgd-valuebox\' style=\'background-color: %secondColor%; color: %textColor%; text-shadow: 0 0 2px %textShadowColor%;\'><div class=\'row row-table\'><div class=\'col-xs-4 text-center pv-lg\' style=\'background-color: %color%;\'><em class=\'%icon% fa-3x\'></em></div><div class=\'col-xs-8 pv-lg\'><div class=\'h2 mt0\' id=\'%id%\'></div><div class=\'text-uppercase\'>%caption% <small>%subCaption%</small></div></div></div></div></div>',
        loadingBubbles: '<div class=\'ball-beat\'><div></div><div></div><div></div></div>'
    };

    if (bgd.widgetRenderers == null || bgd.widgetRenderers == undefined) {
        bgd.widgetRenderers = {};
    }
    bgd.widgetRenderers['valueBox'] = bgd.valueBox;

}(jQuery));
