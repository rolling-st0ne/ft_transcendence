import Backbone from "backbone";

const Rooms = {};


Rooms.RoomModel = Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: '/api/rooms'
});

Rooms.RoomId = Backbone.Model.extend({
    initialize: function(options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/rooms/' + this.id;
    }
});

Rooms.Admin = Backbone.Model.extend({
    initialize: function(options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/rooms/' + this.id;
    }
});

Rooms.RoomPassword = Backbone.Model.extend({
    initialize: function(options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/rooms/' + this.id;
    }
});

Rooms.RoomCollection = Backbone.Collection.extend({
    model:      Rooms.RoomModel,
    url:        '/api/rooms',
    comparator: 'id'
});

Rooms.DirectRoomModel = Backbone.Model.extend({
    idAttribute:    'id',
    urlRoot:        '/api/direct_rooms'
});

Rooms.DirectRoomId = Backbone.Model.extend({
    initialize: function(options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/direct_rooms/' + this.id;
    }
});

Rooms.DirectRoomTwoUsers = Backbone.Model.extend({
    initialize: function(params) {
        this.receiver_id = params.receiver_id;
        this.sender_id = params.sender_id
    },
    url: function () {
        return '/api/direct_rooms' + '?receiver_id=' + this.receiver_id + '&sender_id=' + this.sender_id;
    }
});

Rooms.DirectRoomCollection = Backbone.Collection.extend({
    model:  Rooms.DirectRoomModel,
    url:    '/api/direct_rooms'
});

export default Rooms;