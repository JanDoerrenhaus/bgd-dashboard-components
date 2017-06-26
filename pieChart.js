(function ($) {

    bgd.pieChart = function(definition) {
        this.definition = definition;
        this.dataContainer = null;
        this.dataTableProcessor = null;
        this.dataTable = null;
    };
    
    bgd.pieChart.prototype = {
        initialize: function(dataContainer) {
            log('>>> pieChart#initialize');
            this.contentBox = new bgd.contentBox(this.definition);
            this.contentBox.initialize();
            this.dataContainer = dataContainer;
            this.dataContainer.registerLoadStateChangeCallback(this.redrawContent, this);
            this.dataTableProcessor = new bgd.dataTableProcessor();
            log('<<< pieChart#initialize');
        },
        
        render: function(parent) {
            log('>>> pieChart#render');
            this.contentBox.render(parent);
            $('#' + this.definition.id).css('height', '16vmax');
            this.redrawContent();
            log('<<< pieChart#render');
        },
        
        redrawContent: function() {
            log('>>> pieChart#redrawContent');
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
                    var chart = new google.visualization.PieChart(document.getElementById(this.definition.id));
                    chart.draw(this.dataTable, options);
                    break;
            }
            log('<<< pieChart#redrawContent');
        },
        
        buildChartOptions: function() {
            log('>>> pieChart#buildChartOptions');
            var options = $.extend(true, {}, bgd.pieChart.templates.defaultOptions);
            if (this.definition.chartOptions != undefined) {
                $.extend(true, options, this.definition.chartOptions);
            }
            var categoriesFiltering = this.definition.categoriesDefinition.filtering;
            if (typeof categoriesFiltering === 'object') {
                while (options.colors.length < this.dataTable.getNumberOfRows()) {
                    var newColors = $.merge([], options.colors);
                    $.merge(newColors, options.colors);
                    options.colors = newColors;
                }
                options.colors[this.dataTable.getNumberOfRows() - 1] = categoriesFiltering.condenseTo.color;
            }
            log('<<< pieChart#buildChartOptions');
            return options;
        },
        
        getDataAsGoogleDataTable: function() {
            log('>>> pieChart#getDataAsGoogleDataTable');
            
            var seriesDefinition = this.definition.seriesDefinition;
            var categoriesDefinition = this.definition.categoriesDefinition;
            var numberFormats = this.definition.numberFormats;
            var categoryOrdering = this.definition.categoryOrdering;
            var filtering = this.definition.filtering;
            
            var dataTable = this.dataTableProcessor.process(
                this.dataContainer.data, seriesDefinition, categoriesDefinition, numberFormats);

            log('<<< pieChart#getDataAsGoogleDataTable');
            return dataTable;
        }
    };
    
    bgd.pieChart.templates = {
        defaultOptions: {
            chartArea: {
                top: 5,
                left: '10%',
                width: '89%',
                height: '92%'
            },
            colors: ['23B5E5', 'FCB441', 'E0400A', '056492', 'AFAFAF', '1A3B69', 'CA6B4B', '005CDB', '506381', 'E0830A', '7893BE', 'C00000']
        }
    };

    if (bgd.widgetRenderers == null || bgd.widgetRenderers == undefined) {
        bgd.widgetRenderers = {};
    }
    bgd.widgetRenderers['pieChart'] = bgd.pieChart;

}(jQuery));
