import consumer from "./consumer"
import MainSPA from "../packs/main_spa";
import Backbone from "backbone";
import GameRoomInit from "./game_room_channel"
import Users from "../packs/models/users";
import Utils from "../packs/helpers/utils";

var TournamentChannel = 
{
  Subscribe: function (params) {
    const TournamentRoom = consumer.subscriptions.create({channel: "TournamentChannel", tournament_id: params.tournament_id}, {
      initialized() {
        var $this = this
        var current = new Users.CurrentUserModel();
        current.fetch({
          success: function () {
            $this.tornament_id = params.tournament_id;
            $this.current_user_id = current.get("id")
            $this.me_ready = false;
            $this.other_ready = false;
          }
        })
          
      },
      connected() {
        // Called when the subscription is ready for use on the server
      },

      disconnected() {
        // Called when the subscription has been terminated by the server
      },
      Disconnect: function () {
        consumer.subscriptions.remove(this)
      },
      received(data) {
        var self = this
        if (data.ready && data.user_id == self.other_id)
        {
          if (window.location.href != ("#/play/" + this.match_id))
            self.send({ready: true, user_id: self.current_user_id})
          MainSPA.SPA.router.navigate("#/play/" + this.match_id);
          return ;
        }
        else if (data.matches) {
          for (var i = 0; i < data.matches.length; ++i)
          {
            if (data.matches[i][0].user_id == this.current_user_id || data.matches[i][1].user_id == this.current_user_id) {
              self.other_id = this.current_user_id == data.matches[i][1].user_id ? data.matches[i][0].user_id : data.matches[i][1].user_id
              this.Match = new Users.TournamentMatchModel({
                first_player_id: data.matches[i][0].user_id,
                second_player_id: data.matches[i][1].user_id,
              })
              this.Match.fetch({
                success: function () {
                  self.match_id = self.Match.attributes.id
                  self.Match.set(self.Match, {game_room: GameRoomInit.createGameRoom({match_id: self.Match.attributes.id})});
                  self.send({ready: true, user_id: self.current_user_id})
                }
              })
            }
          }
        }
      }
    });
    return TournamentRoom;
  }

}

export default TournamentChannel