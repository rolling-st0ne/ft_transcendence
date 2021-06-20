class Api::DirectRoomsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :authenticate_user!

    def index
        if params.has_key?(:sender_id) and params.has_key?(:receiver_id)
            if DirectRoom.between(params[:sender_id], params[:receiver_id]).present?
                @direct_room = DirectRoom.between(params[:sender_id], params[:receiver_id]).first
            else
                @direct_room = DirectRoom.create!(create_direct_room_params)
            end
            render json: @direct_room
        else
            @ret = []
            @direct_room = (DirectRoom.where("sender_id = ? OR receiver_id = ?", current_user.id, current_user.id))
            @direct_room.each do |dr|
                if dr.blocked1 == "" and dr.blocked2 == ""
                    if dr.receiver_id == current_user.id
                        @user = User.where(id: dr.sender_id).first
                    else
                        @user = User.where(id: dr.receiver_id).first
                    end
                    @ret << get_concat(dr)
                end
            end
            render json: @ret
        end
    end

    def create
        if DirectRoom.between(params[:sender_id], params[:receiver_id]).present?
            @direct_room = DirectRoom.between(params[:sender_id], params[:receiver_id]).first
        else
            @direct_room = DirectRoom.create!(create_direct_room_params)
        end
        render json: @direct_room,  status: :ok
    end

    def update
        @room = DirectRoom.find(params[:id])
        if params.has_key?(:blocked1)
            @room.update(blocked1: params[:blocked1])
        elsif params.has_key?(:blocked2)
            @room.update(blocked1: params[:blocked2])
        end
    end

    def show
        @room = DirectRoom.find(params[:id])
        if current_user.id == @room.receiver_id
            @user_id = @room.sender_id
        else
            @user_id = @room.receiver_id
        end
        @user = User.find(@user_id)
        @guild_anagram = @user.guild_id && @user.guild_accepted ? Guild.find(@user.guild_id).anagram : ""
        render json: show_room
    end

    private

    def get_concat(dr)
        avatar = @user.avatar_url != nil ? @user.avatar_url : @user.avatar_default_url
        {
            id: dr.id,
            receiver_id: dr.receiver_id,
            sender_id: dr.sender_id,
            blocked1: dr.blocked1,
            blocked2: dr.blocked2,
            user_name: @user.displayname,
            avatar: avatar
        }
    end
    
    def create_direct_room_params
        {
            sender_id: params[:sender_id],
            receiver_id: params[:receiver_id],
            blocked1: "",
            blocked2: ""
        }
    end

    def show_room
        {
            id: @room.id,
            receiver_id: @room.receiver_id,
            sender_id: @room.sender_id,
            receiver_name: @user.displayname,
            anagram: @guild_anagram
        }
    end

  end