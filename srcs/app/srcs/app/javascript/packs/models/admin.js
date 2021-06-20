import Backbone from "backbone";
import Utils from "../helpers/utils";

const Admin = {};

Admin.UserModel = Backbone.Model.extend({
    urlRoot: '/api/admin/users',
    toggleBanned: function(reason) {
        this.save({banned: !this.get('banned'), ban_reason: reason},
            {patch: true,
            success: function (model) {
                if (model.get('banned'))
                    Utils.appAlert("success",
                        {msg: "User " + model.get('nickname') + " has been banned"})
                else
                    Utils.appAlert("success",
                        {msg: "User " + model.get('nickname') + " has been unbanned"})
            }});
    },
    toggleAdmin: function() {
        this.save({admin: !this.get('admin')},
            {patch: true,
            success: function (model) {
                if (model.get('admin'))
                    Utils.appAlert("success",
                        {msg: "User " + model.get('nickname') + " has been promoted to admin"})
                else
                    Utils.appAlert("success",
                        {msg: "User " + model.get('nickname') + " has been demoted"})
            }});
    }
});

Admin.UserCollection = Backbone.Collection.extend({
    model: Admin.UserModel,
    url: '/api/admin/users',
    comparator: 'id'
});

Admin.ChatModel = Backbone.Model.extend({
    urlRoot: '/api/admin/chats'
});

Admin.ChatCollection = Backbone.Collection.extend({
    model: Admin.ChatModel,
    url: '/api/admin/chats',
    comparator: 'id'
});

export default Admin;
