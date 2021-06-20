import Backbone from "backbone";
import _ from "underscore";
import Guilds from "../models/guilds";
import Users from "../models/users";
import Utils from "../helpers/utils";
import MainSPA from "../main_spa";
import WarsView from "./wars";
import UsersView from "./users";

const GuildsView = {};

$(function () {
    GuildsView.SingleGuildView = Backbone.View.extend({
        cur_user: new Users.CurrentUserModel,
        template: _.template($('#guild-template').html()),
        events: {
            "click #join-button": "join",
            "click #cancel-button": "cancelRequest",
            "click #accept-button": "accept",
            "click #decline-button": "decline",
            "click #leave-button": "leave",
            "click #war-button": "openDeclaration"
        },
        tagName: "div",
        initialize: function () {
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        join:  function() {
            Utils.join_guild_request(this);
        },
        cancelRequest:  function() {
            Utils.cancel_guild_request(this);
        },
        leave:  function() {
            Utils.leave_guild(this);
        },
        accept: function() {
            let id = this.model.get('id')
            Utils.accept_guild_invite(id, this.model.get('name'), this.model);
        },
        decline:  function() {
            Utils.decline_guild_invite('current', this.model.get('id'), this.model.get('name') + '\'s invitation declined');
            Utils.view_rerender(this);
        },
        openDeclaration: function () {
            this.confirmview = new WarsView.DeclareWarView();
            document.body.appendChild(this.confirmview.render(this.model).el);
            this.confirmview.input.focus();
        }
    });

    GuildsView.View = Backbone.View.extend({
        cur_user: new Users.CurrentUserModel,
        template1: _.template($('#guilds-template').html()),
        template2: _.template($('#guilds-template-create').html()),
        events: {
            "click #refresh-button" :   "refresh",
            "submit #create-guild": "createGuild"
        },
        initialize: function () {
            this.collection = new Guilds.GuildCollection;
            this.listenTo(this.collection, 'change', this.render);
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            //this.collection.on("change:current_user_role", this.render);
            this.collection.fetch({reset: true, error: this.onFetchError});
        },
        addOne: function (guild) {
            guild.view = new GuildsView.SingleGuildView({model: guild});
            this.el.append(guild.view.render().el);
        },
        addAll: function () {
            this.collection.each(this.addOne, this);
        },
        refresh: function () {
            this.collection.fetch({
                success: function () {Utils.appAlert('success', {msg: 'Up to date'});},
                error: this.onFetchError});
        },
        onFetchError: function () {
            Utils.appAlert('danger', {msg: 'Fetch from API failed'});
        },
        createGuild: function(e) {
            e.preventDefault();
            e.stopPropagation();
            name = $('#newGuildName').val().trim()
            $.ajax({
                url: 'api/guilds/',
                type: 'POST',
                data: `name=${name}`,
                success: (result) => {
                    Utils.appAlert('success', {msg: 'Guild ' + name + ' has been created'});
                    this.collection.fetch({
                        error: this.onFetchError});
                    MainSPA.SPA.router.navigate("#/guilds/" + result.id);
                },
                error: (response) => {
                    Utils.alertOnAjaxError(response);
                }
            });
        },
        render: function () {
            let view = this;
            this.cur_user.fetch({
                success: function (model) {
                    if (model.get('guild_accepted'))
                        view.$el.html(view.template1());
                    else
                        view.$el.html(view.template2());
                    view.addAll();
                    },
                error: function () {
                    view.$el.html(view.template2());
                    view.addAll();
                }
            });
            return this;
        }
    });

    GuildsView.ProfileView = Backbone.View.extend({
        cur_user : new Users.CurrentUserModel,
        template: _.template($('#guild-profile-template').html()),
        events: {
            "click #refresh-button" :   "refresh",
            "keypress #anagram" : "updateOnEnter",
            "click #join-button": "join",
            "click #cancel-button": "cancelRequest",
            "click #accept-button": "accept",
            "click #decline-button": "decline",
            "click #leave-button": "leave",
            "click #war-button": "openDeclaration",
            "click #delete-button" : "openDeleteConfirm"
        },
        initialize: function (id) {
            this.model = new Guilds.GuildId({id: id});
            this.listenTo(this.model, 'change', this.render);
            this.model.fetch({error: this.onerror});
        },
        refresh: function () {
            this.model.fetch({
                success: function () {
                    Utils.appAlert('success', {msg: 'Up to date'});},
                error: this.onerror
            });
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        join:  function() {
            Utils.join_guild_request(this);
        },
        cancelRequest:  function() {
            Utils.cancel_guild_request(this);
        },
        leave:  function() {
            Utils.leave_guild(this);
        },
        accept: function() {
            Utils.accept_guild_invite(this.model.get('id'), this.model.get('name'), this.model);
        },
        decline:  function() {
            Utils.decline_guild_invite('current', this.model.get('id'), this.model.get('name') + '\'s invitation declined');
            Utils.view_rerender(this);
        },
        openDeclaration: function () {
            this.warconfirmview = new WarsView.DeclareWarView();
            document.body.appendChild(this.warconfirmview.render(this.model).el);
            this.warconfirmview.input.focus();
        },
        openDeleteConfirm: function () {
            this.confirmview = new GuildsView.GuildDeleteView();
            document.body.appendChild(this.confirmview.render(this.model).el);
        },
        updateOnEnter: function (e) {
            if (e.keyCode !== 13) return;
            let newanagram = $('#anagram').val().trim();
            let view = this;
            if (this.model.get('anagram') !== newanagram) {
                e.preventDefault();
                e.stopPropagation();
                this.model.save({anagram: newanagram},
                    {patch: true,
                        success: function () {
                            Utils.appAlert('success', {msg: 'Anagram has been changed'});},
                        error: function (model, response) {
                            Utils.alertOnAjaxError(response);
                            model.attributes = model.previousAttributes();
                            view.render();
                        }
                    });
            }
        }
    });

    GuildsView.GuildDeleteView = Backbone.View.extend({
        template: _.template($('#delete-guild-modal-template').html()),
        events: {
            "click .btn-confirm"    : "delete_guild",
            "click .btn-cancel"     : "close",
            "click .modal"          : "clickOutside"
        },
        delete_guild : function () {
            $.ajax({
                url: 'api/guilds/' + this.model.id,
                type: 'DELETE',
                success: () => {
                    Utils.appAlert('success', {msg: 'Guild ' + name + ' has been deleted'});
                    MainSPA.SPA.router.navigate("#/guilds");
                    this.close();
                },
                error: (response) => {
                    Utils.alertOnAjaxError(response);
                }
            });
        },
        clickOutside: function (e) {
            if (e.target === e.currentTarget)
                this.close();
        },
        close: function () {
            $('body.modal-open').off('keydown', this.keylisten);
            $('body').removeClass("modal-open");
            let view = this;
            this.$el.fadeOut(200, function () { view.remove(); });
        },
        keylisten: function (e) {
            if (e.key === "Enter")
                e.data.view.confirm();
            if (e.key === "Escape")
                e.data.view.close();
        },
        render: function(model) {
            this.model = model;
            this.$el.html(this.template(this.model.toJSON())).hide().fadeIn(200);
            $('body').addClass("modal-open");
            $('body.modal-open').on('keydown', {view: this}, this.keylisten);
            return this;
        }
    });


    GuildsView.GuildInvitationView = Backbone.View.extend({
        template: _.template($('#guild-invite-template').html()),
        events: {
            "click #accept-button": "accept",
            "click #decline-button": "decline"
        },
        tagName: "div",
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
        },
        render: function() {
            this.model.attributes.view = 'invite';
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        accept:  function() {
            Utils.accept_guild_invite(this.model.get('id'), this.model.get('name'), this.model);
            this.remove();
        },
        decline:  function() {
            Utils.decline_guild_invite('current', this.model.get('id'), this.model.get('name') + '\'s invitation declined');
            this.remove();
        },
        remove: function() {
            this.$el.empty().off();
            this.stopListening();
            return this;
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        }
    });

    GuildsView.GuildInvitationsView = Backbone.View.extend({
        template: _.template($('#guild-invites-template').html()),
        events: {
            "click #refresh-button" :   "refresh"
        },
        initialize: function (id) {
            this.collection = new Guilds.GuildInvitationsCollection([], {id: id});
            this.listenTo(this.collection, 'change', this.render);
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.collection.fetch({reset: true, error: this.onerror});
        },
        addOne: function (guild) {
            guild.view = new GuildsView.GuildInvitationView({model: guild});
            this.el.append(guild.view.render().el);
        },
        addAll: function () {
            this.collection.each(this.addOne, this);
        },
        refresh: function () {
            this.collection.fetch({
                success: function () {Utils.appAlert('success', {msg: 'Up to date'});},
                error: this.onerror});
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        },
        render: function () {
            this.$el.html(this.template());
            this.addAll();
            return this;
        }
    });

});

export default GuildsView;
