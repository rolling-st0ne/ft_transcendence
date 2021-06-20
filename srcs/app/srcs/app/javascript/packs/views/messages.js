import Backbone from "backbone";
import _ from "underscore";
import Utils from "../helpers/utils";
import Messages from "../models/messages";
import Users from "../models/users";
import Rooms from "../models/rooms";
import MainSPA from "../main_spa";
import RoomMembers from "../models/room_members"
import SubToChannel from "../../channels/chat_channel"
import SubToDirect from "../../channels/direct_channel"
import { relativeTimeThreshold } from "moment";

const MessagesView = {};

$(function () {
	MessagesView.MessageView = Backbone.View.extend({
		template: _.template($('#message-template').html()),
		initialize: function () {
		},
		events: {
			"click .user_icon" : "open_user_profile",
			"click #block_user_room" : "block_user",
			"click #make_adm" : "make_adm",
			"click .make_adm" : "make_adm"
		},
		open_user_profile: function () {
			var $this = this;
			var u_id = $this.$('.message').attr("data-user-id");
			MainSPA.SPA.router.navigate("#/users/" + u_id);
		},
		block_user: function () {
			var $this = this
			var room = new Rooms.RoomId({id: this.model.get("room_id")})
			room.fetch({
				success: function () {
					let dname = $this.model.get("displayname");
					if (room.attributes.owner_id == $this.model.get("user_id"))
					{
						Utils.appAlert('danger', {msg: 'This is room owner. He will be upset if you will block him :('});
						return ;
					}
					var BlockTime = prompt("Are you sure you want to block " + dname + "?\nEnter time in minutes:", "");
					if (isNaN(BlockTime) || BlockTime == null || BlockTime.length == 0)
					{
						if (isNaN(BlockTime))
							Utils.appAlert('danger', {msg: 'Time must be integer'});
						return $this;
					}
					var BlockToRoom = new RoomMembers.RoomMembersModel({
						user_id: $this.model.get("user_id"),
						room_id: $this.model.get("room_id"),
						time: BlockTime
					})
				}
			})
			return ;
			BlockToRoom.save(null, {
				success: function () {
					Utils.appAlert('success', {msg: 'User ' + dname + ' is banned for ' + BlockTime});
				}
			});
		},
		make_adm: function () {
			let dname = this.model.get("displayname");
			if (!confirm('Are you sure you want make ' + dname + " chat administrator?")) {
				return this;
			}
			var admin = new RoomMembers.Admin({
				id: this.model.get("room_id"),
				user_id: this.model.get("user_id")
			})
			admin.save(null, {
				success: function () {
					Utils.appAlert('success', {msg: 'User ' + dname + ' is administrator of this chat now'});
				}
			});
		},
		render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
	});

	MessagesView.View = Backbone.View.extend({
		template: _.template($('#messages-template').html()),
        tagName: "p",
        initialize: function (id) {
			this.room_id = id;
			this.cable = SubToChannel.join(id);
			this.listenTo(this.collection, 'add', this.addOne);
			this.collection = new Messages.MessageCollection(null, {id: this.room_id});
			this.room_model = new Rooms.RoomId({id: this.room_id});
			var $this = this;
			this.admin_model = new RoomMembers.Admin({id: this.room_id})
			this.admin_model.fetch({
				success: function () {
					$this.admin = $this.admin_model.attributes.admin
				}
			});
			this.current_user_id = MainSPA.SPA.router.currentuser.get('id');
        },
		events: {
			"keypress #chat-input" : "send_msg",
			"click #change_password" : "click_password",
			'blur #new_password_input' : 'hide_password_input',
			"keypress #new_password_input" : "grab_password",

		},
        render: function () {
			var $this = this;
			this.room_model.fetch({
				success: function () {
					_.defer(function() {
						$this.$('#chat-input').focus();
				  	});
					$this.$el.html($this.template($this.room_model.toJSON()));
					$this.collection.fetch({
						success: function() {
							$this.addAll();
						}
					})
					$this.$("#room-name").html("#" + $this.room_model.attributes.name)
				}
			});
			return this;
		},
		addOne: function (msg) {
			var show_admin = this.admin;
			if (this.current_user_id == this.room_model.attributes.owner_id)
				show_admin = true;
			if (this.current_user_id == msg.attributes.user_id)
				show_admin = false;
			msg.set("admin", show_admin)
			msg.view = new MessagesView.MessageView({model: msg});
			this.$("#messages").append(msg.view.render().el);
			var element = document.getElementById("messages");
          	element.scrollTop = element.scrollHeight;
		},
		addAll: function () {
			this.collection.each(this.addOne, this);
		},
		hide_password_input: function (e) {
			$("#new_password_input").val('')
			$("#new_password_input").css("display", "none")
		},
		send_msg: function (e) {
			if (e.keyCode !== 13) return;
			if ($('#chat-input').val().trim() === "") return;

			let $this = this;
			var current_user = new Users.CurrentUserModel();
			current_user.fetch({
				success: function () {
					var mes = new Messages.MessageModel;
					mes.save({
						content: $('#chat-input').val().trim(), 
						room_id: $this.room_id,
						user_id: current_user.get("id"),
						owner_id: $this.room_model.attributes.owner_id
					}, {patch: true}
					);
					if ($this.room_model.attributes.private === true)
						mes.set({displayname: "anonimous"});
					else
						mes.set({disgrab_passwordplayname: current_user.get("displayname")});
					mes.set({avatar: current_user.get("avatar_url")});
					var	mes_view = new MessagesView.MessageView({model: mes});
					$("#messages").scrollTop($("#messages")[0].scrollHeight);
					$('#chat-input').val('');
				}
			}
			);
		},
		click_password: function () {
			$("#new_password_input").val('')
			if ($("#new_password_input").css("display") == 'none')
			{
				$("#new_password_input").css("display", "block");
				this.$('#new_password_input').focus();
			}
		},
		grab_password: function (e) {
			if (e.keyCode !== 13) return;
			$("#new_password_input").css("display", "none");
			var password = $('#new_password_input').val().trim()
			var PassModel = new Rooms.RoomPassword({
				id: this.room_id,
				password: password
			})
			PassModel.save(null, {
				type: 'POST',
				success: function () {
					Utils.appAlert('success', {msg: 'Password has been changed'});
				}
			});
		}
	});

	MessagesView.DirectMessageView = Backbone.View.extend({
		template: _.template($('#direct_message_template').html()),
		events: {
			"click .user_icon" : "open_user_profile"
		},
		open_user_profile: function () {
			var $this = this;
			var u_id = $this.$('.message').attr("data-user-id");
			MainSPA.SPA.router.navigate("#/users/" + u_id);
		},
		render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
	});

	MessagesView.DirectView = Backbone.View.extend({
		template: _.template($('#direct_messages_template').html()),
        tagName: "p",
        initialize: function (id) {
			this.room_id = id;
			this.cable = SubToDirect.join(id);
			this.listenTo(this.collection, 'add', this.addOne);
			this.collection = new Messages.DirectMessageCollection(null, {id: this.room_id});
			this.room_model = new Rooms.DirectRoomId({id: this.room_id});
			this.current_user = new Users.CurrentUserModel();
			this.current_user.fetch();
        },
		events: {
			"keypress #chat-input"	: "send_msg",
			"click .block_user"		: "block_user"
		},
        render: function () {
			var $this = this;

			this.room_model.fetch({
				success: function () {
					if ($this.room_model.attributes.anagram == "")
						$this.$("#receiver_name").html("@" + $this.room_model.attributes.receiver_name)
					else
						$this.$("#receiver_name").html("[" + $this.room_model.attributes.anagram + "]" + $this.room_model.attributes.receiver_name)
				}
			});
			this.$el.html(this.template(this.room_model.toJSON()));
			_.defer(function() {
  				$this.$('#chat-input').focus();
			});
			this.collection.fetch({
				success: function() {
					$this.addAll();
				}
			})
			return this;
		},
		addOne: function (msg) {
			msg.view = new MessagesView.DirectMessageView({model: msg});
			this.$("#direct_messages").append(msg.view.render().el);
			$("#direct_messages").scrollTop($("#direct_messages")[0].scrollHeight);
		},
		addAll: function () {
			this.collection.each(this.addOne, this);
		},
		block_user: function () {
			if (confirm('Are you sure you want to block this user?')) {
				if (this.room_model.attributes.blocked1 != "")
					this.room_model.set("blocked1", String(this.current_user.attributes.id));
				else
					this.room_model.set("blocked2", String(this.current_user.attributes.id));
				this.room_model.save();
				window.history.back();
			}
		},
		send_msg: function (e) {
			if (e.keyCode !== 13) return;
			if ($('#chat-input').val().trim() === "") return;

			let $this = this;
			var current_user = new Users.CurrentUserModel();
			current_user.fetch({
				success: function () {
					var mes = new Messages.DirectMessageModel;
					mes.save({
						content: $('#chat-input').val().trim(),
						room_id: $this.room_id,
						user_id: current_user.get("id")
					}, {
						patch: true
					});
					mes.set({displayname: current_user.get("displayname")});
					mes.set({avatar: current_user.get("avatar_url")});
					$("#direct_messages").scrollTop($("#direct_messages")[0].scrollHeight);
					$('#chat-input').val('');
				}
			}
			);
		}
	});
	

});

export default MessagesView
