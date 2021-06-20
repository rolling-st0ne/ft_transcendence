class DirectChannel < ApplicationCable::Channel
  def subscribed
    stream_from "direct_room_#{params[:room_id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
