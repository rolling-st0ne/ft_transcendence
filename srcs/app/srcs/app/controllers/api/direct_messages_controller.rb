class Api::DirectMessagesController < ApplicationController
    skip_before_action :verify_authenticity_token

    def index
        @messages = DirectMessage.where(id: params[:id])
        render json: @messages
    end

    def show
        @messages = DirectMessage.where(direct_room_id: params[:id]).
          includes(:user).
          joins(:user).
          select([
                   DirectMessage.arel_table[Arel.star],
                   User.arel_table[:displayname],
                   User.arel_table[:avatar_url].as("avatar"),
                   User.arel_table[:avatar_default_url]
                 ])
        render json: @messages
    end

    def create
        @message = DirectMessage.create(direct_room_id: params["room_id"],
                                  content: params["content"],
                                  read: false,
                                  user_id: current_user.id)
        ActionCable.server.broadcast("direct_room_#{@message.direct_room_id}",
        {
            user_id: @message.user_id,
            direct_room_id: @message.direct_room_id,
            avatar: current_user.avatar_url,
            displayname: current_user.displayname,
            content: params['content']
        })
        render json: @message
    end

    private
end
