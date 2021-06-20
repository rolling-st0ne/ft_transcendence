class Api::GuildInvitationsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :check_officer_rights, only: [:create]
  before_action :check_if_invitee, only: [:index]

  def index
    @invitations = @user.guild_invitations
    #if @invitations.empty?
    #   render json: {error: 'No invitations'}, status: :not_found
    #else
      @ids = []
      @invitations.each { |invitation|
        @ids << invitation.guild_id
      }
        @guilds = Guild.all.where(id: @ids).joins(:master).
        select([
                 Guild.arel_table[Arel.star],
                 User.arel_table[:displayname].as('master_name'),
                 User.arel_table[:id].as('master_id')
               ])
      render json: @guilds.as_json(methods: %i[active_war wars_counter])
    #end
  end

  def show
    @invitation = find_invitation(params[:user_id], params[:id])
    render json: @invitation, only: [:id] if @invitation && check_user_rights
  end

  def create
    if find_invitation(params[:user_id], current_user.guild_id)
      render json: { error: 'Invitation already exists' }, status: :unprocessable_entity
    else
      @invitation = GuildInvitation.new(user_id: params[:user_id], guild_id: current_user.guild_id)
      if @invitation.save
        render json: @invitation, status: :ok
      else
        render json: @invitation.errors, status: :unprocessable_entity
      end
    end
  end

  def destroy
    @invitation = find_invitation(params[:user_id], params[:id])
    if !@invitation
      render json: { error: 'No invitation found' }, status: :not_found
    elsif check_user_rights
      @invitation.destroy
    end
  end

  private

  def check_user_rights
    @user = find_user
    if (@user.id != @invitation.user_id) && (!check_officer_rights || params[:guild_id] != current_user.guild_id)
      render json: { error: 'No permission' }, status: :forbidden
      return false
    end
    true
  end

  def check_officer_rights
    if !current_user.guild_officer &&  !current_user.guild_master
      render json: { error: 'No permission' }, status: :forbidden
      false
    end
    true
  end

  def check_if_invitee
    @user = find_user
    if current_user != @user
      render json: { error: 'No permission' }, status: :forbidden
      false
    end
    true
  end

  def find_invitation(user_id, guild_id)
    user_id = current_user.id if user_id == 'current'
    GuildInvitation.find_by_user_id_and_guild_id(user_id, guild_id)
  end

  def find_user
    @user = if params[:user_id] == 'current' # /api/users/current.json
              current_user
            else
              User.find(params[:user_id])
            end
    end
end
