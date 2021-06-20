class AppearanceChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
    puts "#{current_user.displayname} is online"
    current_user.update_online!(true)
  end

  def unsubscribed
    puts "#{current_user.displayname} is offline"
    current_user.update_online!(false)
    # Any cleanup needed when channel is unsubscribed
  end
end
