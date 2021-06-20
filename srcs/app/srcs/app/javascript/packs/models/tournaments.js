import Backbone from "backbone";

const Tournaments = {};

Tournaments.Model = Backbone.Model.extend({
    urlRoot: '/api/tournaments'
});

Tournaments.ModelById = Backbone.Model.extend({
    initialize: function(options) {
        this.id = options.id;
    },
    url: function () {
        return '/api/tournaments/' + this.id;
    }
});

Tournaments.Collection = Backbone.Collection.extend({
    model: Tournaments.Model,
    url: '/api/tournaments',
    comparator: 'id'
});

export default Tournaments;
