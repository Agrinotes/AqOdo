odoo.define('web_gantt_native.ToolHint', function (require) {
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


var GanttToolHint = Widget.extend({
    template: "GanttToolHint",


    init: function(parent) {

        this._super(parent);

    },

    start: function() {

        var self = this;

        this.$el.append('<div class="task-gantt-line-hint-names"></div>');

        $('<div class="task-gantt-line-hint-name">Start date:</div>').appendTo(this.$el.children(".task-gantt-line-hint-names"));
        $('<div class="task-gantt-line-hint-name">End date:</div>').appendTo(this.$el.children(".task-gantt-line-hint-names"));

        this.$el.append('<div class="task-gantt-line-hint-values"></div>');

        $('<div class=hint-start-value class="task-gantt-line-hint-value"></div>').appendTo(this.$el.children(".task-gantt-line-hint-values"));
        $('<div class=hint-end-value class="task-gantt-line-hint-value"></div>').appendTo(this.$el.children(".task-gantt-line-hint-values"));


    },


    renderElement: function () {
        this._super();

    },

    show_hint : function(gantt_bar, start_end) {

            // var task_start = start_end.task_start;
            // task_start = time.auto_date_to_str(task_start, 'datetime');
            // var task_end = start_end.task_end;
            // task_end = time.auto_date_to_str(task_end, 'datetime');


            var l10n = _t.database.parameters;

            var formatDate = time.strftime_to_moment_format( l10n.date_format + ' ' + l10n.time_format);


            var task_start = moment(start_end.task_start).format(formatDate);
            var task_end = moment(start_end.task_end).format(formatDate);


            var o_left = gantt_bar.offset().left;
            var o_top = gantt_bar.offset().top;

            this.$el.find('div.hint-start-value').text(task_start);
            this.$el.find('div.hint-end-value').text(task_end);

            this.$el.offset({ top: o_top-40, left: o_left});
    }

});

return GanttToolHint;

});