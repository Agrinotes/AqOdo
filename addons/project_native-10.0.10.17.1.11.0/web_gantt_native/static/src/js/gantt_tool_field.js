odoo.define('web_gantt_native.ToolField', function (require) {
"use strict";

    // var core = require('web.core');
    var time = require('web.time');
    var formats = require('web.formats');
    // var _t = core._t;
    // var _lt = core._lt;



    function getFields(parent, group_bys) {

        // this.fields_keys = _.keys(this.fields_view.fields);

        var gantt_fields_0 = [
            "id"
        ];

        var gantt_fields_1 = [

            "name",
            "date_start",
            "date_stop",
            "progress",
            "user_id",

            "task_time",

            "project_id",
            "date_deadline",
            "progress",
            "is_milestone",
            "on_gantt",

            "date_done",
            "state",

            "subtask_project_id",
            "parent_id",

            "sorting_seq",
            "sorting_level",
            "subtask_count"

        ];

        var model_fields_dict = [];
        var model_fields = _.compact(_.map(gantt_fields_1, function(key) {

            var key_field = parent.fields_view.arch.attrs[key] || '';
            model_fields_dict[key] = key_field;
            return key_field
        }));


        model_fields = _.uniq(model_fields.concat(group_bys, gantt_fields_0));


        return {
            model_fields : model_fields,
            gantt_fields : gantt_fields_1,
            model_fields_dict : model_fields_dict
        }

    }



    function flatRows (row_datas) {

        var rows_to_gantt = [];

        //recursive tree to flat task.
        var generate_flat_gantt = function(value) {

            if (value.is_group) {

                rows_to_gantt.push({

                    id: value.id,
                    is_group: value.is_group,
                    group_id: value.group_info,
                    level: value.level,
                    value_name: value.task_name,
                    group_field: value.group_field

                });

            }
            else {

                //Some browser crash
                var assign_to = undefined;
                try {
                     assign_to = value.assign_to[1];
                } catch (err) {}

                rows_to_gantt.push({


                    id: value.id,
                    group_id: value.group_info,
                    level: value.level,
                    value_name: value.task_name,

                    assign_to: assign_to,

                    task_start: value.task_start,
                    task_stop: value.task_stop,tree_seq: value.tree_seq,

                    sorting_level : value.sorting_level,
                    sorting_seq: value.sorting_seq,

                    project_id : value.project_id,

                    date_deadline: value.date_deadline,
                    progress: value.progress,

                    is_milestone: value.is_milestone,
                    on_gantt: value.on_gantt,

                    subtask_project_id: value.subtask_project_id,
                    parent_id: value.parent_id,
                    subtask_count: value.subtask_count,

                    date_done: value.date_done,
                    state: value.state


                });

            }

            _.map(value.child_task, function(sub_task) {
                generate_flat_gantt(sub_task);
            });
        };


        //Generate Flat Gant to rows_to_gantt
        _.map(row_datas, function(result) {
           return generate_flat_gantt(result);
        });

        return rows_to_gantt;


    }


    function groupRows (tasks, group_bys, self_parent) {

        var parent = self_parent;
        var GtimeStopA  = [];
        var GtimeStartA = [];

        var model_fields_dict = parent.model_fields_dict;

       //prevent more that 1 group by
        //   if (group_bys.length > 0) {
        //       group_bys = [group_bys[0]];
        //   }


        // if there is no group by, simulate it
        if (group_bys.length == 0) {
            group_bys = ["_pseudo_group_by"];
            _.each(tasks, function(el) {
                el._pseudo_group_by = "Plain Gantt View";
            });
            this.fields._pseudo_group_by = {type: "string"};
        }


        tasks = _.sortBy(tasks, function(o) { return o.sorting_seq; });

        // get the groups
        var split_groups = function(tasks, group_bys) {

            if (group_bys.length === 0)
                return tasks;
            var sp_groups = [];
            _.each(tasks, function(task) {
                var group_name = task[_.first(group_bys)];
                var group = _.find(sp_groups, function(group) { return _.isEqual(group.name, group_name); });
                if (group === undefined) {
                    group = {name:group_name, tasks: [], __is_group: true};
                   sp_groups.push(group);
                }
                group.tasks.push(task);
            });
            _.each(sp_groups, function(group) {
                group.tasks = split_groups(group.tasks, _.rest(group_bys));
            });
            return sp_groups;
        };

        var groups = split_groups(tasks, group_bys);

        var assign_to = [];
        // genrate task
        var generate_task_info = function(task, plevel) {

            var level = plevel || 0;
            if (task.__is_group) {
                assign_to = task.user_id;
                var task_infos = _.compact(_.map(task.tasks, function(sub_task) {
                    return generate_task_info(sub_task, level + 1);
                }));
                if (task_infos.length == 0)
                    return;

                var group_name = formats.format_value(task.name, parent.fields[group_bys[level]]);
                return {
                    is_group: task.__is_group,
                    group_info: task.name,
                    group_field: group_bys[level],
                    child_task:task_infos,
                    task_name:group_name,
                    level:level
                };
            } else {
                var  today = new Date();
                assign_to = task[model_fields_dict["user_id"]];

                var mp_level = task[model_fields_dict["mp_level"]];

                var sorting_level = task[model_fields_dict["sorting_level"]];
                var sorting_seq = task[model_fields_dict["sorting_seq"]];

                var subtask_project_id = task[model_fields_dict["subtask_project_id"]];
                var parent_id = task[model_fields_dict["parent_id"]];
                var subtask_count = task[model_fields_dict["subtask_count"]];


                var task_name = task.__name;

                var task_start = time.auto_str_to_date(task[model_fields_dict["date_start"]]);
                if (!task_start){
                    task_start = today
                }

                var task_stop = time.auto_str_to_date(task[model_fields_dict["date_stop"]]);
                if (!task_stop) {
                    task_stop = task_start
                }

                var date_deadline = time.auto_str_to_date(task[model_fields_dict["date_deadline"]]);
                if (!date_deadline){
                    date_deadline = false
                }

                var progress = task[model_fields_dict["progress"]];
                var is_milestone = task[model_fields_dict["is_milestone"]];
                var on_gantt = task[model_fields_dict["on_gantt"]];

                var project_id = undefined;
                try {
                     project_id = task[model_fields_dict["project_id"]][0];
                } catch (err) {}


                var date_done = time.auto_str_to_date(task[model_fields_dict["date_done"]]);
                if (!date_done){
                    date_done = false
                }
                var state = task[model_fields_dict["state"]];


                try {
                     GtimeStopA.push(task_stop.getTime());
                } catch (err) {}

                try {
                     GtimeStartA.push(task_start.getTime());
                } catch (err) {}

                try {
                     GtimeStopA.push(date_done.getTime());
                     GtimeStartA.push(date_done.getTime());
                } catch (err) {}

                try {
                    GtimeStopA.push(date_deadline.getTime());
                    GtimeStartA.push(date_deadline.getTime());
                } catch (err) {}



                return {
                    id:task.id,
                    task_name: task_name,
                    task_start: task_start,
                    task_stop: task_stop,
                    level:level,
                    assign_to:assign_to,

                    mp_level : mp_level,

                    sorting_level : sorting_level,
                    sorting_seq : sorting_seq,

                    project_id: project_id,

                    date_deadline: date_deadline,

                    progress: progress,

                    is_milestone: is_milestone,
                    on_gantt: on_gantt,

                    subtask_project_id: subtask_project_id,
                    parent_id: parent_id,
                    subtask_count: subtask_count,

                    date_done: date_done,
                    state: state


                };
            }
        }

        //generate projects info from groupby
        var projects = _.map(groups, function(result) {
           return generate_task_info(result, 0);
        });


        return {
            projects : projects,
            timestop : GtimeStopA,
            timestart : GtimeStartA

        }


    }

    return {
        flatRows: flatRows,
        groupRows: groupRows,
        getFields : getFields
    }

});