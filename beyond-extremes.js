/**
 * Highcharts plugin for allowing the input range dates to be beyond the range of the current data in the chart
 */
(function (Highcharts) {

    Highcharts.wrap(Highcharts.RangeSelector.prototype, 'drawInput', function(proceed){
        var name = arguments[1],
            chart = this.chart,
            pInt = Highcharts.pInt,
            rangeSelector = this,
            UNDEFINED = undefined;

        //Setup the original drawInput function
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        //Remove the "onchange" binding that drawInput adds
        $(this[name + "Input"]).removeAttr("onchange");

        //Add the new "onchange" binding
        /*
        This code is copied out of the source and tweaked to handle the "beyondExtremes" option in rangeSelector
        (Some of the variable setup has been changed from the original source to account for this function now being
        defined outside of its original context)
        */
        $(this[name + "Input"]).bind("change", function(event){
            var input = $(event.currentTarget),
                inputValue = input.val(),
                options = chart.options.rangeSelector,
                defaultOptions = chart.options,
                value = (options.inputDateParser || Date.parse)(inputValue),
                extremes = chart.xAxis[0].getExtremes(),
                isMin = name === 'min',
                beyondExtremes = (chart.options.rangeSelector.hasOwnProperty("beyondExtremes") &&
                    chart.options.rangeSelector.beyondExtremes);

            // If the value isn't parsed directly to a value by the browser's Date.parse method,
            // like YYYY-MM-DD in IE, try parsing it a different way
            if (isNaN(value)) {
                value = inputValue.split('-');
                value = Date.UTC(pInt(value[0]), pInt(value[1]) - 1, pInt(value[2]));
            }

            if (!isNaN(value)) {

                // Correct for timezone offset (#433)
                if (!defaultOptions.global.useUTC) {
                    value = value + new Date().getTimezoneOffset() * 60 * 1000;
                }

                // Set the extremes
                /*
                Putting in the "or" between beyondExtremes and the dataMin/Max check maintains the default functionality,
                but allows the beyondExtremes flag to override the dataMin/Max check)
                */
                if ((isMin && ((beyondExtremes || value >= extremes.dataMin) && value <= rangeSelector.maxInput.HCTime)) ||
                    (!isMin && ((beyondExtremes || value <= extremes.dataMax) && value >= rangeSelector.minInput.HCTime))) {
                    chart.xAxis[0].setExtremes(
                        isMin ? value : extremes.min,
                        isMin ? extremes.max : value,
                        UNDEFINED,
                        UNDEFINED,
                        { trigger: 'rangeSelectorInput' }
                    );
                }
            }

        });
    });

}(Highcharts));