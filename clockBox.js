(function ($) {

    bgd.clockBox = function(definition) {
        this.definition = definition;
        this.content = null;
    };
    
    bgd.clockBox.prototype = {
        initialize: function(dataContainer) {
            log('>>> clockBox#initialize');
            log('<<< clockBox#initialize');
        },
        
        render: function(parent) {
            log('>>> clockBox#render');
            var html = bgd.clockBox.templates.box;
            $.each(this.definition, function(key, value) {
                html = html.replace('%' + key + '%', value);
            });
            parent.append($(html));
            this.content = $('#' + this.definition.id);
            this.redrawContent();
            log('<<< clockBox#render');
        },
        
        redrawContent: function() {
            log('>>> clockBox#redrawContent');
            log('<<< clockBox#redrawContent');
        }
    };

    bgd.clockBox.templates = {
        box: '<div class=\'col-lg-3 col-sm-6\'><div class=\'panel widget\'><div class=\'row row-table\'><div class=\'col-xs-4 text-center pv-lg\' style=\'background-color: black; color: white;\'><div data-now=\'\' data-format=\'MMMM\' class=\'text-sm\'></div><br><div data-now=\'\' data-format=\'D\' class=\'h2 mt0\'></div></div><div class=\'col-xs-8 pv-lg\' style=\'background-color: white; color: black;\'><div data-now=\'\' data-format=\'dddd\' class=\'text-uppercase\'></div><br><div data-now=\'\' data-format=\'HH:mm\' class=\'h2 mt0\'></div></div></div></div></div>'
    };

    if (bgd.widgetRenderers == null || bgd.widgetRenderers == undefined) {
        bgd.widgetRenderers = {};
    }
    bgd.widgetRenderers['clockBox'] = bgd.clockBox;

}(jQuery));
