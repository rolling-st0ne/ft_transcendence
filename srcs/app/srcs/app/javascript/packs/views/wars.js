import Backbone from "backbone";
import _ from "underscore";
import moment, { relativeTimeThreshold } from "moment";
import MainSPA from "../main_spa";
import Wars from "../models/wars";
import Users from "../models/users";
import Utils from "../helpers/utils";

const WarsView = {};

$(function () {
    WarsView.WarView = Backbone.View.extend({
        template: _.template($('#war-template').html()),
        events: {
            "click #more-button" :   "warProfile"
        },
        tagName: "div",
        initialize: function () {
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function() {
            this.model.attributes.start = Utils.getShortDate(this.model.attributes.start);
            this.model.attributes.end = Utils.getShortDate(this.model.attributes.end)
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        warProfile: function () {
            MainSPA.SPA.router.navigate("#/wars/" + this.model.get('id'));
        }
    });

    WarsView.View = Backbone.View.extend({
        template: _.template($('#wars-template').html()),
        events: {
            "click #refresh-button" :   "refresh"
        },
        initialize: function () {
            this.collection = new Wars.WarCollection;
            this.listenTo(this.collection, 'change', this.render);
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.collection.fetch({reset: true, error: this.onFetchError});
        },
        addOne: function (war) {
            war.this = new WarsView.WarView({model: war});
            this.el.append(war.this.render().el);
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
        render: function () {
            this.$el.html(this.template());
            this.addAll();
            return this;
        }
    });

    WarsView.GuildWarsView = Backbone.View.extend({
        template: _.template($('#wars-template').html()),
        events: {
            "click #refresh-button" :   "refresh"
        },
        initialize: function (id) {
            this.collection = new Wars.GuildWarsCollection([], {id: id});
            this.listenTo(this.collection, 'change', this.render);
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.collection.fetch({reset: true, error: this.onFetchError});
        },
        addOne: function (war) {
            war.this = new WarsView.WarView({model: war});
            this.el.append(war.this.render().el);
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
        render: function () {
            this.$el.html(this.template());
            this.addAll();
            return this;
        }
    });

    WarsView.WarInvitationView = Backbone.View.extend({
        template: _.template($('#war-invite-template').html()),
        events: {
            "click #accept-button": "accept",
            "click #decline-button": "decline",
            "click #more-button" :   "warProfile"
        },
        tagName: "div",
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
        },
        render: function() {
            this.model.attributes.start = Utils.getShortDate(this.model.attributes.start);
            this.model.attributes.end = Utils.getShortDate(this.model.attributes.end)
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        warProfile: function () {
            MainSPA.SPA.router.navigate("#/wars/" + this.model.get('id'));
        },
        accept:  function() {
           Utils.accept_war_invite(this, true)
        },
        decline:  function() {
            this.model.destroy( {
                success: () => {
                    Utils.appAlert('success', {msg: 'War canceled'});
                }, error: this.onerror});
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

    WarsView.WarInvitesView = Backbone.View.extend({
        template: _.template($('#war-invites-template').html()),
        events: {
            "click #refresh-button" :   "refresh"
        },
        initialize: function (id) {
            this.collection = new Wars.WarInvitesCollection([], {id: id});
            this.listenTo(this.collection, 'change', this.render);
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.collection.fetch({reset: true, error: this.onerror});
        },
        addOne: function (war) {
            war.attributes.winner = 'invite';
            war.view = new WarsView.WarInvitationView({model: war});
            this.el.append(war.view.render().el);
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

    WarsView.WarRequestsView = Backbone.View.extend({
        template: _.template($('#war-invites-template').html()),
        events: {
            "click #refresh-button" :   "refresh"
        },
        initialize: function (id) {
            this.collection = new Wars.WarRequestsCollection([], {id: id});
            this.listenTo(this.collection, 'change', this.render);
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.collection.fetch({reset: true, error: this.onerror});
        },
        addOne: function (war) {
            war.attributes.winner = 'request';
            war.view = new WarsView.WarInvitationView({model: war});
            this.el.append(war.view.render().el);
        },
        addAll: function () {
            this.collection.each(this.addOne, this);
        },
        refresh: function () {
            this.collection.fetch({
                success: function () {
                    Utils.appAlert('success', {msg: 'Up to date'});},
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

    WarsView.ProfileView = Backbone.View.extend({
        cur_user : new Users.CurrentUserModel,
        template: _.template($('#war-profile-template').html()),
        events: {
            "click #refresh-button" :   "refresh",
            "click #accept-button": "accept",
            "click #decline-button": "decline"
        },
        initialize: function (id) {
            this.model = new Wars.WarId({id: id});
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
        accept:  function() {
            Utils.accept_war_invite(this, false)
        },
        decline:  function() {
            this.model.destroy( { success: () => {
                    Utils.appAlert('success', {msg: 'War canceled'});
                }, error: this.onerror});
            //TODO: navigate to previous page instead of guilds
            MainSPA.SPA.router.navigate("#/guilds");
        },
        render: function () {
            this.model.attributes.wartime_start = Utils.getTime(this.model.attributes.wartime_start);
            this.model.attributes.wartime_end = Utils.getTime(this.model.attributes.wartime_end);
            this.model.attributes.start = moment(this.model.attributes.start).format("ddd, MMM Do YYYY, h:mm Z");
            this.model.attributes.end = moment(this.model.attributes.end).format("ddd, MMM Do YYYY, h:mm Z");
            if  (!this.model.get('accepted')) {
                let view = this;
                 this.cur_user.fetch({
                     success: function (model) {
                         if (model.get('guild_master')) {
                             let id = model.get('guild_id');
                             if (id == view.model.get('guild1_id'))
                                 view.model.attributes.winner = 'request';
                             if (id == view.model.get('guild2_id'))
                                 view.model.attributes.winner = 'invite';
                             view.$el.html(view.template(view.model.toJSON()));
                         }
                     },
                     error: this.onerror
                 });
            } else
                this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    WarsView.DeclareWarView = Backbone.View.extend({
        template: _.template($('#war-modal-template').html()),
        events: {
            "click .btn-cancel"     : "close",
            "click .btn-close"      : "close",
            "click .modal"          : "clickOutside",
            "submit #war-form"      : "declareWar",
            'keypress'              : 'keylisten'
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
            if (e.key === "Enter") {
                e.preventDefault();
                $(':input:visible:eq(' + ($(':input:visible').index(e.target) + 1) + ')').focus().not('textarea').select();
            }
            if (e.key === "Escape")
                e.data.view.close();
        },
        declareWar: function() {
            let start = $('#war-start').val().trim();
            let end = $('#war-end').val().trim();
            let wartime_start = $('#wartime-start').val().trim();
            let wartime_end = $('#wartime-end').val().trim();
            let tz = $('#timezone').val();
            if (moment(end).diff(moment(start), 'hours') < 24) {
                wartime_start = start
                wartime_end = start
            }
            else {
                if (wartime_end)
                    wartime_end = wartime_start && parseInt(wartime_end) < parseInt(wartime_start) ? '2021-01-02 ' + wartime_end : '2021-01-01 ' + wartime_end;
                else
                    wartime_end = '2021-01-01 00:00:00.0'
                if (wartime_start)
                    wartime_start = '2021-01-01 ' + wartime_start;
                else
                    wartime_start = '2021-01-01 00:00:00.0'
            }
            let data = 'guild2_id='+ this.model.get('id') +
                '&stake=' + $('#stake').val().trim() +
                '&start=' + start + ':59' + tz +
                '&end=' + end + ':59' + tz +
                '&wartime_start=' + wartime_start + ':59' + tz +
                '&wartime_end=' + wartime_end + ':59' + tz;
            let max_unanswered = $('#max-unanswered').val().trim();
            if (max_unanswered)
                data += '&max_unanswered=' + max_unanswered;
            let wait_time = $('#wait-time').val().trim();
            if (wait_time)
                data += '&wait_minutes=' + wait_time;
            if($('#include-tournament').is(":checked"))
                data += '&tournament=true';
            if($('#include-ladder').is(":checked"))
                data += '&ladder=true';
            $.ajax({
                url: 'api/wars/',
                type: 'POST',
                data: data,
                success: (result) => {
                    Utils.appAlert('success', {msg: 'You declared war to the ' + this.model.get('name')});
                    MainSPA.SPA.router.navigate("#/wars/" + result.id);
                    this.close();
                },
                error: (response) => {
                    Utils.alertOnAjaxError(response);
                }
            });
        },
        render: function(model) {
            this.model = model;
            this.$el.html(this.template(this.model.toJSON())).hide().fadeIn(200);
            this.input = this.$("input#stake");
            $('body').addClass("modal-open");
            $('body.modal-open').on('keydown', {view: this}, this.keylisten);
            return this;
        }
    });
});

export default WarsView;
