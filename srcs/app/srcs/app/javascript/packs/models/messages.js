import Backbone from "backbone";

const Messages = {};


Messages.MessageModel = Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: '/api/messages'
});

Messages.MessageCollection = Backbone.Collection.extend({
    initialize: function(model, options) {
        this.id = options.id;
    },
    model: Messages.MessageModel,
    url: function () {
        return '/api/messages/' + this.id;
    },
    comparator: 'id'
});

Messages.DirectMessageModel = Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: '/api/direct_messages'
});

Messages.DirectMessageCollection = Backbone.Collection.extend({
    initialize: function(model, options) {
        this.id = options.id;
    },
    model: Messages.DirectMessageModel,
    url: function () {
        return '/api/direct_messages/' + this.id;
    },
    comparator: 'id'
});

export default Messages;
