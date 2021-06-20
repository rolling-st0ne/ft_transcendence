import Backbone from "backbone";
import _ from "underscore";
import Admin from "../models/admin";
import Utils from "../helpers/utils";
import RoomMembers from "../models/room_members";


const AdminView = {};

$(function () {
    AdminView.ModalConfirmBanView = Backbone.View.extend({
        template: _.template($('#admin-modal-ban-confirm-template').html()),
        events: {
            "click .btn-confirm"    : "confirm",
            "click .btn-cancel"     : "close",
            "click .btn-close"      : "close",
            "click .modal"          : "clickOutside"
        },
        confirm: function () {
            this.model.toggleBanned(this.reasoninput.val().trim());
            this.close();
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
            this.reasoninput = this.$("input#ban-reason");
            $('body').addClass("modal-open");
            $('body.modal-open').on('keydown', {view: this}, this.keylisten);
            return this;
        }
    });

    AdminView.ModalConfirmAdminView = Backbone.View.extend({
        template: _.template($('#admin-modal-admin-confirm-template').html()),
        events: {
            "click .btn-confirm"    : "confirm",
            "click .btn-cancel"     : "close",
            "click .btn-close"      : "close",
            "click .modal"          : "clickOutside"
        },
        confirm: function () {
            this.model.toggleAdmin();
            this.close();
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

	AdminView.SingleUserView = Backbone.View.extend({
        template: _.template($('#admin-singleuser-template').html()),
        events: {
            "keypress .displayname" : "updateOnEnter",
            "click .confirm-ban"    : "openBanConfirm",
            "click .confirm-admin"  : "openAdminConfirm"
        },
        tagName: "tr",
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
        },
        openBanConfirm: function () {
            this.confirmview = new AdminView.ModalConfirmBanView();
            document.body.appendChild(this.confirmview.render(this.model).el);
            this.confirmview.reasoninput.focus();
        },
        openAdminConfirm: function () {
            this.confirmview = new AdminView.ModalConfirmAdminView();
            document.body.appendChild(this.confirmview.render(this.model).el);
        },
        updateOnEnter: function (e) {
            if (e.key !== "Enter") return;

            let newdisplayname = this.input.val().trim();
            if (this.model.get('displayname') !== newdisplayname)
            {
                e.preventDefault();
                e.stopPropagation();
                this.model.save({displayname: newdisplayname},
                    {patch: true, success: this.onsuccess});
            }
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
            this.model.attributes = this.model.previousAttributes();
            this.render();
        },
        onsuccess: function () {
            Utils.appAlert('success', {msg: 'Displayname has been changed'});
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.input = this.$('.displayname');
            let model = this.model;
            this.$('.user_icon').on("error",
                function () { Utils.replaceAvatar(this, model); });
            return this;
        }
    });

	AdminView.UserlistView = Backbone.View.extend({
		template: _.template($('#admin-userlist-template').html()),
		events: {
		    "click #refresh-button" :   "refresh"
        },
		initialize: function (filter, listname) {
            this.listname = listname;
		    if (listname == null)
		        this.listname = 'All Users';
		    this.filter = filter;
		    this.collection = new Admin.UserCollection;
		    this.listenTo(this.collection, 'add', this.addOne);
		    this.listenTo(this.collection, 'reset', this.addAll);
            this.collection.fetch({data: {filter: this.filter},
                reset: true, error: this.onerror});
        },
		addOne: function (user) {
            user.view = new AdminView.SingleUserView({model: user});
            this.$("table#users-table tbody").append(user.view.render().el);
        },
        addAll: function () {
            this.collection.each(this.addOne, this);
        },
        refresh: function () {
            this.collection.fetch({data: {filter: this.filter},
                success: function () {Utils.appAlert('success', {msg: 'Up to date'});},
                error: this.onerror});
        },
        onerror: function (collection, response) {
            Utils.alertOnAjaxError(response);
        },
		render: function () {
			this.$el.html(this.template(_.clone({listname: this.listname})));
			this.addAll();
			return this;
		}
	});

    AdminView.ModalConfirmChatDestroyView = Backbone.View.extend({
        template: _.template($('#admin-destroy-chat-modal-template').html()),
        events: {
            "click .btn-confirm"    : "confirm",
            "click .btn-cancel"     : "close",
            "click .btn-close"      : "close",
            "click .modal"          : "clickOutside"
        },
        confirm: function () {
            this.model.destroy({
                wait: true,
                success: function () {
                    Utils.appAlert('success', {msg: 'Chat has been deleted'});
                }
            });
            this.close();
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

    AdminView.SingleChatView = Backbone.View.extend({
        template: _.template($('#admin-singlechat-template').html()),
        events: {
            "click      .confirm-action"    : "openConfirm",
            "click      .add_remove_admin"  : "show_admin_input",
            "keypress   .form-control"      : "grab_admin_nickname",
        },
        tagName: "tr",
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
        },
        openConfirm: function () {
            this.confirmview = new AdminView.ModalConfirmChatDestroyView();
            document.body.appendChild(this.confirmview.render(this.model).el);
            this.$('.btn-confirm').blur();
        },
        show_admin_input: function (e) {
            var id = e.currentTarget.id;
            $("#" + String(id)).css("display", "block");
            $("#add_remove_admin_input_" + String(id)).css("display", "block");
            $("#" + String(id)).css("display", "none");
            $("#add_remove_admin_input_" + String(id)).focus();

        },
        grab_admin_nickname: function (e) {
            if (e.keyCode !== 13) return ;

            let regex =  /\d+/;
			let id = String(e.currentTarget.id)
            id = id.match(regex);
            $("#" + String(id)).css("display", "block");
            $("#" + String(id)).css("margin", "auto");
            $("#" + e.currentTarget.id).css("display", "none");
            var name = $("#" + e.currentTarget.id).val().trim();
            $("#" + e.currentTarget.id).val("");
            if (name == null || name.length == 0)
                return ;
            var admin = new RoomMembers.AdminName({
                name: name,
                room_id: id
            });
            admin.save();
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

	AdminView.ChatlistView = Backbone.View.extend({
		template: _.template($('#admin-chatlist-template').html()),
		events: {
		    "click #refresh-button" :   "refresh"
        },
		initialize: function () {
		    this.collection = new Admin.ChatCollection;
		    this.listenTo(this.collection, 'add', this.addOne);
		    this.listenTo(this.collection, 'reset', this.addAll);
            this.collection.fetch({reset: true, error: this.onerror});
        },
		addOne: function (chat) {
            chat.view = new AdminView.SingleChatView({model: chat});
            this.$("table#chats-table tbody").append(chat.view.render().el);
        },
        addAll: function () {
            this.collection.each(this.addOne, this);
        },
        refresh: function () {
            this.collection.fetch({
                success: function () {Utils.appAlert('success', {msg: 'Up to date'});},
                error: this.onerror});
        },
        onerror: function (collection, response) {
            Utils.alertOnAjaxError(response);
        },
		render: function () {
			this.$el.html(this.template());
			this.addAll();
			return this;
		}
	});

    AdminView.View = Backbone.View.extend({
        template: _.template($('#admin-template').html()),
        removeactive: function () {
            this.$('#admin-users-tab').removeClass('active', 200);
            this.$('#admin-bans-tab').removeClass('active', 200);
            this.$('#admin-admins-tab').removeClass('active', 200);
            this.$('#admin-owners-tab').removeClass('active', 200);
            this.$('#admin-chats-tab').removeClass('active', 200);
        },
        rendercontent: function (section) {
            this.section = section;
            this.removeactive();
            if (this.section === 'bans') {
                this.content = new AdminView.UserlistView('banned', 'Banlist');
                this.$('#admin-bans-tab').addClass('active', 200);
            } else if (this.section === 'admins') {
                this.content = new AdminView.UserlistView('admin', 'Admins');
                this.$('#admin-admins-tab').addClass('active', 200);
            } else if (this.section === 'owners') {
                this.content = new AdminView.UserlistView('owner', 'Owners');
                this.$('#admin-owners-tab').addClass('active', 200);
            } else if (this.section === 'chats') {
                this.content = new AdminView.ChatlistView();
                this.$('#admin-chats-tab').addClass('active', 200);
            } else {
                this.content = new AdminView.UserlistView();
                this.$('#admin-users-tab').addClass('active', 200);
            }
            this.$('#admin-content').html(this.content.render().el);
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
});

export default AdminView;
