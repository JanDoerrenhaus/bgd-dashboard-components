(function ($) {

    bgd.barChart = function(definition) {
        this.definition = definition;
        this.dataContainer = null;
        this.dataTableProcessor = null;
        this.dataTable = null;
    };
    
    bgd.barChart.prototype = {
        initialize: function(dataContainer) {
            log('>>> barChart#initialize');
            this.contentBox = new bgd.contentBox(this.definition);
            this.contentBox.initialize();
            this.dataContainer = dataContainer;
            this.dataContainer.registerLoadStateChangeCallback(this.redrawContent, this);
            this.dataTableProcessor = new bgd.dataTableProcessor();
            log('<<< barChart#initialize');
        },
        
        render: function(parent) {
            log('>>> barChart#render');
            this.contentBox.render(parent);
            $('#' + this.definition.id).css('height', '16vmax');
            this.redrawContent();
            log('<<< barChart#render');
        },
        
        redrawContent: function() {
            log('>>> barChart#redrawContent');
            switch (this.dataContainer.state) {
                case 'initialized':
                case 'loading':
                    this.dataTable = null;
                    this.contentBox.showLoadingBubbles();
                    $('#' + this.definition.id + ' div').first().css('padding-top', '6vmax');
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
                    if (this.dataTable == null) {
                        this.dataTable = this.getDataAsGoogleDataTable();
                    }
                    var options = this.buildChartOptions();
                    var chart = new google.visualization.ColumnChart(document.getElementById(this.definition.id));
                    chart.draw(this.dataTable, options);
                    break;
            }
            log('<<< barChart#redrawContent');
        },
        
        buildChartOptions: function() {
            log('>>> barChart#buildChartOptions');

            var options = $.extend(true, {}, bgd.barChart.templates.defaultOptions);
            
            if (this.definition.categoriesDefinition.type == 'time') {
                options.hAxis = {
                    format: 'MMM dd'
                }
            }
            $.extend(true, options.vAxis, {format: this.definition.numberFormats[0].axis, minValue: 0});
            
            var seriesInfo = this.dataTableProcessor.seriesInfo;
            var colors = [];
            var index = 0;
            var numberOfSeries = 0;
            $.each(seriesInfo, function(currentSeriesId, currentSeriesInfo) {
                numberOfSeries++;
                if (currentSeriesInfo.color != null) {
                    colors[index] = currentSeriesInfo.color;
                }
            });
            if (colors.length > 0) {
                options.colors = colors;
            }
            var seriesFiltering = this.definition.seriesDefinition.filtering;
            if (typeof seriesFiltering === 'object') {
                while (options.colors.length < numberOfSeries + 1) {
                    var newColors = $.merge([], options.colors);
                    $.merge(newColors, options.colors);
                    options.colors = newColors;
                }
                options.colors[numberOfSeries] = seriesFiltering.condenseTo.color;
            }
            
            if (this.definition.chartOptions != undefined) {
                $.extend(true, options, this.definition.chartOptions);
            }

            log('<<< barChart#buildChartOptions');
            return options;
        },
        
        getDataAsGoogleDataTable: function() {
            log('>>> barChart#getDataAsGoogleDataTable');
            
            var seriesDefinition = this.definition.seriesDefinition;
            var categoriesDefinition = this.definition.categoriesDefinition;
            var numberFormats = this.definition.numberFormats;
            
            var dataTable = this.dataTableProcessor.process(
                this.dataContainer.data, seriesDefinition, categoriesDefinition, numberFormats);

            log('<<< barChart#getDataAsGoogleDataTable');
            return dataTable;
        }
    };
    
    bgd.barChart.templates = {
        defaultOptions: {
            chartArea: {
                top: 5,
                left: '7%',
                width: '92%',
                height: '82%'
            },
            vAxis: {
                minValue: 0,
                format: 'decimal'
            },
            legend: {
                position: 'none'
            },
            colors: ['23B5E5', 'FCB441', 'E0400A', '056492', 'AFAFAF', '1A3B69', 'CA6B4B', '005CDB', '506381', 'E0830A', '7893BE', 'C00000']
        }
    };

    if (bgd.widgetRenderers == null || bgd.widgetRenderers == undefined) {
        bgd.widgetRenderers = {};
    }
    bgd.widgetRenderers['barChart'] = bgd.barChart;

}(jQuery));
