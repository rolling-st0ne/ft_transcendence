import Backbone from "backbone";
import _ from "underscore";
import Tournaments from "../models/tournaments";
import Utils from "../helpers/utils";
import MainSPA from "../main_spa";
import TournamentChannel from "../../channels/tournament_channel"
import consumer from "../../channels/consumer"
import moment from "moment";
import Users from "../models/users";

const TournamentsView = {};

$(function () {
    TournamentsView.ModalCreateTournamentView = Backbone.View.extend({
        template: _.template($('#tournament-create-modal-template').html()),
        events: {
            "click .btn-confirm"    : "confirm",
            "click .btn-cancel"     : "close",
            "click .btn-close"      : "close",
            "click .modal"          : "clickOutside"
        },
        initialize: function (collection) {
            this.collection = collection;
            this.model = new collection.model();
            // this.model.attributes.start_date = moment().add(1, 'hours').format("YYYY-MM-DDThh:mm");
            // this.model.attributes.end_date = moment().add(2, 'hours').format("YYYY-MM-DDThh:mm");
        },
        confirm: function () {
            const modal = this;
            let start = moment(this.startdateinput.val().trim());
            let end = moment(this.enddateinput.val().trim());
            this.model.save(
                {
                    start_date: start,
                    end_date: end
                },
                {
                    patch: true,
                    success: function (model) {
                        modal.collection.fetch();
                        Utils.appAlert('success', {msg: `Tournament #${model.get('id')} created`});
                        modal.close();
                    },
                    error: function (model, response) {
                        Utils.alertOnAjaxError(response);
                        modal.close();
                    }
                }
            );
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
        render: function() {
            this.$el.html(this.template(this.model.toJSON())).hide().fadeIn(200);
            this.startdateinput = this.$("input#start-date");
            this.enddateinput = this.$("input#end-date");
            $('body').addClass("modal-open");
            $('body.modal-open').on('keydown', {view: this}, this.keylisten);
            return this;
        }
    });

    TournamentsView.SingleTournamentView = Backbone.View.extend({
        template: _.template($('#singletournament-template').html()),
        events: {
            "click" : "openprofile"
        },
        tagName: "tr",
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
        },
        openprofile: function () {
            MainSPA.SPA.router.navigate("#/tournaments/" + this.model.get('id'));
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    TournamentsView.View = Backbone.View.extend({
        template: _.template($('#tournaments-template').html()),
        events: {
            "click #refresh-button" :   "refresh",
            "click #create-button"  :   "openmodal"
        },
        initialize: function () {
            this.collection = new Tournaments.Collection;
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.collection.fetch({reset: true, error: this.onerror});
        },
        addOne: function (tournament) {
            tournament.view = new TournamentsView.SingleTournamentView({model: tournament});
            this.$("#tournaments-table").append(tournament.view.render().el);
        },
        addAll: function () {
            this.collection.each(this.addOne, this);
        },
        openmodal: function () {
            this.createmodal = new TournamentsView.ModalCreateTournamentView(this.collection);
            document.body.appendChild(this.createmodal.render().el);
            this.createmodal.startdateinput.focus();
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
            {
                let view = this;
                (new Users.CurrentUserModel()).fetch({
                    success: function (model) {
                        if (model.get('owner') || model.get('admin'))
                            view.$("#create-button").show();
                    }
                });
            }
            return this;
        }
    });

    TournamentsView.PageView = Backbone.View.extend({
        template: _.template($('#tournamentpage-template').html()),
        events: {
            "click #refresh-button"             :   "refresh",
            "click .join-tournament-button"     :   "join",
            "click .leave-tournament-button"    :   "leave",
            "click .begin-tournament-button"    :   "begin",
            "click .close-tournament-button"    :   "close",
            "click .open-tournament-button"     :   "open",
            "click .finish-tournament-button"   :   "finish",
            "click .destroy-tournament-button"  :   "destroy",
        },
        initialize: function (id) {
            var $this = this;
            this.cable = TournamentChannel.Subscribe({tournament_id: id})
            this.model = new Tournaments.ModelById({id: id})
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'error', this.onerror);
            this.model.fetch({error: this.onerror});
            window.addEventListener('popstate', function (e) {
                $this.break_cable();
            });
        },
        refresh: function () {
            this.model.fetch({
                success: function () {
                    Utils.appAlert('success', {msg: 'Up to date'});
                    },
                error: this.onerror});
        },
        join: function () {
            this.tournament_ajax('join');
        },
        leave: function () {
            this.tournament_ajax('leave');
        },
        begin: function () {
            this.tournament_ajax('begin');
        },
        close: function () {
            this.tournament_ajax('close');
        },
        open: function () {
            this.tournament_ajax('open');
        },
        finish: function () {
            this.tournament_ajax('finish');
        },
        destroy: function () {
            this.model.destroy({
                wait: true,
                success: function (model, response) {
                    Utils.appAlert('success', {json: response});
                    MainSPA.SPA.router.navigate("#/tournaments");
                }
            });
        },
        tournament_ajax: function (action) {
            Utils.ajax(`api/tournaments/${this.model.get('id')}/${action}`,'POST')
                .then((data) => {
                        Utils.appAlert('success', {json: data});
                        this.model.fetch();
                    }, this.onerror
                );
        },
        onerror: function (model, response) {
            if (response == null && model?.responseJSON != null) {
                Utils.alertOnAjaxError(model);
                return;
            }
            Utils.alertOnAjaxError(response);
        },
        break_cable: function () {
            this.cable.Disconnect();
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            if (this.registredusersview == null)
                this.registredusersview = new TournamentsView.UsersView();
            this.$("#registredusers").html(
                this.registredusersview.render(this.model.attributes.tournament_users).el);
            return this;
        }
    });

    TournamentsView.SingleUserView = Backbone.View.extend({
        template: _.template($('#single-tournament-user-template').html()),
        events: {
            "click" : "openprofile",
        },
        tagName: "tr",
        openprofile: function () {
            MainSPA.SPA.router.navigate("#/users/" + this.model.attributes.user.id);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            let model = this.model;
            this.$('.user_icon').on("error",
                function () { Utils.replaceAvatar(this, model); });
            return this;
        }
    });

    TournamentsView.UsersView = Backbone.View.extend({
        template: _.template($('#tournament-users-template').html()),
        addOne: function (user) {
            user.view = new TournamentsView.SingleUserView({model: user});
            this.$("#tournament-users-table").append(user.view.render().el);
        },
        addAll: function () {
            this.collection.each(this.addOne, this);
        },
        render: function (users) {
            this.collection = new Backbone.Collection(users);
            this.$el.html(this.template({usercount: this.collection.length}));
            this.addAll();
            return this;
        }
    });
});

export default TournamentsView;
