import Backbone from "backbone";

let SettingsModel = Backbone.Model.extend({
    idAttribute: "id",
    urlRoot: '/api/settings'
});

export default SettingsModel;
