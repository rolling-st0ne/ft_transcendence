class Api::UsersController < ApplicationController
  include ApplicationHelper
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!
  before_action :check_2fa!
  before_action :define_filters
  before_action :sign_out_if_banned
  before_action :find_user, only: %i[show update destroy add_to_guild remove_from_guild accept_friend remove_friend]
  rescue_from ActiveRecord::RecordNotFound, :with => :user_not_found

  # GET /api/users.json
  def index
    @users = User.where(banned: false)
    render json: @users, only: @filters
  end

  # GET /api/users/id.json
  def show
    duels_winner = Match.where("first_player_id = ? OR second_player_id = ?", @user.id, @user.id).where(match_type: 1).group(:winner).count[@user.id]
    duels_winner = duels_winner == nil ? 0 : duels_winner
    duels_total =  Match.where("first_player_id = ? OR second_player_id = ?", @user.id, @user.id).where(match_type: 1).length
    tournament_winner = Match.where("first_player_id = ? OR second_player_id = ?", @user.id, @user.id).where(match_type: 3).group(:winner).count[@user.id]
    tournament_winner = tournament_winner == nil ? 0 : tournament_winner
    tournament_total =  Match.where("first_player_id = ? OR second_player_id = ?", @user.id, @user.id).where(match_type: 3).length
    render json: @user.as_json(only: @filters,
                               include: {
                                 friends: { only: @filters },
                                 requested_friends: { only: @filters },
                                 guild: { only: @guildfilters },
                               },
                               methods: [:guild_invites_counter]
                               )
                      .merge(:is_current => @user == current_user)
                      .merge(:can_invite => current_user.guild_master? || current_user.guild_officer?)
                      .merge(:duels_winner => duels_winner)
                      .merge(:duels_total => duels_total)
                      .merge(:tournament_winner => tournament_winner)
                      .merge(:tournament_total => tournament_total)
  end

  # PATCH/PUT /api/users/id.json
  def update
    if current_user == @user
      if @user.update(user_params)
        render json: @user, only: @filters, status: :ok
      else
        render json: @user.errors, status: :unprocessable_entity
      end
    else
      @user.errors.add :base, 'You have no permission'
      render json: @user.errors, status: :forbidden
    end
  end

  def add_to_guild
    if (guild_head_action && @user != current_user) || current_user.admin
      if !@user.guild_id
        render json: { error: 'No request found' }, status: :not_found
      elsif @user.guild_master
          return
      else
        @current_master = User.where(guild_id: @user.guild_id, guild_master: true).first
        @user.update(guild_user_params)
        if @user.guild_master == true
          @user.guild_officer = false
          @user.save
          if @current_master.id != @user.id
            @current_master.guild_master = false
            @current_master.save
          end
        end
      end
    elsif @user == current_user && params[:guild_id] != nil
      if !(@invitation = GuildInvitation.find_by_user_id_and_guild_id(@user.id, params[:guild_id]))
        render json: { error: 'No invitation found' }, status: :not_found
      elsif @user.guild_accepted
        render json: { error: 'You are in the guild already' }, status: :forbidden
      else
        @user.update(guild_id: params[:guild_id])
        @user.guild_accepted = true
        @user.save
        @invitation.destroy
      end
    else
      render json: { error: 'No permission' }, status: :forbidden
    end
  end

  def remove_from_guild
    if (!@user.guild_id)
      render json: { error: 'User has no guild or guild request' }, status: :forbidden
    elsif (current_user == @user || guild_head_action || current_user.admin)
      if @user.guild_master == true
        @guild = Guild.find(@user.guild_id)
        if @guild.members.length < 2
          @user.errors.add :base, 'Not possible. Delete the guild instead'
        else
          @user.errors.add :base, 'Promote other user to master before leaving the guild.'
        end
        render json: @user.errors, status: :forbidden
      else
        if (!params[:guild_id]) #kick - join request is active
          @user.guild_id = nil
        end
        @user.guild_accepted = false
        @user.guild_officer = false
        #@user.guild_master = false #tmp for test
        @user.save
        render json: @user, only: @filters, status: :ok
      end
    else
      render json: { error: 'No permission' }, status: :forbidden
    end
  end

  def add_friend
    @friended_user = User.find(params[:id])
    current_user.friend_request(@friended_user)
    render json: {}, status: :ok
  end

  def accept_friend
    @user.accept_request(User.find(params[:friend_id]))
    render json: {}, status: :ok
  end

  def remove_friend
    @user.remove_friend(User.find(params[:friend_id]))
    render json: {}, status: :ok
  end

  def tournament_users
    @match = Match.where("(first_player_id = ? OR second_player_id = ?) AND status = ?", params[:user_id], params[:id], 1).first
    render json: @match, status: :ok
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def find_user
    @user = if params[:id] == 'current' # /api/users/current.json
              current_user
            elsif is_numeric(params[:id])
              User.find(params[:id])
            else
              User.where(displayname: params[:id])
            end
  end
  # DRY filters for json responses
  def define_filters
    @filters = %i[id nickname displayname email admin owner banned online
                  last_seen_at wins loses elo avatar_url avatar_default_url
                  guild_id guild_accepted guild_master guild_officer]
    @guildfilters = %i[name anagram]
  end

  # Only allow a list of trusted parameters through.
  def user_params
    params.require(:user).permit(%i[displayname avatar_url guild_id])
  end

  def guild_user_params
    params.permit(%i[guild_accepted guild_officer guild_master])
  end

  def guild_head_action
    current_user.guild_id == @user.guild_id &&
      (current_user.guild_master ||
        (current_user.guild_officer &&
        params[:guild_master] == nil && params[:guild_officer] == nil))
  end

  def is_numeric(str)
    r = Integer(str) rescue nil
    r == nil ? false : true
  end

  def user_not_found
    render json: { error: 'User not found' }, status: :not_found
  end
end
