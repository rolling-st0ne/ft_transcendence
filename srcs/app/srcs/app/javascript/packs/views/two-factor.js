import Backbone from "backbone";
import _ from "underscore";
import Users from "../models/users";
import Utils from "../helpers/utils";

const TwoFactorView = {};

$(function () {
    TwoFactorView.View = Backbone.View.extend({
        template: _.template($('#settings-2fa-template').html()),
        initialize: function () {
            this.model = new Users.TwoFactorModel;
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'error', this.onerror);
            this.model.fetch();
        },
        tagName: 'tbody',
        events: {
            "keypress .input-otp" : "inputOTP"
        },
        inputOTP: function (e) {
            if (e.keyCode !== 13) return;
            this.model.save({otp: this.input.val().trim()},
                {patch:true, success: this.onsuccess});
        },
        onsuccess: function (model) {
            if (model.get('otp_required_for_login'))
                Utils.appAlert('success', {msg: '2FA Enabled'});
            else
                Utils.appAlert('success', {msg: '2FA Disabled'});
            model.trigger('success');
        },
        onerror: function (model, response)  {
            Utils.alertOnAjaxError(response);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.input = this.$('.input-otp');
            return this;
        }
    });
});

export default TwoFactorView;
