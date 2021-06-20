import Backbone from "backbone";
import _ from "underscore";
import moment, { relativeTimeThreshold } from "moment";
import Users from "../models/users";
import Utils from "../helpers/utils";
import MainSPA from "../main_spa";
import MessagesView from "./messages";
import Rooms from "../models/rooms"
// game stuff
import GameRoomInit from "../../channels/game_room_channel";
import MatchmakingInit from "../../channels/matchmaking_channel";
import {obtainedValues} from "../../channels/game_room_channel";
import AdminView from "./admin";

const UsersView = {};

$(function () {
	UsersView.SingleUserView = Backbone.View.extend({
        template: _.template($('#singleuser-template').html()),
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
            MainSPA.SPA.router.navigate("#/users/" + this.model.get('id'));
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            let model = this.model;
            this.$('.user_icon').on("error",
                function () { Utils.replaceAvatar(this, model); });
            return this;
        }
    });

    UsersView.FriendsView = Backbone.View.extend({
        template: _.template($('#friends-template').html()),
        events: {
            "click .users-displayname" : "openprofile",
            "click .accept-friend-button" : "acceptFriend",
            "click .remove-friend-button" : "removeFriend",
        },
        tagName: "tr",
        initialize: function (e) {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
            this.model.attributes.status = e.friend_status;
            this.model.attributes.current_user_id = MainSPA.SPA.router.currentuser.get('id');
            this.model.attributes.main_id = e.main_id;
        },
        openprofile: function () {
            MainSPA.SPA.router.navigate("#/users/" + this.model.get('id'));
        },
        acceptFriend: function () {
            this.remove();
            return Backbone.ajax(_.extend({
                url: 'api/users/' + this.model.attributes.main_id + '/accept_friend',
                method: "POST",
                data: {friend_id: this.model.attributes.id},
                dataType: "json",
            }));
        },
        removeFriend: function () {
            this.remove();
            return Backbone.ajax(_.extend({
                url: 'api/users/' + this.model.attributes.main_id + '/remove_friend',
                method: "POST",
                data: {friend_id: this.model.attributes.id},
                dataType: "json",
            }));
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        },
        render: function() {
            if (this.model.attributes.status == "no" && this.model.attributes.main_id != this.model.attributes.current_user_id)
                return this;
            this.$el.html(this.template(this.model.toJSON()));
            this.input = this.$('.displayname');
            let model = this.model;
            this.$('.user_icon').on("error",
                function () { Utils.replaceAvatar(this, model); });
            return this;
        }
    });

    UsersView.SingleMatchView = Backbone.View.extend({
        template: _.template($('#singlematch-template').html()),
        events: {
            "click .accept-match-button" : "acceptMatch",
            "click .decline-match-button" : "declineMatch",
            "click .cancel-invite-button" : "cancelInvite",
            "click .spectate-match-button" : "spectateMatch",
        },
        tagName: "tr",
        initialize: function (e) {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
            this.model.attributes.current_user_id = MainSPA.SPA.router.currentuser.get('id');
            this.model.attributes.main_id = e.main_id;
            // fetch the user model that's id is opposite to ours
            if (this.model.attributes.main_id == this.model.attributes.first_player_id)
                this.model.user_model = new Users.UserId({id: this.model.attributes.second_player_id});
            else
                this.model.user_model = new Users.UserId({id: this.model.attributes.first_player_id});
        },
        acceptMatch: function () {
            console.log("accept match event");
            let $this = this;
            this.model.save({status: 2}, {patch: true, success: function() {
                $this.model.set({game_room: GameRoomInit.createGameRoom({match_id: $this.model.id})});
            }});
        },
        spectateMatch: function () {
            console.log("spectate match ation");
            GameRoomInit.createGameRoom({match_id: this.model.id});
            MainSPA.SPA.router.navigate("#/play/" + this.model.id);
        },
        declineMatch: function () {
            console.log("decline match event");
            this.model.destroy();
        },
        cancelInvite: function () {
            console.log("cancel invite event");
            this.model.destroy();
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        },
        render: function() {
            // uncoment this to disable oportunity to accept or decline matches of other players

            if (this.model.attributes.status == 1 && this.model.attributes.main_id != this.model.attributes.current_user_id)
                return (this);
            let $this = this;
            let model = this.model;
            this.model.user_model.fetch({success: function () {
                model.attributes.admin = model.user_model.attributes.admin;
                model.attributes.displayname = model.user_model.attributes.displayname;
                model.attributes.online = model.user_model.attributes.online;
                model.attributes.avatar_url = model.user_model.attributes.avatar_url;
                model.attributes.banned = model.user_model.attributes.banned;
                $this.$el.html($this.template($this.model.toJSON()));
             }});
            return this;
        }
    });

	UsersView.View = Backbone.View.extend({
		template: _.template($('#users-template').html()),
		events: {
		    "click #refresh-button" :   "refresh",
            "click .find-match-button" : "findMatch",
        },
		initialize: function () {
		    this.collection = new Users.UserCollection;
		    this.listenTo(this.collection, 'add', this.addOne);
		    this.listenTo(this.collection, 'reset', this.addAll);
            this.collection.fetch({reset: true, error: this.onerror});
        },
		addOne: function (user) {
            user.view = new UsersView.SingleUserView({model: user});
            this.$("#users-table").append(user.view.render().el);
        },
        addAll: function () {
            this.collection.each(this.addOne, this);
        },
        findMatch: function () {
            console.log("find match action");
            this.matchmaking_channel = MatchmakingInit.connectToChannel();
        //    this.matchmaking_channel.send({action: "start", id: MainSPA.SPA.router.currentuser.get('id')});
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

	UsersView.ProfileView = Backbone.View.extend({
        template: _.template($('#user-profile-template').html()),
        events: {
            "click #refresh-button"         :   "refresh",
            "click .add-friend-button"      :   "addFriend",
            "click #message_btn"            :   "message_to_user",
            "click .remove-friend-button"   :   "removeFriend",
            "click .invite-to-battle"       :   "inviteToBattle",
            "click .invite-to-guild"        :   "inviteToGuild"
        },
        initialize: function (id) {
            this.id = id;
            this.model = new Users.UserId({id: id});
            this.current_user = new Users.CurrentUserModel();
            this.listenTo(this.model, 'change', this.render);
            this.model.fetch({error: this.onerror});
            this.current_user.fetch();
            // add to user profile matches collection
           this.matches_collection = new Users.MatchesCollection(null, {id: this.model.attributes.id});
		   this.listenTo(this.matches_collection, 'add', this.addOneMatch);
		   this.listenTo(this.matches_collection, 'reset', this.addAllMatches);
           this.matches_collection.fetch({reset: true, error: this.onerror});
        },
        addOneMatch: function (match) {
            match.view = new UsersView.SingleMatchView({model: match, main_id: this.model.attributes.id});
            this.$("#matches-table").append(match.view.render().el);
        },
        addAllMatches: function () {
            this.$("#matches-table").html("");
            this.matches_collection.each(this.addOneMatch, this);
        },
        inviteToBattle: function () {
            let $this = this;
            console.log("Invite to battle");
            return Backbone.ajax(_.extend({
                url: 'api/users/' + MainSPA.SPA.router.currentuser.get('id') + '/matches/',
                method: "POST",
                data: {invited_user_id: this.model.attributes.id, type: 1},
                dataType: "json",
                error: Utils.alertOnAjaxError,
                success: function () {
                    $this.matches_collection.fetch({reset: true, error: this.onerror, success: function () {
                        let $match = $this.matches_collection.findWhere({status: 1, first_player_id: MainSPA.SPA.router.currentuser.get('id'), second_player_id: $this.model.attributes.id});
                        $match.set($match, {game_room: GameRoomInit.createGameRoom({match_id: $match.id})});
                    }})
                }
            }));
        },
        inviteToGuild: function () {
            Utils.invite_to_guild(this);
        },
        addFriend: function () {
            return Backbone.ajax(_.extend({
                url: 'api/users/' + this.model.id + '/add_friend',
                method: "POST",
                data: this.attributes,
                dataType: "json",
            }));
        },
        addOne: function (user) {
            var user_element = new Users.UserModel(user);
            user_element.view = new UsersView.FriendsView({model: user_element, friend_status: "friend", main_id: this.model.attributes.id});
            this.$("#friends-table").append(user_element.view.render().el);
        },
        addRequested: function (user) {
            var user_element = new Users.UserModel(user);
            user_element.view = new UsersView.FriendsView({model: user_element, friend_status: "no", main_id: this.model.attributes.id});
            this.$("#friends-table").append(user_element.view.render().el);
        },
        addAll: function () {
            var $this = this;
            this.model.attributes.requested_friends.forEach(function(user) {
                $this.addRequested(user);
            })
            this.model.attributes.friends.forEach(function(user) {
                $this.addOne(user);
            });
        },
        removeFriend: function () {
            return Backbone.ajax(_.extend({
                url: 'api/users/' + MainSPA.SPA.router.currentuser.get('id') + '/remove_friend',
                method: "POST",
                data: {friend_id: this.model.attributes.id},
                dataType: "json",
            }));
        },
        refresh: function () {
            this.model.fetch({
                success: function () {
                    Utils.appAlert('success', {msg: 'Up to date'});},
                    error: this.onerror
            });
        },
        message_to_user: function () {
            var $this = this
            var room = new Rooms.DirectRoomTwoUsers({
                sender_id: this.current_user.get("id"),
                receiver_id: this.model.get("id")
            })
            room.save(null, {
                wait: true,
                success: function () {
                    if (!room || room.attributes.blocked1 != "" || room.attributes.blocked2 != "")
                        Utils.appAlert('danger', {msg: 'Can\'t start private messages [blocked]'});
                    else
                        $this.render_direct_messages(room.attributes.id)
                }
            })
        },
        render_direct_messages: function (room_id) {
			let view = new MessagesView.DirectView(room_id);
			$(".app_main").html(view.render().el);
		},
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        },
        render: function () {
            this.model.attributes.last_seen_at = moment(this.model.get('last_seen_at')).fromNow();
            this.model.attributes.number_of_friends = this.model.attributes.friends.length;
            this.$el.html(this.template(this.model.toJSON()));
            this.input = this.$('.displayname');
            let model = this.model;
            this.$('.user_avatar').on("error",
                function () { Utils.replaceAvatar(this, model); });

            //  TODO: temp solution.
            var current_user = MainSPA.SPA.router.currentuser;
            for (let i = 0; i < this.model.attributes.friends.length; i++)
            {
                if (this.model.attributes.friends[i].id == current_user.get('id'))
                {
                    this.$('.add-friend-button').html('Remove Friend');
                    this.$('.add-friend-button').attr('class', 'btn btn-outline-danger btn-profile-actions remove-friend-button');
                }
            }
            this.addAll();
            this.addAllMatches();
            return this;
        }
    });

    UsersView.InviteUserView = Backbone.View.extend({
        cur_user: new Users.CurrentUserModel,
        template1: _.template($('#invite-user-template').html()),
        template2: _.template($('#invited-user-template').html()),
        template3: _.template($('#guild-request-template').html()),
        events: {
            "click #displayname" : "openprofile",
            "click #invite-button" :   "invite",
            "click #cancel-invite-button" :   "cancelInvite",
            "click #accept-button" :   "accept",
            "click #decline-button" :   "decline"
        },
        tagName: "tr",
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
        },
        openprofile: function () {
            MainSPA.SPA.router.navigate("#/users/" + this.model.get('id'));
        },
        invite: function(e) {
            e.preventDefault();
            e.stopPropagation();
            Utils.invite_to_guild(this);
        },
        cancelInvite: function () {
            let view = this;
            this.cur_user.fetch({
                success: function (model) {
                    Utils.decline_guild_invite(view.model.get('id'), model.get('guild_id'), 'Invitation to ' + view.model.get('displayname') +  ' canceled');
                    view.render();
                    }}
            );
        },
        accept: function () {
            Utils.accept_join_guild_request(this.model.get('id'), this.model.get('displayname'));
            this.$el.empty().off();
            this.stopListening();
            return this;
        },
        decline: function () {
            Utils.decline_join_guild_request(this.model.get('id'), this.model.get('displayname'));
            let view = this;
            this.model.fetch({
                success: function () {
                    view.render();
                }
            });
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
            this.model.attributes = this.model.previousAttributes();
            this.render();
        },
        onsuccess: function () {
            Utils.appAlert('success', {msg: 'Done'});
        },
        render: function() {
            let view = this;
            view.cur_user.fetch({
                success: function (model) {
                    if (Utils.has_guild_invitation(view.model.get('id'), model.get('guild_id')))
                        view.$el.html(view.template2(view.model.toJSON()));
                    else if (view.model.get('guild_id') == model.get('guild_id'))
                        view.$el.html(view.template3(view.model.toJSON()));
                    else
                        view.$el.html(view.template1(view.model.toJSON()));
                }});
            return this;
        }
    });

    UsersView.AvailableForGuildView = Backbone.View.extend({
        template: _.template($('#userlist-template').html()),
        cur_user: new Users.CurrentUserModel,
        events: {
            "click #displayname" : "openprofile",
            "click #refresh-button" :   "refresh"
        },
        initialize: function () {
            this.collection = new Users.NoGuildUsersCollection;
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.listenTo(this.collection, 'change', this.render);
            this.collection.fetch({reset: true, error: this.onerror});
        },
        addOne: function (user) {
            let view = this;
            this.cur_user.fetch({
                success: function (model) {
                    if (model.get('guild_master') || model.get('guild_officer'))
                        user.view = new UsersView.InviteUserView({model: user});
                    else
                        user.view = new UsersView.SingleUserView({model: user});
                    view.$("tbody").append(user.view.render().$el);
                },
                error: function () {
                    user.view = new UsersView.SingleUserView({model: user});
                    view.$("tbody").append(user.view.render().$el);
                }
            });
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

    UsersView.GuildRequestView = Backbone.View.extend({
        template: _.template($('#guild-request-template').html()),
        events: {
            "click #displayname" : "openprofile",
            "click #accept-button" :   "accept",
            "click #decline-button" :   "decline"
        },
        tagName: "tr",
        initialize: function () {
            this.listenTo(this.model, 'change', this.remove);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
        },
        openprofile: function () {
            MainSPA.SPA.router.navigate("#/users/" + this.model.get('id'));
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        accept: function () {
            Utils.accept_join_guild_request(this.model.get('id'), this.model.get('displayname'));
            this.remove();
        },
        decline: function () {
            Utils.decline_join_guild_request(this.model.get('id'), this.model.get('displayname'));
            this.remove();
        },
        remove: function() {
            this.$el.empty().off(); /* off to unbind the events */
            this.stopListening();
            return this;
        },
        onerror: function (model, response) {
            Utils.alertOnAjaxError(response);
        }
    });

    UsersView.GuildRequestsView = Backbone.View.extend({
        template: _.template($('#userlist-template').html()),
        events: {
            "click #refresh-button" :   "refresh"
        },
        initialize: function (id) {
            this.collection = new Users.GuildRequestsCollection([], {id: id});
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.listenTo(this.collection, 'change', this.render);
            this.collection.fetch({reset: true, error: this.onerror});
        },
        addOne: function (user) {
            user.view = new UsersView.GuildRequestView({model: user});
            this.$("tbody").append(user.view.render().el);
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

    UsersView.ToMasterConfirmView = Backbone.View.extend({
        template: _.template($('#to-master-modal-confirm-template').html()),
        events: {
            "click .btn-confirm"    : "confirm",
            "click .btn-cancel"     : "close",
            "click .modal"          : "clickOutside"
        },
        confirm: function () {
            Utils.change_user_guildrole(this,`guild_master=${true}`);
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

    UsersView.GuildMemberView = Backbone.View.extend({
        template1: _.template($('#guildmember-template').html()),
        template2: _.template($('#guildmember-kick-template').html()),
        template3: _.template($('#guildmember-edit-template').html()),
        cur_user: new Users.CurrentUserModel,
        events: {
            "click #displayname" : "openprofile",
            "click #to-officer-button" : "toOfficer",
            "click #to-master-button" : "openConfirm",
            "click #demote-button" : "demote",
            "click #kick-button" : "kick"
        },
        tagName: "tr",
        initialize: function (guild) {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'error', this.onerror);
            this.guild_id = guild.id;
        },
        openprofile: function () {
            MainSPA.SPA.router.navigate("#/users/" + this.model.get('id'));
        },
        render: function() {
            let view = this;
            this.cur_user.fetch({
                success: function (model) {
                    if ((model.get('id') != view.model.get('id') && model.get('guild_id') == view.guild_id) || view.cur_user.get('admin') ) {
                        if (model.get('guild_master') || view.cur_user.get('admin')) {
                            view.$el.html(view.template3(view.model.toJSON()));
                        }
                        else if ((model.get('guild_officer') && !view.model.get('guild_officer') && !view.model.get('guild_master')))
                            view.$el.html(view.template2(view.model.toJSON()));
                        else
                            view.$el.html(view.template1(view.model.toJSON()));
                    } else
                        view.$el.html(view.template1(view.model.toJSON()));
                },
                error: function () {
                    view.$el.html(view.template1(view.model.toJSON()));
                }
            });
            return this;
        },
        openConfirm: function () {
            this.confirmview = new UsersView.ToMasterConfirmView();
            document.body.appendChild(this.confirmview.render(this.model).el);
        },
        demote: function () {
            Utils.change_user_guildrole(this,`guild_officer=${false}`);
        },
        toOfficer: function () {
            Utils.change_user_guildrole(this,`guild_officer=${true}`);
        },
        kick:  function() {
            $.ajax({
                url: 'api/users/' + this.model.get('id') + '/leave_guild',
                type: 'PUT',
                data: `guild_id=${this.model.get('guild_id')}`, //join request is active
                success: () => {
                    Utils.appAlert('success', {msg: 'You kicked ' + this.model.get('displayname')});
                    this.$el.empty().off();
                    this.stopListening();
                    return this;
                },
                error: (response) => {
                    Utils.alertOnAjaxError(response);
                }
            });
        }
    });

    UsersView.GuildMembersView = Backbone.View.extend({
        template: _.template($('#guildmembers-template').html()),
        events: {
            "click #refresh-button" :   "refresh"
        },
        initialize: function (id) {
            this.collection = new Users.GuildMembersCollection([], {id: id});
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.listenTo(this.collection, 'change', this.render);
            this.collection.fetch({reset: true, error: this.onerror});
            this.g_id = id;
        },
        addOne: function (user) {
            user.view = new UsersView.GuildMemberView({model: user, id: this.g_id});
            this.$("tbody").append(user.view.render().el);
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

export default UsersView;
