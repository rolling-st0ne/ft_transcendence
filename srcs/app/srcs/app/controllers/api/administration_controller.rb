class Api::AdministrationController < ApplicationController
  include ApplicationHelper
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!
  before_action :sign_out_if_banned
  before_action :check_2fa!
  before_action :check_admin
  before_action :define_filters
  before_action :find_user, only: %i[user_update toggle_admin]
  before_action :find_chat, only: %i[chat_destroy]

  # GET /api/admin/users.json
  def users
    set_current_user
    userselect = params[:filter]
    if userselect.nil? || userselect.empty?
      @users = User.all
    else
      unless User.has_attribute?(userselect)
        render json: {error: "No such filter"}, status: :not_acceptable
        return
      end
      @users = User.where("#{userselect}": true)
    end
    render json: @users.as_json(only: @userfilters, methods: :current_owner)
  end

  # GET /api/admin/chats.json
  def chatlist
    @rooms = Room.all
    render json: @rooms, only: @roomfilters
  end

  # PATCH /api/admin/users/id.json
  def user_update
    if params.has_key?('admin')
      unless current_user.owner?
        render json: {error: "You are not an owner of this server"}, status: :forbidden
        return
      end
    end

    if params.has_key?('banned')
      if params['banned'] == true && !(@user.banned?)
        if @user == current_user
          render json: {error: "You can't ban yourself"}, status: :forbidden
          return
        end
        if @user.owner? || @user.admin?
          render json: {error: "You can't ban another admin/owner"}, status: :forbidden
          return
        end
      end
    end

    if !current_user.owner? && @user != current_user && (@user.owner? || @user.admin?)
      render json: {error: "You can't udpate another admin"}, status: :forbidden
      return
    end

    if @user.update(user_params)
      render json: @user, only: @userfilters, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/admin/chats/id.json
  def chat_destroy
    Message.where(:room_id => @room.id).destroy_all
    BlockUserRoom.where(:room_id => @room.id).destroy_all
    @room.destroy
    render json: {msg: "Chat destroyed"}, status: :ok
  end

  private

  def check_admin
    unless current_user.owner? || current_user.admin?
      render json: {error: "You have no permission"}, status: :forbidden
    end
  end

  def define_filters
    @userfilters = %i[id nickname displayname email admin owner banned ban_reason
                      avatar_url avatar_default_url online last_seen_at]
    @roomfilters = %i[id name owner_name private password_present]
  end

  def find_user
    @user = User.find(params[:id])
  end

  def find_chat
    @room = Room.find(params[:id])
  end

  def user_params
    return params.require(:administration).permit(%i[displayname avatar_url banned ban_reason admin]) if current_user.owner?
    params.require(:administration).permit(%i[displayname avatar_url banned ban_reason])
  end

  def room_params
    params.require(:administration).permit(%i[name private])
  end

  def set_current_user
    User.current_user = current_user
  end
end
