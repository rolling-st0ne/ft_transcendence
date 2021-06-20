class Api::RoomAdminsController < ApplicationController
    before_action :authenticate_user!
    skip_before_action :verify_authenticity_token

    def index
    end

    def show
        if RoomAdmin.where(room_id: params[:id], user_id: current_user.id).blank?
            render json: {admin: false}, status: :ok
        else
            render json: {admin: true}, status: :ok
        end
    end

    def create
        #create or remove admin by name
        @user = User.where(displayname: params[:name]).first
        if !@user.blank? and @user != nil
            @admin = RoomAdmin.where(room_id: params[:room_id], user_id: @user.id).first
            if @admin.blank?
                RoomAdmin.create(room_id: params[:room_id], user_id: @user.id)
            else
                @admin.destroy
            end
        end
    end

    def update
        if RoomAdmin.where(room_id: params[:id], user_id: params[:user_id]).blank?
            RoomAdmin.create(room_id: params[:id], user_id: params[:user_id])
        end
        render json: [], status: :ok
    end

end
