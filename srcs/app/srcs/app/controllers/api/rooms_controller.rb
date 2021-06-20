class Api::RoomsController < ApplicationController
    before_action :authenticate_user!
    skip_before_action :verify_authenticity_token

    def index
        @block = BlockUserRoom.where(user_id: current_user.id)
        @block_array = []
        @block.each do |b|
            if Time.now  - b.created_at > b.time
                BlockUserRoom.find(b.id).destroy
            else
                @block_array << b.room_id
            end
        end
        @rooms = Room.where.not(id: @block_array)
        render json: @rooms
    end

    #change password
    def create
        @room = Room.find(params[:id])
        @room.update(password: params[:password], password_present: params[:password] == "" ? false : true)
        render json: @room, status: :ok
    end

    def show
        @room = Room.where(id: params[:id]).first.as_json
        if RoomAdmin.where(room_id: params[:id], user_id: current_user.id).blank?
            @room[:admin] = false
        else
            @room[:admin] = true
        end
        if @room["owner_id"] == current_user.id
            @room[:admin] = true
        end
        @room["current_user_id"] = current_user.id
        render json: @room, status: :ok
    end

    def update
        if params.has_key?(:verify_password) #check password
            @room = Room.find(params[:id])
            if @room.present? && @room.authenticate(params[:password])
                render json: @room, status: :ok
            else
                render json: {error: "Wrong password", status: 400},  status: 400
            end
        else #save new room
            if Room.exists?(name: params[:name])
                render json: {error: "Room with name #{params[:name]} is already exist", status: 400},  status: 400
            else
                @room = Room.new
                if params.has_key?(:name)
                    @room.name = params[:name]
                    if params.has_key?(:password) && params[:password] != ""
                        @room.password_present = true
                        @room.password = params[:password]
                    else
                        @room.password_present = false
                        @room.password = ""
                    end
                    @room.owner_id = current_user.id
                    @room.owner_name = current_user.displayname
                    @room.private = params[:private]
                    @room.save!
                    render json: @room, status: :ok
                end
            end
        end
    end
end
