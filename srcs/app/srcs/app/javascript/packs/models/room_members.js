import Backbone from "backbone";

const RoomMembers = {};


RoomMembers.RoomMembersModel = Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: '/api/room_members'
});

RoomMembers.RoomMemmersID = Backbone.Model.extend({
    initialize: function(options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/room_members/' + this.id;
    }
});

RoomMembers.RoomMembersCollection = Backbone.Collection.extend({
    model: RoomMembers.RoomMembersModel,
    url: '/api/room_members',
    comparator: 'id'
});

RoomMembers.Admin = Backbone.Model.extend({
    initialize: function(options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/room_admins/' + this.id;
    }
});

RoomMembers.AdminName = Backbone.Model.extend({
    initialize: function(options) {
        this.name = options.name,
        this.room_id = options.room_id
    },
    url: function () {
        return '/api/room_admins/?name=' + this.name + '&room_id=' + this.room_id;
    }
});

export default RoomMembers;