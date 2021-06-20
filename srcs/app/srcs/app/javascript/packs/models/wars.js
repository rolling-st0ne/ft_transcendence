import Backbone from "backbone";

const Wars = {};

Wars.WarModel = Backbone.Model.extend({
    urlRoot: '/api/wars'
});

Wars.WarId = Backbone.Model.extend({
    initialize: function(options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/wars/' + this.id;
    }
});

Wars.WarCollection = Backbone.Collection.extend({
    model: Wars.WarModel,
    url: '/api/wars',
    comparator: function(model) {
        return [model.get('finished'), model.get('start')];
    }
});

Wars.GuildWarsCollection = Backbone.Collection.extend({
    model: Wars.WarModel,
    initialize: function(model, options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/guilds/' + this.id + '/wars';
    },
    comparator: function(model) {
        return [model.get('finished'), model.get('start')];
    }
});

Wars.WarInvitesCollection = Backbone.Collection.extend({
    model: Wars.WarModel,
    initialize: function(model, options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/guilds/' + this.id + '/war_invites'; //from others to the current guild
    }
});

Wars.WarRequestsCollection = Backbone.Collection.extend({
    model: Wars.WarModel,
    initialize: function(model, options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/guilds/' + this.id + '/war_requests'; //sent by the current guild
    }
});

export default Wars;