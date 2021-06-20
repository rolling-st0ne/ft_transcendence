class GameRoomChannel < ApplicationCable::Channel
  def subscribed
    #@match_found = Match.find(params[:match_id])
    stream_from "game_room_channel_#{params[:match_id]}"
    if current_user.id == Match.find(params[:match_id]).second_player_id && Match.find(params[:match_id]).match_type != 3
      start_match
    end
  end

  def receive(data)
    ActionCable.server.broadcast("game_room_channel_#{params[:match_id]}", data)
    if data == 'finish'
      @match = Match.find(params[:match_id])
      ActionCable.server.remote_connections.where(current_user: User.find(@match.first_player_id)).disconnect
      ActionCable.server.remote_connections.where(current_user: User.find(@match.second_player_id)).disconnect
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  private
  def start_match
    ActionCable.server.broadcast("game_room_channel_#{params[:match_id]}", "start")
  end
end
