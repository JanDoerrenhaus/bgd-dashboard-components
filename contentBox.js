(function ($) {

    bgd.contentBox = function(definition) {
        this.definition = definition;
        this.content = null;
    };
    
    bgd.contentBox.prototype = {
        initialize: function() {
            log('>>> contentBox#initialize');
            log('<<< contentBox#initialize');
        },

        render: function(parent) {
            log('>>> contentBox#render');
            var html = bgd.contentBox.templates[this.definition.size];
            $.each(this.definition, function(key, value) {
                html = html.replace('%' + key + '%', value);
            });
            parent.append($(html));
            this.content = $('#' + this.definition.id);
            log('<<< contentBox#render');
        },

        showLoadingBubbles: function() {
            this.content.empty();
            this.content.append($(bgd.contentBox.templates.loadingBubbles));
        },

        showNoDataMessage: function() {
            this.content.empty();
            this.content.append($('<div class=\'noData\'>NO DATA</div>'));
        },

        showErrorMessage: function(errorMessage) {
            this.content.empty();
            this.content.append($('<div class=\'errorMessage\'>ERROR: ' + errorMessage + '</div>'));
        }
    };

    bgd.contentBox.templates = {
        half: '<div class=\'col-lg-6 col-sm-12\'><div class=\'panel panel-default\'><div class=\'panel-heading panel-heading-collapsed\'>%caption%&nbsp;<a href=\'javascript:void(0);\' data-toggle=\'tooltip\' data-html=\'true\' data-placement=\'right\' rel=\'tooltip\' title=\'%explanation%\' ><span class=\'fa fa-question-circle\'></span></a></div><div class=\'panel-wrapper\'><div class=\'panel-body\'><div id=\'%id%\' class=\'bgd-visualization\'></div></div></div></div></div>',
        full: '<div class=\'col-sm-12\'><div class=\'panel panel-default\'><div class=\'panel-heading panel-heading-collapsed\'>%caption%&nbsp;<a href=\'javascript:void(0);\' data-toggle=\'tooltip\' data-html=\'true\' data-placement=\'right\' rel=\'tooltip\' title=\'%explanation%\' ><span class=\'fa fa-question-circle\'></span></a></div><div class=\'panel-wrapper\'><div class=\'panel-body\'><div id=\'%id%\' class=\'bgd-visualization\'></div></div></div></div></div>',
        loadingBubbles: '<div class=\'ball-grid-beat\'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
    };

}(jQuery));
