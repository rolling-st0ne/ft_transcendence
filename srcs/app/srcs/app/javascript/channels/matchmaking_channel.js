import consumer from "./consumer"
import MainSPA from "../packs/main_spa";
import Pong from "../packs/models/pong"
import Users from "../packs/models/users"
import GameRoomInit from "./game_room_channel";


var MatchmakingInit = 
{
  connectToChannel: function (id) {
    consumer.subscriptions.create("MatchmakingChannel", {
      connected() {
        // Called when the subscription is ready for use on the server
        console.log("Connected to the matchmaking channel");
        this.send({action: "find", id: MainSPA.SPA.router.currentuser.get('id')});
      },
    
      disconnected() {
        // Called when the subscription has been terminated by the server
        console.log("Disconnected from the matchmaking channel");
      },
    
      received(data) {
        // Called when there's incoming data on the websocket for this channel
        console.log("recieved data from matchmaking channel: ", data);
        if (data.action == 'find')
        {
          if (data.id != MainSPA.SPA.router.currentuser.get('id'))
          {
            this.send({action: "confirm", id: MainSPA.SPA.router.currentuser.get('id')});
          }
        }
        if (data.action == 'confirm')
        {
          if (data.id != MainSPA.SPA.router.currentuser.get('id'))
          {
            let $this = this;
            this.match = new Pong.MatchesModel();
            this.match.save({invited_user_id: data.id, type: 2}, {success: function (model) {
              console.log(model);
              $this.match = model;
              $this.cable = GameRoomInit.createGameRoom({match_id: $this.match.attributes.id});
              $this.send({action: "start", match_id: $this.match.attributes.id, user_id: MainSPA.SPA.router.currentuser.get('id')});
           //   $this.match.fetch({success: function () {
           //     console.log($this.match.attributes.id);
           //   }});
            }});
          }
        }
        if (data.action == 'start')
        {
          if (data.user_id != MainSPA.SPA.router.currentuser.get('id'))
          {
            this.cable = GameRoomInit.createGameRoom({match_id: data.match_id});
          }
          consumer.subscriptions.remove(this)
        }
      }
    });
  }
}

export default MatchmakingInit;