class TournamentChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
    stream_from "tournament_#{params[:tournament_id]}"
  end

  def receive(data)
    ActionCable.server.broadcast("tournament_#{params[:tournament_id]}", data)
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
