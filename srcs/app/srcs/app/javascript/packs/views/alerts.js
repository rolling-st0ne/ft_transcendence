import Backbone from "backbone";
import _ from "underscore";

const AlertsView = {};

$(function () {
    AlertsView.SingleAlert = Backbone.View.extend({
        template: _.template("<li class=\"alert alert-<%= type %>\"><%= msg %></li>"),
        initialize: function (type, msg) {
            this.json = '{"type":"' + type + '", "msg":"' + msg + '"}';
        },
        render: function() {
            this.$el.html(this.template(JSON.parse(this.json)));
            this.$el.hide().fadeIn();
            this.$el.delay(2000).fadeOut(function() { this.remove(); });
            return this;
        }
    });

    AlertsView.View = Backbone.View.extend({
        el: '#app-alerts',
        initialize: function () {
            this.render();
        },
        addOne: function (type, msg) {
            let view = new AlertsView.SingleAlert(type, msg);
            this.el.append(view.render().el);
        },
        render: function () {
            this.$el.html();
            return this;
        }
    });
});

export default AlertsView;
