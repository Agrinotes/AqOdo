# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
import logging
from lxml import etree

import datetime
from dateutil import tz
import pytz
import time
from string import Template
from datetime import datetime, timedelta
from odoo.exceptions import  Warning
from pdb import set_trace as bp

from itertools import groupby
from operator import itemgetter

from odoo.exceptions import UserError

_logger = logging.getLogger(__name__) # Need for message in console.

# class ProjectTaskAncestor(models.Model):
#
#     _name = 'project.task.ancestor'
#
#
#     task_id = fields.Many2one('project.task', 'Task')
#     ancestor_task_id = fields.Many2one('project.task', 'Parent Task', required=True, domain = "[('project_id','=', parent.project_id)]")
#
#     _sql_constraints = [
#         ('project_task_ancestor_uniq', 'unique(task_id, ancestor_task_id)', 'Must be unique record.'),
#
#     ]

class ProjectTaskPredecessor(models.Model):

    _name = 'project.task.predecessor'

    @api.model
    def _get_link_type(self):
        value = [
            ('FS', _('Finish to Start')),
            ('SS', _('Start to Start')),
            ('FF', _('Finish to Finish')),
            ('SF', _('Start to Finish')),

        ]

        return value


    task_id = fields.Many2one('project.task', 'Task')
    parent_task_id = fields.Many2one('project.task', 'Parent Task', required=True, ondelete='restrict', domain = "[('project_id','=', parent.project_id)]")
    type = fields.Selection('_get_link_type',
                            string='Type',
                            required=True,)



    _sql_constraints = [
        ('project_task_link_uniq', 'unique(task_id, parent_task_id, type)', 'Must be unique.'),

    ]



class ProjectTaskNative(models.Model):
    _name = "project.task"
    _inherit = ['project.task']

    #link
    predecessor_ids = fields.One2many('project.task.predecessor', 'task_id', 'Links')

    #Planning
    # pl_planned_hours =  fields.Float('P. Hours', help='Estimated time to do the task, usually set by the project manager when the task is in draft state.')
    # pl_remaining_hours =  fields.Float('Remaining Hours', digits=(16,2), help="Total remaining time, can be re-estimated periodically by the assignee of the task.")
    #
    # pl_start_date = fields.Datetime(default=fields.Date.today, string='Planned Start Date' )
    # pl_end_date = fields.Datetime(default=fields.Date.today, string='Planned End Date' )
    # pl_percentage_done =  fields.Integer(default=0, string='Done' )

    #scheduled_start = fields.Datetime(default=None, string='Scheduled Start Date',  )
    #scheduled_end = fields.Datetime(default=None, string='Scheduled Start Date' )


    #Sorting
    #mp_level = fields.Integer('mp', default=1)

    #depth = fields.Integer(compute='_compute_depth', store=False)
    # sort_l = fields.Many2one('project.task', 'Sort Left',)
    # sort_r = fields.Many2one('project.task', 'Sort Right',)
    # mp_level = fields.Integer(compute='_compute_mp_level', store=False)
    # ancestor_ids = fields.One2many('project.task.ancestor', 'task_id', 'Links')
    sorting_seq = fields.Integer(string='Sorting Seq.')
    sorting_level = fields.Integer('Sorting Level', default=0)
    sorting_level_seq = fields.Integer('Sorting Level Seq.', default=0)


    #Gantt
    is_milestone = fields.Boolean("Mark as Milestone", default=False)
    on_gantt = fields.Boolean("Task name on gantt", default=False)
    date_finished = fields.Datetime('Done Date')



    @api.multi
    def unlink(self):

        if self.search([('parent_id', 'in', self.ids)],limit=1):
            raise UserError(_(
                    'You can not delete a Parent Task.\nPlease Delete - sub tasks first.'))
        return super(ProjectTaskNative, self).unlink()



    @api.model
    def create(self, vals):

        get_parent_id = vals.get('parent_id', None)

        new_id = super(ProjectTaskNative, self).create(vals)

        if get_parent_id:

            self.do_sorting(new_id.subtask_project_id.id)

        return new_id


    @api.multi
    def write(self, vals):

        get_parent_id = vals.get('parent_id', None)


        result = super(ProjectTaskNative, self).write(vals)

        if get_parent_id is not None and result:


            self.do_sorting(self.subtask_project_id.id)

        return result

    
    @api.one
    @api.depends('parent_id')
    def _compute_sorting(self):
        self.do_sorting(self.subtask_project_id.id)


    def tree_onfly(self, query, parent):
        parent['children'] = []
        for item in query:
            if item['parent_id'] == parent['id']:
                parent['children'].append(item)
                self.tree_onfly(query, item)
        return parent


    def flat_onfly(self, object, level=0):  # recusive search sub level.
        result = []

        def _get_rec(object, level, parent=None):

            object = sorted(object, key=itemgetter('sorting_level_seq'))
            for line in object:

                res = {}
                res['id'] = '{}'.format(line["id"])
                res['name'] = u'{}'.format(line["name"])
                res['parent_id'] = u'{}'.format(line["parent_id"])
                res['sorting_level_seq'] = '{}'.format(line["sorting_level_seq"])
                res['level'] = '{}'.format(level)

                result.append(res)

                if line["children"]:

                    if level < 16:
                        level += 1
                        parent = line["id"]
                    _get_rec(line["children"], level, parent)
                    if level > 0 and level < 16:
                        level -= 1
                        parent = None

            return result

        children = _get_rec(object, level)

        return children


    def do_sorting(self, subtask_project_id,):  # recusive search sub level.

        search_objs = self.sudo().search([('subtask_project_id', '=', subtask_project_id)])

        line_datas = []
        for search_obj in search_objs:
            res = {}
            res['id'] = '{}'.format(search_obj.id)
            res['name'] = u'{}'.format(search_obj.name)
            res['parent_id'] = u'{}'.format(search_obj.parent_id.id)
            res['sorting_level_seq'] = '{}'.format(search_obj.sorting_level_seq)

            line_datas.append(res)

        root = {'id': "False"}
        tree_onfly = self.tree_onfly(line_datas, root)

        flat_onfly = self.flat_onfly(tree_onfly["children"])

        for index, line in enumerate(flat_onfly):

            var_data = {

                "sorting_seq" : index + 1,
                "sorting_level" : int(line["level"])
            }

            task_obj = self.env['project.task']
            task_obj_search = task_obj.sudo().search([('id', '=', int(line["id"]))])
            task_obj_search.sudo().write(var_data)



    # def get_children(self, object, level=0):  # recusive search sub level.
    #     result = []
    #
    #     def _get_rec(object, level, parent=None):
    #         for line in object:
    #
    #             res = {}
    #             res['id'] = '{}'.format(line.id)
    #             res['level'] = '{}'.format(level)
    #             res['name'] = u'{}'.format(line.name)
    #             res['parent_id'] = u'{}'.format(line.parent_id.id)
    #             res['sorting_seq'] = '{}'.format(line.sorting_seq or 0)
    #
    #
    #             result.append(res)
    #
    #             if line.child_ids:
    #
    #                 if level < 16:
    #                     level += 1
    #                     parent = line.id
    #                 _get_rec(line.child_ids, level, parent)
    #                 if level > 0 and level < 16:
    #                     level -= 1
    #                     parent = None
    #
    #         return result
    #
    #     children = _get_rec(object, level)
    #
    #     return children



    @api.model
    def sorting_update(self, sorting_ids, subtask_project_id, project_id):

        for sort in sorting_ids:
            id = sort["id"]
            seq = sort["seq"]

            var_data = {
                "sorting_level_seq" : int(seq)
            }
            task_obj_search = self.sudo().search([('id', '=', int(id))])
            task_obj_search.sudo().write(var_data)

        if not subtask_project_id:

            if project_id:
                project = self.env['project.project'].sudo().search([('id', '=', project_id)])
                if project.id:
                    project.sudo().write({"subtask_project_id": project_id})
                    self.do_sorting(project_id)

        if subtask_project_id:
            self.do_sorting(subtask_project_id[0])

    @api.model
    def childs_get(self, ids_field_name, ids, fields):

        test = "OK"
        return test



