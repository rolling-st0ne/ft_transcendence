import Backbone from "backbone";
import _ from "underscore";
import SettingsModel from "../models/settings";
import TwoFactorView from "./two-factor";
import Utils from "../helpers/utils";

const SettingsView = {};

$(function () {
	SettingsView.View = Backbone.View.extend({
		template: _.template($('#settings-template').html()),
		events:{
			'blur input#email' : 'input_email',
			'blur input#displayname' : 'input_displayname',
			'blur input.upload_user_avatar' : 'update_avatar_close',
			'click .user_avatar' : 'update_avatar',
			'click #upload_user_avatar' : 'upload_avatar_url',
			'click #2fa-button' : 'open_2fa',
			"keypress input" : "blurOnEnter",
		},
		initialize: function () {
			this.model = new SettingsModel;
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'error', this.onerror)
			this.model.fetch();
		},
		blurOnEnter: function (e) {
			if (e.key !== "Enter") return;
			e.target.blur();
		},
		render: function () {
			if (this.otpview)
				this.close_2fa();
			this.$el.html(this.template(this.model.toJSON()));
			let model = this.model;
			this.$('.user_avatar').on("error",
				function () { Utils.replaceAvatar(this, model); });
			return this;
		},
		input_email: function ()
		{
			let newemail = $('#email').val().trim();
			if (this.model.get('email') !== newemail)
				this.model.save({email: newemail}, {
					patch: true,
					success: function () {Utils.appAlert('success', {msg: 'Email changed'})}
				});
		},
		input_displayname: function ()
		{
			let newdisplayname = $('#displayname').val().trim();
			if (this.model.get('displayname') !== newdisplayname)
				this.model.save({displayname: newdisplayname}, {
					patch: true,
					success: function () {Utils.appAlert('success', {msg: 'Displayname changed'})}
				});
		},
		update_avatar: function () {
			this.$('.table-avatar').addClass('edit_url');
			$('.upload_user_avatar').focus();
		},
		update_avatar_close: function () {
			if ($('.upload_user_avatar').val().trim()) {
				this.model.save({avatar_url: $('.upload_user_avatar').val().trim()}, {
					patch: true,
					success: function (model) {
						Utils.appAlert('success', {msg: 'Avatar url changed'});
						$("img.navbar_user_icon").attr('src', model.get('avatar_url'));
					}
				});
			}
			this.$('.table-avatar').addClass('edit_url');
			this.render();
		},
		onerror: function (model, response) {
			Utils.alertOnAjaxError(response);
			this.model.attributes = this.model.previousAttributes();
			this.render();
		},
		open_2fa: function () {
			if (this.otpview)
				this.close_2fa();
			else {
				this.otpview = new TwoFactorView.View();
				this.$('.two-factor-body').html(this.otpview.el);
				this.$('#2fa-button').html('Hide');
				this.listenTo(this.otpview.model, 'success', this.close_2fa);
			}
		},
		close_2fa: function () {
			this.otpview.remove();
			this.stopListening();
			this.otpview = null;
			this.$('#2fa-button').html('Show');
		}
	});
});

export default SettingsView;
