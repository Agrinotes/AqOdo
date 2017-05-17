odoo.define('web_gantt_native.ToolTip', function (require) {
"use strict";

var config = require('web.config');
var core = require('web.core');
var Dialog = require('web.Dialog');
var form_common = require('web.form_common');
var Widget = require('web.Widget');

var time = require('web.time');

var list_widget_registry = core.list_widget_registry;

var _lt = core._lt;
var _t = core._t;
var QWeb = core.qweb;


var GanttToolTip = Widget.extend({
    template: "GanttToolTip",

   /// this.chart.tooltip.show(this.resizerOffsetX, this);

    init: function(parent, ganttbar) {

        this._super(parent);
        this.record = ganttbar;

    },

    start: function() {


        var self = this;

        this.$el.append('<div class="task-gantt-line-tip-names"></div>');

        var record = self.record[0];

        if (record) {

            var record_data = record.record;

            var name = record_data['value_name'];

            // var task_start = record_data['task_start'].toUTCString()
            //
            // var ttt = record_data.task_start;

            // var formatDate = "DD.MM.YYYY HH:mm:ss"; // the string that represents desired format.
            var l10n = _t.database.parameters;

            var formatDate = time.strftime_to_moment_format( l10n.date_format + ' ' + l10n.time_format);


            // var task_start = time.auto_date_to_str(record_data.task_start, 'datetime');


            var task_start = moment(record_data["task_start"]).format(formatDate);
            var task_stop = moment(record_data["task_stop"]).format(formatDate);

            var date_deadline = false;
            if (record_data["date_deadline"]) {

                date_deadline = moment(record_data["date_deadline"]).format(formatDate);
            }


            // var task_stop = record_data['task_stop'];
            // task_stop = time.auto_date_to_str(task_stop, 'datetime');

            // var date_deadline = record_data['date_deadline'];
            // date_deadline = time.auto_date_to_str(date_deadline, 'datetime');

            var progress = '';
            if (record_data['progress']){
                progress = record_data['progress'];
            }

            var date_done = false;
            if (record_data["date_done"]) {

                date_done = moment(record_data["date_done"]).format(formatDate);

            }



            $('<div class="task-gantt-line-tip-name">Name:</div>').appendTo(this.$el.children(".task-gantt-line-tip-names"));
            $('<div class="task-gantt-line-tip-name">Start date:</div>').appendTo(this.$el.children(".task-gantt-line-tip-names"));
            $('<div class="task-gantt-line-tip-name">End date:</div>').appendTo(this.$el.children(".task-gantt-line-tip-names"));
            $('<div class="task-gantt-line-tip-name">Deadline:</div>').appendTo(this.$el.children(".task-gantt-line-tip-names"));
            $('<div class="task-gantt-line-tip-name">Progress:</div>').appendTo(this.$el.children(".task-gantt-line-tip-names"));

            if (date_done) {

                 $('<div class="task-gantt-line-tip-name">Done date:</div>').appendTo(this.$el.children(".task-gantt-line-tip-names"));
            }


            this.$el.append('<div class="task-gantt-line-tip-values"></div>');



            $('<div class="task-gantt-line-tip-value">' + name + '</div>').appendTo(this.$el.children(".task-gantt-line-tip-values"));
            $('<div class="task-gantt-line-tip-value">' + task_start + '</div>').appendTo(this.$el.children(".task-gantt-line-tip-values"));
            $('<div class="task-gantt-line-tip-value">' + task_stop + '</div>').appendTo(this.$el.children(".task-gantt-line-tip-values"));
            $('<div class="task-gantt-line-tip-value">' + date_deadline + '</div>').appendTo(this.$el.children(".task-gantt-line-tip-values"));
            $('<div class="task-gantt-line-tip-value">' + progress + '%</div>').appendTo(this.$el.children(".task-gantt-line-tip-values"));

            if (date_done) {

                $('<div class="task-gantt-line-tip-value">' + date_done + '</div>').appendTo(this.$el.children(".task-gantt-line-tip-values"));
            }

        }

        if (self.record.offset()) {

        var o_left = self.record.offset().left;
        var o_top = self.record.offset().top;

        // this.$el.find('div.hint-start-value').text(task_start);
        // this.$el.find('div.hint-end-value').text(task_end);
         var top_new = o_top - 90;

        if (o_top < 250)    {

            top_new = o_top + 20;
        }

        this.$el.offset({top: top_new , left: o_left});
        }



    },


    renderElement: function () {
        this._super();
        this.$el.data('record', this);

    },



});

return GanttToolTip;

});