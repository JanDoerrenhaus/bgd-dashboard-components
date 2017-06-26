(function ($) {

    bgd.dashboard = function(definition) {
        this.definition = definition;
        this.widgets = {};
        this.filterBox = new bgd.filterBox(this.definition.filterOptions);
        this.dataContainers = {};
    };
    
    bgd.dashboard.prototype = {
        initialize: function() {
            log('>>> dashboard#initialize');

            var self = this;
            $(window).resize(function() {
                self.redrawContent();
            });

            this.filterBox.initialize();
            this.filterBox.registerApplyFiltersCallback(this.loadData, this);

            this.initializeDataContainers();
            this.initializeWidgets();

            this.loadData();
            
            log('<<< dashboard#initialize');
        },
        
        initializeDataContainers: function() {
            log('>>> dashboard#initializeDataContainers');
            var self = this;
            $.each(this.definition.widgetDataSources, function(dataSourceName, dataSourceDefinition) {
                var dataContainer = new bgd.widgetDataContainer(dataSourceDefinition);
                self.dataContainers[dataSourceName] = dataContainer;
                dataContainer.initialize();
            });
            log('<<< dashboard#initializeDataContainers');
        },
        
        initializeWidgets: function() {
            log('>>> dashboard#initializeWidgets');
            var dashboardContentArea = $('#dashboardContentArea');
            dashboardContentArea.empty();
            var self = this;
            $.each(this.definition.layout, function(index, row) {
                var rowHtml = bgd.dashboard.templates.row;
                var rowElement = $(rowHtml);
                dashboardContentArea.append(rowElement);
                $.each(row, function(index, widgetDefinition) {
                    var widget = null;
                    var renderer = bgd.widgetRenderers[widgetDefinition.type];
                    if (renderer != null) {
                        widget = new renderer(widgetDefinition);
                    } else {
                        log('Widget ' + widgetDefinition.id + ' has unknown type: ' + widgetDefinition.type);
                    }
                    widget.initialize(self.dataContainers[widgetDefinition.dataSource]);
                    widget.render(rowElement);
                    self.widgets[widgetDefinition.id] = widget;
                });
            });

            $('a[rel=tooltip]', dashboardContentArea).tooltip();

            log('<<< dashboard#initializeWidgets');
        },
        
        loadData: function() {
            log('>>> dashboard#loadData');
            var queryFragment = {};
            queryFragment.where = [];
            if (this.filterBox.timeFilter.untilValue == null) {
                queryFragment.where.push({
                    column: 'slice_start__',
                    operator: 'EQUAL',
                    values: [{
                        value:this.filterBox.timeFilter.nowValue.format('YYYY-MM-DD') + 'T00:00:00.000Z', 
                        type:'DATETIME'
                    }]
                });
            } else {
                queryFragment.where.push({
                    column: 'slice_start__',
                    operator: 'GREATER_THAN_OR_EQUAL',
                    values: [{
                        value:this.filterBox.timeFilter.untilValue.format('YYYY-MM-DD') + 'T00:00:00.000Z', 
                        type:'DATETIME'
                    }]
                });
                queryFragment.where.push({
                    column: 'slice_start__',
                    operator: 'LESS_THAN_OR_EQUAL',
                    values: [{
                        value:this.filterBox.timeFilter.nowValue.format('YYYY-MM-DD') + 'T00:00:00.000Z', 
                        type:'DATETIME'
                    }]
                });
            }

            if (this.filterBox.channelFilter.channelValue != null) {
                queryFragment.where.push({
                    column: 'channel',
                    operator: 'EQUAL',
                    values: [{
                        value:this.filterBox.channelFilter.channelValue, 
                        type:'STRING'
                    }]
                });
            }

            if (this.filterBox.channelFilter.campaignValue != null) {
                queryFragment.where.push({
                    column: 'campaign',
                    operator: 'EQUAL',
                    values: [{
                        value:this.filterBox.channelFilter.campaignValue, 
                        type:'STRING'
                    }]
                });
            }

            if (this.filterBox.channelFilter.siteValue != null) {
                queryFragment.where.push({
                    column: 'site',
                    operator: 'EQUAL',
                    values: [{
                        value:this.filterBox.channelFilter.siteValue, 
                        type:'STRING'
                    }]
                });
            }

            if (this.filterBox.environmentFilter.value != null) {
                queryFragment.where.push({
                    column: 'environment',
                    operator: 'EQUAL',
                    values: [{
                        value:this.filterBox.environmentFilter.value, 
                        type:'STRING'
                    }]
                });
            }

            if (this.filterBox.spaceFilter.value != null) {
                queryFragment.where.push({
                    column: 'space',
                    operator: 'EQUAL',
                    values: [{
                        value:this.filterBox.spaceFilter.value, 
                        type:'STRING'
                    }]
                });
            }
            
            $.each(this.dataContainers, function(dataContainerName, dataContainer) {
                dataContainer.load(queryFragment);
            });
            log('<<< dashboard#loadData');
        },
        
        redrawContent: function() {
            log('>>> dashboard#redrawContent');
            $.each(this.widgets, function(id, widget) {
                widget.redrawContent();
            })
            log('<<< dashboard#redrawContent');
        }
    };

    bgd.dashboard.templates = {
        row: '<div class=\'row\'></div>'
    };

}(jQuery));
