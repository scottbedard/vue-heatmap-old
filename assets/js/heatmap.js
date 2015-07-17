/**
 * Vue Heatmap
 * http://github.com/scottbedard/vue-heatmap
 */
new Vue({

    /*
     * Vue scope
     */
    el: '.vue',

    /*
     * Data
     */
    data: {
        // Our starting colors
        config: {
            empty: '#EEEEEE',
            cold: '#D6E685',
            hot: '#1E6823',
            blend: 2,
        },

        // Container for the calendar data
        calendar: [],

        // Container for the colors
        colors: [],

        // Details for the day the mouse is over
        details: false,

        // The chart legend
        legend: [],
    },

    /*
     * Boot
     */
    ready: function() {
        this.init();
        this.addHeat();
        this.blend();
    },

    /*
     * Computed properties
     */
    computed: {

        //
        // Determine how many weeks we're dealing with
        //
        cellWidth: {
            get: function() {
                return (100 / Math.ceil(this.calendar.length / 7)) + '%';
            },
        },

        //
        // Split the calendar into weeks
        //
        weeks: {
            get: function() {
                // Create a container to hold the weeks, and clone the original
                // calendar array. Then just splice off seven day segments
                // from the calendar until there is nothing left.
                var weeks = [],
                    calendar = this.calendar.slice(0);

                while (calendar.length > 0) {
                    weeks.push(calendar.splice(0, 7));
                }

                return weeks;
            },
        },
    },

    /*
     * Methods
     */
    methods: {

        //
        // Create an empty heatmap
        //
        init: function() {
            var day = new Date(),
                today = new Date().valueOf();

            day.setDate(day.getDate() - day.getDay() - 364);

            while (day.valueOf() <= today) {
                this.calendar.push({
                    date: day.toDateString(),
                    heat: 0,
                    color: this.colors[0],
                });

                day.setDate(day.getDate() + 1);
            }
        },

        //
        // Randomly populate the heatmap with data
        //
        addHeat: function() {
            var days = this.calendar.length;

            for (var i = 0; i < 100; i++) {
                this.calendar[Math.floor(Math.random() * days)].heat += Math.ceil(Math.random() * 10);
            }

            this.render();
        },

        //
        // Add heat to a specific day
        //
        addHeatSingle: function(day) {
            for (i in this.calendar) {
                if (this.calendar[i].date == day.date) {
                    this.calendar[i].heat++;
                    break;
                }
            }

            this.render();
        },

        //
        // Blend the hot and color colors
        //
        blend: function() {
            // First things first... Create a container for our blended colors,
            // and break the hot and cold colors into decimal RGB values.
            var colors = [],
                cold = {
                    R: parseInt(this.config.cold.substring(1, 3), 16),
                    G: parseInt(this.config.cold.substring(3, 5), 16),
                    B: parseInt(this.config.cold.substring(5, 7), 16),
                },
                hot = {
                    R: parseInt(this.config.hot.substring(1, 3), 16),
                    G: parseInt(this.config.hot.substring(3, 5), 16),
                    B: parseInt(this.config.hot.substring(5, 7), 16),
                },

                // The number of blended colors we need to calculate. The +1 is
                // present to allow a blend value of 0. If the user wants to go
                // directly from hot to cold, then the step will be the entire
                // difference of hot - cold.
                blend = parseInt(this.config.blend) + 1,

                // Calculate the size of the steps between primary colors.
                step = {
                    R: (hot.R - cold.R) / blend,
                    G: (hot.G - cold.G) / blend,
                    B: (hot.B - cold.B) / blend,
                };

            // Next calculate the blended colors, along with the base colors, by
            // incrementing their primary colors by the appropriate step value.
            for (var i = 0; i <= blend; i++) {
                var color = {
                    R: Math.round(cold.R + (step.R * i)),
                    G: Math.round(cold.G + (step.G * i)),
                    B: Math.round(cold.B + (step.B * i)),
                };

                // Perform some quick sanity checks, and convert our RGB values
                // back to a hexidecimal color.
                for (var primary in color) {
                    var value = color[primary];
                    if (value < 0) {
                        value = 0;
                    } else if (value > 255) {
                        value = 255;
                    }

                    hex = value.toString(16);

                    if (hex.length == 1) {
                        hex = '0' + hex;
                    }

                    color[primary] = hex;
                }

                colors.push('#' + color.R + color.G + color.B);
            }

            this.colors = colors;
            this.render();
        },

        //
        // Clear the calendar
        //
        clear: function() {
            for (i in this.calendar) {
                this.calendar[i].heat = 0;
            }

            this.render();
        },

        //
        // Calculate the legend and assign a color to each day on the grid
        //
        render: function() {
            var max = 0,
                days = this.calendar.length;

            // First we need the max heat to use as a baseline
            for (var i = 0; i < days; i++) {
                if (this.calendar[i].heat > max) {
                    max = this.calendar[i].heat;
                }
            }

            // Calculate the heat required to move to the next color
            var step = Math.floor(max / this.colors.length);
            if (step < 1) {
                step = 1;
            }

            // Calculate the legend
            this.legend = [];
            for (i in this.colors) {
                this.legend.push({
                    color: this.colors[i],
                    min: step * i + 1,
                    max: step * i + step,
                });
            }

            // Cycle through the calendar and determine which color, if any,
            // should be applied to it.
            for (i in this.calendar) {
                if (this.calendar[i].heat == 0) {
                    this.calendar[i].color = this.config.empty;
                    continue;
                }

                for (j in this.colors) {
                    if (this.calendar[i].heat > j * step) {
                        this.calendar[i].color = this.colors[j];
                    }
                }
            }
        },

        //
        // Set the details to a given day
        //
        setDetails: function(day) {
            console.log ('hey');
            this.details = day;
        },
    },
});
