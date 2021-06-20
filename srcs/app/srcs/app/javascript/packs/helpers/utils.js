import MainSPA from "../main_spa";
import {toString} from "underscore/modules/_setup";

export default class Utils {
    // replaces avatar with default from db
    // if default from db is unavailable - replaces to common default
    // if common default is unavailable - element is removed
    static replaceAvatar (elem, model) {
        if ($(elem).attr('src') === "/assets/avatar_default.jpg")
            $(elem).remove();
        else {
            let replacesrc = model.get('avatar_default_url');
            if ($(elem).attr('src') === replacesrc)
                replacesrc = "/assets/avatar_default.jpg";
            $(elem).attr("src", replacesrc);
        }
        return true;
    }

    static capitalizeFirstLetter(string) {
        return string[0].toUpperCase() + string.slice(1);
    }

    static appAlert(type, options) {
        if (options['msg'])
            MainSPA.SPA.app_alerts.addOne(type, Utils.capitalizeFirstLetter(options['msg']));
        if (options['json'])
            Object.values(options['json']).forEach((val) =>
                val.toString().split(',').forEach((msg) =>
                    Utils.appAlert(type, {msg: msg})));
    };

    static alertOnAjaxError(response) {
        if (response?.responseJSON == null)  //  true for undefined too
            Utils.appAlert('danger', {msg: 'No response from API'});
        else
            Utils.appAlert('danger', {json: response.responseJSON});
    }

    static ajax(url, http, data) {
        return new Promise(((resolve, reject) => {
            $.ajax(url, {
                type: http,
                data: data,
                headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')}
            }).done(resolve).fail(reject);
        }));
    }

    static getShortDate(s) {
        let date = new Date(s);
        return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear().toString().substring(2,5);
    }

    static getTime(s) {
        let date = new Date(s);
        return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    }

    static accept_guild_invite(guild_id, guild_name, model) {
        $.ajax({
            url: 'api/users/current/' + '/join_guild',
            type: 'PUT',
            data: `guild_id=${guild_id}`,
            success: () => {
                Utils.appAlert('success', {msg: guild_name + '\'s invitation accepted'});
                if (model.collection == null)
                    model.fetch();
                else {
                    model.collection.fetch();
                    MainSPA.SPA.router.navigate("#/guilds/" + guild_id);
                }
            },
            error: (response) => {
                Utils.alertOnAjaxError(response);
            }
        });
    }

    static decline_guild_invite(user_id, guild_id, msg) {
        $.ajax({
            url: '/api/users/' + user_id  + '/guild_invitations/' + guild_id,
            type: 'DELETE',
            success: () => {
                Utils.appAlert('success', {msg: msg});
            },
            error: (response) => {
                Utils.alertOnAjaxError(response);
            }
        });
    }

    static decline_join_guild_request(user_id, username) {
        $.ajax({
            url: 'api/users/' + user_id + '/leave_guild',
            type: 'PUT',
            success: () => {
                Utils.appAlert('success', {msg: username + '\'s request declined'});
            },
            error: (response) => {
                Utils.alertOnAjaxError(response);
            }
        });
    }

    static leave_guild(view) {
        let name = view.model.get('name');
        view.cur_user.fetch({
            success: function (model) {
                if (model.get('guild_id') != view.model.get('id')) {
                    Utils.appAlert('danger', {msg: 'You are not a member of ' + name});
                    return;
                }
                $.ajax({
                    url: 'api/users/' + model.get('id') + '/leave_guild',
                    type: 'PUT',
                    success: () => {
                        Utils.appAlert('success', {msg: 'You left the guild ' + name});
                        if (view.model.collection == null)
                            view.model.fetch();
                        else
                            view.model.collection.fetch();
                    },
                    error: (response) => {
                        Utils.alertOnAjaxError(response);
                    }
                });
            },
            error: Utils.alertOnAjaxError
        });
    }

    static accept_join_guild_request(user_id, username) {
        $.ajax({
            url: 'api/users/' + user_id + '/join_guild',
            type: 'PUT',
            data: `guild_accepted=${true}`,
            success: () => {
                Utils.appAlert('success', {msg: username + '\'s request accepted'});
            },
            error: (response) => {
                Utils.alertOnAjaxError(response);
            }
        });
    }

    static has_guild_invitation(user_id, guild_id) {
        let response = $.ajax({
            url: '/api/users/' + user_id + '/guild_invitations/' + guild_id,
            type: 'GET',
            async: false,
        }).responseText;
        return response ? true : false;
    }

    static change_user_guildrole(view, data) {
        $.ajax({
            url: 'api/users/' + view.model.get('id')+ '/join_guild',
            type: 'PUT',
            data: data,
            success: () => {
                Utils.appAlert('success', {msg: view.model.get('displayname') + '\'s role changed'});
                if (data != `guild_master=${true}`) {
                    Utils.view_rerender(view);
                } else
                    MainSPA.SPA.router.navigate("#/guilds/" + view.model.get('guild_id'));
            },
            error: (response) => {
                Utils.alertOnAjaxError(response);
            }
        });
    }

    static join_guild_request(view) {
        let name;
        view.cur_user.fetch({
            success: function (model) {
                if (model.get('guild_accepted')) {
                    Utils.appAlert('danger', {msg: 'You are in the guild already'});
                    return;
                }
                if (model.get('guild_id')) {
                    if (model.get('guild_id') == view.model.get('id')) {
                        Utils.appAlert('danger', {msg: 'Request already sent'});
                        return;
                    }
                    name = model.attributes.guild.name;
                }
                model.save({guild_id: view.model.id}, {
                    patch: true,
                    success: function () {
                        Utils.appAlert('success', {msg: 'Request to ' + view.model.get('name') + ' sent'});
                        if (name)
                            Utils.appAlert('success', {msg: 'Request to ' + name + ' canceled'});
                        if (view.model.collection == null)
                            view.model.fetch();
                        else
                            view.model.collection.fetch();
                    },
                    onerror: Utils.alertOnAjaxError
                });
            },
            error: Utils.alertOnAjaxError
        });
    }

    static cancel_guild_request(view) {
        view.cur_user.fetch({
            success: function (model) {
                if (model.get('guild_accepted')) {
                    Utils.appAlert('danger', {msg: 'You are in the guild already'});
                    return;
                }
                if (!model.get('guild_id') || model.get('guild_id') != view.model.get('id')) {
                    Utils.appAlert('danger', {msg: 'Request not found'});
                    return;
                }
                $.ajax({
                    url: 'api/users/' + model.get('id') + '/leave_guild',
                    type: 'PUT',
                    success: () => {
                        Utils.appAlert('success', {msg: 'Request canceled'});
                        if (view.model.collection == null)
                            view.model.fetch();
                        else
                            view.model.collection.fetch();
                    },
                    error: (response) => {
                        Utils.alertOnAjaxError(response);
                    }
                });
            },
            error: Utils.alertOnAjaxError
        });
    }

    static invite_to_guild(view) {
        $.ajax({
            url: 'api/users/' + view.model.get('id') + '/guild_invitations/',
            type: 'POST',
            data: `user_id=${view.model.get('id')}`,
            success: () => {
                Utils.appAlert('success', {msg: 'Invitation to ' + view.model.get('displayname') + ' sent'});
                view.render();
            },
            error: (response) => {
                Utils.alertOnAjaxError(response);
            }
        });
    }

    static view_rerender(view) {
        view.model.fetch({
            success: function () {
                view.render();
            }
        });
    }

    static accept_war_invite(view, remove) {
        $.ajax({
            url: 'api/guilds/' + view.model.get('guild2_id') + '/war_invites/' + view.model.get('id'),
            type: 'PUT',
            success: () => {
                Utils.appAlert('success', {msg: 'Get ready to the war!'});
                remove ? view.remove() : view.render();
            },
            error: (response) => {
                Utils.alertOnAjaxError(response);
            }
        });
    }

}
