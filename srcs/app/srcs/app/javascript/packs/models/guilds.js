import Backbone from "backbone";

const Guilds = {};

Guilds.GuildModel = Backbone.Model.extend({
    urlRoot: '/api/guilds'
});

Guilds.GuildId = Backbone.Model.extend({
    initialize: function(options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/guilds/' + this.id;
    }
});

Guilds.GuildCollection = Backbone.Collection.extend({
    model: Guilds.GuildModel,
    url: '/api/guilds',
    comparator : function(model) {
        return -model.get('score');
    }
});

Guilds.GuildInvitationsCollection = Backbone.Collection.extend({
    model: Guilds.GuildModel,
    initialize: function(model, options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/users/' + this.id + '/guild_invitations';
    },
    comparator : function(model) {
        return -model.get('score');
    }
});

export default Guilds;