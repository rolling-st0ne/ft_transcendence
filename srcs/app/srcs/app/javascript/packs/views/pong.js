import Backbone from "backbone";
import _ from "underscore";
import GameRoomInit from "../../channels/game_room_channel";
import {obtainedValues} from "../../channels/game_room_channel";
import consumer from "../../channels/consumer"
import Pong from "../models/pong";
import pong_game from "../pong_game";

const PongView = {};

$(function () {
	PongView.View = Backbone.View.extend({
		template: _.template($('#pong-template').html()),
		events: {},
		initialize: function (id) {
			consumer.subscriptions.subscriptions.forEach((subscription) => {
				let found = subscription.identifier.search("{\"channel\":\"GameRoomChannel\",\"match_id\":" + id + "}")
				if (found != -1)
					this.cable = subscription;
			} )
			this.model = new Pong.MatchModel(id);
			let $this = this;
			this.model.fetch({
				success: function () {
					$this.first_player_id = $this.model.attributes.first_player_id;
					$this.second_player_id = $this.model.attributes.second_player_id;
					$this.render();
				}
			});
			this.first_player_score = 0;
			this.second_player_score = 0;
		},
		render: function () {
			this.$el.html(this.template());
			pong_game(this);
			return this;
		},
		setFirstPlayerScore: function (score)
		{
			this.first_player_score = score;
		},
		broadcastScore: function (score)
		{
			this.cable.send(score);
		},
		getRightScore: function ()
		{
			return (obtainedValues.rightScore);
		},
		getLeftScore: function ()
		{
			return (obtainedValues.leftScore);
		},
		setSecondPlayerScore: function (score)
		{
			this.second_player_score = score;
		},
		broadcastRight: function (right)
		{
			this.cable.send({right: right});
		},
		broadcastLeft: function (left)
		{
			this.cable.send({left: left});
		},
		broadcastBall: function(pos)
		{
			this.cable.send({ball: pos})
		},
		getLeftPadY: function ()
		{
			return (obtainedValues.leftPadY);
		},
		getRightPadY: function ()
		{
			return (obtainedValues.rightPadY);
		},
		getBallX: function ()
		{
			return (obtainedValues.ballx);
		},
		getBallY: function ()
		{
			return (obtainedValues.bally);
		},
		finishGame: function (winner_id)
		{
			console.log("GAME IS FINISHED");
			this.model.save({status: 3, winner: winner_id, first_player_score: this.first_player_score, second_player_score: this.second_player_score});
			this.cable.send("finish")
		},
	});
});

export default PongView;
