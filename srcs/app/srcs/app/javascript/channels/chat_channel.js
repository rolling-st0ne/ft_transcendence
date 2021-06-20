import consumer from "./consumer"
import MainSPA from "../packs/main_spa";
import MessagesView from "../packs/views/messages"
import Messages from "../packs/models/messages"


function disconnect_from_rooms () {
  consumer.subscriptions.subscriptions.forEach((subscription) => {
    let found = subscription.identifier.search("\"channel\":\"ChatChannel\"")
    if (found != -1)
      consumer.subscriptions.remove(subscription)
  } )
}

let SubToChannel = {
    async join(id)
    {
      await disconnect_from_rooms();
      consumer.subscriptions.create({channel: "ChatChannel", room_id: id}, {
      initialized() {
        this.id = id;
      },

      connected() {
        // Called when the subscription is ready for use on the server
      },

      disconnected() {
        // Called when the subscription has been terminated by the server
      },

      received(data) {
        var current_user_id = MainSPA.SPA.router.currentuser.get('id')
        var is_admin = false;
        var found = false;
        if (data.room_owner_id == current_user_id && data.room_owner_id !== data.user_id && data.user_id != current_user_id) {
          is_admin = true;
        }
        else {
          for (let i = 0; i < data.admins.length; ++i) {
            if (data.admins[i].user_id == current_user_id) {
              if (current_user_id != data.user_id) {
                is_admin = true;
                break ;
              }
            }
          }
        }
        for (let i = 0; i < data.blocks.length; ++i)
        {
          if (data.blocks[i].user_id == current_user_id) {
            found = true;
            break ;
          }
        }
        if (data.room_id == this.id && !found)
        {
          var msg_model = new Messages.MessageModel({
            user_id: data.user_id,
            room_id: data.room_id,
            avatar: data.avatar,
            admin: is_admin,
            displayname: data.displayname,
            content: data.content,
            user_guild_anagram: data.user_guild_anagram,
          })
          var msg = new MessagesView.MessageView({model: msg_model});
          $("#messages").append(msg.render().el);
          var element = document.getElementById("messages");
          element.scrollTop = element.scrollHeight;
        }
      }
    })
  }
}

export default SubToChannel;
