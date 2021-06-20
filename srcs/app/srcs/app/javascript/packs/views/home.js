import Backbone from "backbone";
import _ from "underscore";

const HomeView = {};

$(function () {
	HomeView.View = Backbone.View.extend({
		template: _.template($('#home-template').html()),
		events: {},
		render: function () {
			this.$el.html(this.template());
			return this;
		}
	});
});

export default HomeView;