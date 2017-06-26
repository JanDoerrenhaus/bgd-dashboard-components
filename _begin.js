var logging = false;
    
function log(message) {
    if (logging) {
        console.log(moment().format() + ' - ' + message);
    }
}

log('Script start');

window.bgd = {};

window.bgd.initialize = function() {
    log('Initializing dashboard.');
    var dashboard = new bgd.dashboard(dashboardDefinition);
    dashboard.initialize();
    
    biggamedata.beforeUnloadingPage();
    biggamedata.processLoadedPage();
};

window.bgd.start = function(dashboardDefinition) {
    log('>>> bgd.start');
    if (typeof google === 'undefined') {
        log('Loading Google visualization...');
        $.getScript('https://www.gstatic.com/charts/loader.js', function() {
            google.charts.load('45.1', {'packages':['corechart']});
            google.charts.setOnLoadCallback(function() {
                log('Google visualization loaded');
                bgd.initialize();
            });
        });
    } else {
        bgd.initialize();
    }
    log('<<< bgd.start');
};

