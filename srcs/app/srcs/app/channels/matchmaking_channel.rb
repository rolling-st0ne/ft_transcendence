class MatchmakingChannel < ApplicationCable::Channel
  def subscribed
    stream_from "matchmaking_channel"
  end

  def receive

  end

  def find(data)
    ActionCable.server.broadcast("matchmaking_channel", {id: data['id'], action: 'find'})
  end

  def confirm(data)
    ActionCable.server.broadcast("matchmaking_channel", {id: data['id'], action: 'confirm'})
  end

  def start(data)
    ActionCable.server.broadcast("matchmaking_channel", {match_id: data['match_id'], user_id: data['user_id'], action: 'start'})
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
