odoo.define('web_gantt_native.Item', function (require) {
"use strict";

var config = require('web.config');
var core = require('web.core');
var Dialog = require('web.Dialog');
var form_common = require('web.form_common');
var Widget = require('web.Widget');


var list_widget_registry = core.list_widget_registry;
var _lt = core._lt;
var _t = core._t;
var QWeb = core.qweb;


var GanttListItem = Widget.extend({
    template: "GanttList.item",

    custom_events: {

        'item_record_edit': 'edit_record',
        'item_record_add':  'add_record',
        'focus_gantt_line' : 'focus_gantt_line',
        // 'move_right' : 'move_right',
        // 'move_left' : 'move_left',
    },

    init: function(parent, record, items_sorted) {

        this._super(parent);
        this.record = record;
        this.items_sorted = items_sorted;

    },

    start: function() {

        var self = this;
        var name = self.record['value_name'];

        var level = self.record['level'];
        var subtask_count = self.record['subtask_count'];

        if (this.items_sorted){
            level = self.record['sorting_level'];
        }

        // var sort_l = self.record['sort_l'];
        // var sort_r = self.record['sort_r'];
        //var sorting_level = task.sorting_level;
        //var sorting_seq = task.sorting_seq;
        // var depth = self.record['depth'];
        // var depth = 0;

        var id = self.record['id'];
        var project_id = self.record['project_id'];

        var padding = 28; //68
        var padding_depth = 15;
        var padding_default = 20;

        if (!this.record.is_group && self.items_sorted) {

            this.$el.css({'padding-left': padding + "px"});
        }
        else{

            this.$el.toggleClass('ui-state-disabled-group');
            this.$el.css({'padding-left': padding_default + "px"});
        }

        //&& self.items_sorted
        if (level > 0) {

            var padlevel = padding;
            var paddepth = padding_depth * (level);
            this.$el.css({'padding-left': padlevel + paddepth + "px"});
        }

        // if (depth > 0 && self.items_sorted) {
        //       this.$el.css({'opacity': 0.6});
        //
        // }

        this.$el.prop('sorting', true);
        if (id != undefined) {
            this.$el.prop('id', "task-gantt-item-" + id + "");
            this.$el.prop('data-id', id);
            this.$el.prop('allowRowHover', true);
        }

        if (!this.record.is_group) {

            this.$el.append('<span class="task-gantt-focus"><i class="fa fa-crosshairs fa-1x"></i></span>');

            // if (self.items_sorted){
            //     this.$el.append('<span class="task-gantt-left"><i class="fa fa-arrow-circle-o-left fa-1x"></i></span>');
            //     this.$el.append('<span class="task-gantt-right"><i class="fa fa-arrow-circle-o-right fa-1x"></i></span>');
            // }
        }
        else{

            if (self.items_sorted){
                this.$el.css({'padding-left': padding_default + "px"});
                this.$el.append('<span class="task-gantt-focus"><i class="fa fa-plus fa-1x"></i></span>');
            }
        }


        this.$el.append('<span class="task-gantt-item-handle"></span>');

        if (this.record.is_group) {
            this.$el.append('<span class="task-gantt-item-name task-gantt-items-group">'+name+'</span>');
        }
        else{


            if (subtask_count && this.items_sorted){
                this.$el.append('<i class="fa fa-caret-right "></i>');
                this.$el.append('<span class="task-gantt-item-name task-gantt-items-subtask">'+name+'</span>');
            }
            else{
                this.$el.append('<span class="task-gantt-item-name">'+name+'</span>');
            }



        }


    },



    renderElement: function () {
        this._super();

        this.$el.data('record', this);
        this.$el.on('click', this.proxy('on_global_click'));

    },



    new_record: function(default_project_id){

        var context = this.__parentedParent.dataset.context;
        var self = this.__parentedParent;
        context['default_project_id'] = default_project_id || false;

        var pop = new form_common.FormViewDialog(this.__parentedParent, {
            res_model: 'project.task',
            res_id: false,
            context: this.__parentedParent.dataset.context,
            title: _t("Please Select Project Firt For Task"),
            buttons: [
                {text: _lt("Save"), classes: 'btn-primary', close: true, click: function () {

                    $.when(this.view_form.save()).then(function () {
                        self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);
                        // self.reload();
                    });
                }},

                {text: _lt("Close"), classes: 'btn-default', close: true, click: function (){
                    self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);
                }}
            ]

        }).open();

    },

    add_record: function(event) {
        // this.__parentedParent.dataset.index = null;
        // this.__parentedParent.do_switch_view('form');
        this.new_record(event.data.group_id);
    },

    open_record: function (event, options) {

        var res_id = false;
        var res_model = false;
        var res_open = false;
        var start_date = false;

        var readonly = false;

        var buttons = [
                {text: _lt("Save"), classes: 'btn-primary', close: true, click: function () {

                    $.when(this.view_form.save()).then(function () {

                        self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);
                        // self.reload();
                    });

                }},
                {text: _t("Edit in Full Screen"), classes: 'btn-primary', close: true, click: function() {
                        self.dataset.index = self.dataset.get_id_index(res_id);
                        self.do_switch_view('form', { mode: "edit" });
                    }},
                {text: _lt("Delete"), classes: 'btn-default', close: true, click: function () {
                    $.when(self.dataset.unlink([event.data.id])).then(function () {
                        // $.when(self.dataset.remove_ids([task_id])).then(function () {
                            // self.open_task_id = false;
                            self.reload();
                        // });
                    });
                }},
                {text: _lt("Close"), classes: 'btn-default', close: true, click: function (){

                    self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);

                }}
            ];



        if (event.data.is_group && event.data.group_field == 'project_id') {

            res_id = event.data.group_id;
            res_model = 'project.project';
            res_open = true;

            readonly = false;

             buttons = [
                {text: _lt("Save"), classes: 'btn-primary', close: true, click: function () {

                    $.when(this.view_form.save()).then(function () {

                        self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);
                        // self.reload();
                    });

                }},
                {text: _lt("Delete"), classes: 'btn-default', close: true, click: function () {
                    $.when(self.dataset.unlink([event.data.id])).then(function () {
                        // $.when(self.dataset.remove_ids([task_id])).then(function () {
                            // self.open_task_id = false;
                            self.reload();
                        // });
                    });
                }},
                {text: _lt("Close"), classes: 'btn-default', close: true, click: function (){

                    self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);

                }}
            ];


        }

         if ( event.data.is_group == false && this.__parentedParent.dataset.select_id(event.data.id)) {

            res_id = event.data.id;

            res_model = this.__parentedParent.dataset.model;
            // res_model = 'project.task';
            res_open = true;
            start_date = event.data.start_date;

        }


        if (res_open) {
            //if (this.dataset.select_id(event.data.id)) {
            // this.do_switch_view('form', null, options); //, null, { mode: "edit" });
            var self = this.__parentedParent;


            var rowdata = '#task-gantt-timeline-row-'+res_id;
            var rowitem = '#task-gantt-item-'+res_id;

            $(rowdata).addClass("task-gantt-timeline-row-hover");
            $(rowitem).addClass("task-gantt-item-hover");

            self.hover_id = res_id;



            self.TimeToLeft = $('.task-gantt-timeline').scrollLeft();
            self.ScrollToTop = $('.o_content').scrollTop();

            var view_id = false;



            new form_common.FormViewDialog(this.__parentedParent, {
            // res_model: this.dataset.model,
            // res_id: event.data.id,            res_model: this.dataset.model,
            res_model: res_model,
            res_id: res_id,
            view_id: view_id,
            context: this.__parentedParent.dataset.context,
            readonly: readonly,
                buttons: buttons

        }).open();



        } else {
            this.__parentedParent.do_warn("Gannt: Open Only - Project or Task # " + event.data.id);
        }
    },

    edit_record: function (event) {
        this.open_record(event, {mode: 'edit'});
    },


    focus_gantt_line: function (event) {

        var self = this.__parentedParent;

        var toscale = self.TimeToScale(event.target.record.task_start.getTime());

        self.TimeToLeft = toscale;
        self.Focus_Gantt(toscale);

        // var task_left = Math.round((event.target.record.task_start.getTime()-this.firstDayScale) / this.pxScaleUTC);
        // $('.task-gantt-timeline').animate( { scrollLeft: task_left-500 }, 1000);

    },


    //Task Item Sort

    // move_right: function (event) {
    //
    //
    //     var data = {};
    //     var self = this.__parentedParent;
    //
    //     var previous_id = event.target.el.previousSibling["data-id"];
    //
    //     if (previous_id) {
    //
    //         data['parent_id'] = previous_id;
    //
    //         self.ScrollToTop = $('.o_content').scrollTop();
    //
    //         self.dataset.write(event.data.id, data, {}).done(function () {
    //                 self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);
    //
    //         });
    //
    //     }
    //
    // },

    // move_left: function (event) {
    //
    //
    //     var data = {};
    //     var self = this.__parentedParent;
    //     var mp_level = event.target.record['mp_level'] - 1;
    //
    //     if (mp_level < 1){
    //         mp_level = 1;
    //     }
    //
    //     data['mp_level'] = mp_level;
    //
    //     self.ScrollToTop = $('.o_content').scrollTop();
    //
    //     self.dataset.write(event.data.id, data, {}).done(function () {
    //             self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);
    //
    //     });
    // },



    on_global_click: function (ev) {

        if (!ev.isTrigger) { //human detect
            var trigger = true;

            if (trigger) {
                var is_group = this.record.is_group || false;
                var group_id = false;
                var group_field = false;


                var start_date = this.record.task_start;

                if (typeof start_date !== typeof undefined && start_date !== false) {
                   start_date =  start_date.getTime()
                }


                //Edit Task
                if ($(ev.target).hasClass("task-gantt-item-name" )) {

                    if (is_group) {

                        group_id = this.record.group_id[0];
                        group_field = this.record.group_field;
                    }

                   this.trigger_up('item_record_edit', {
                       id: this.record.id,
                       is_group: is_group,
                       group_id: group_id,
                       group_field: group_field,
                       start_date: start_date

                   });

                }
                //New Task
                if ($(ev.target).hasClass("fa-plus")) {

                    if (is_group) {
                        group_id = this.record.group_id[0];
                        group_field = this.record.group_field;
                    }

                    this.trigger_up('item_record_add', {
                        id: this.record.id,
                        is_group: is_group,
                        group_id: group_id,
                        group_field: group_field,
                        start_date: start_date
                    });
                }

                //Focus Task
                if ($(ev.target).hasClass("fa-crosshairs")) {
                   this.trigger_up('focus_gantt_line', {id: this.record.id});
                }


                if ($(ev.target).hasClass("fa-arrow-circle-o-right")) {
                   this.trigger_up('move_right', {id: this.record.id});
                }

                if ($(ev.target).hasClass("fa-arrow-circle-o-left")) {
                   this.trigger_up('move_left', {id: this.record.id});
                }

            }
        }
    },



});

return GanttListItem;

});