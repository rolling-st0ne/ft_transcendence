class Api::WarsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :find_war, only: %i[show destroy accept]
  before_action :find_current_guild, only: %i[destroy accept create]
  before_action :check_master_rights, only: %i[destroy accept create]
  before_action :find_guild, only: %i[index_war_requests index_war_invites]
  before_action :check_active_war, only: %i[create accept]
  before_action :check_guild_permissions, only: [:destroy]
  before_action :define_filters, only: %i[index index_war_requests index_war_invites]
  rescue_from ActiveRecord::RecordNotFound, :with => :war_not_found

  def index
    wars = War.all.where(accepted: true)
    if params[:guild_id]
      @guild = Guild.find(params[:guild_id])
      wars = @guild.wars
    end
    render json: wars, only: @filters, status: :ok
  end

  def show # show requests/invites profiles to all members, actions for master only
    render json: @war if @war.accepted || (find_current_guild && check_guild_permissions)
  end

  def index_war_invites
    wars = @guild.war_invites
    render json: wars, only: @filters, status: :ok
  end

  def index_war_requests
    wars = @guild.war_requests
    render json: wars, only: @filters, status: :ok
  end

  def create
    @opponent = Guild.find(params[:guild2_id])
    return if check_opponent_fail || not_enough_points

    if params[:start].to_time < DateTime.now
      render json: { error: 'Start date must be in the future' }, status: :unprocessable_entity
      return
    end
    if params[:end].to_time < (params[:start].to_time + 1.0 / 96.0)
      render json: { error: 'The gap between start and date must be not less then 15 minutes' }, status: :unprocessable_entity
      return
    end
    if params[:end].to_time >= (params[:start].to_time + 1.0) && (params[:wartime_end].to_time < (params[:wartime_start].to_time + 1.0 / 24.0) && params[:wartime_start].to_time != params[:wartime_end].to_time)
      render json: { error: 'War time must be at least 1 hour long' }, status: :unprocessable_entity
      return
    end
    war = @guild_cur.war_requests.create(war_params)
    if war.save
      war.update(g1_name: @guild_cur.name, g2_name: @opponent.name)
      WarJob.set(wait_until: war.end).perform_later(war)
      render json: war, status: :ok
    else
      render json: war.errors, status: :unprocessable_entity
    end
  end

  def accept
    if @guild_cur.id != params[:guild_id].to_i
      render json: { error: 'No permission' }, status: :forbidden
    elsif @war.accepted
      render json: { error: 'Already accepted' }, status: :forbidden
    else
      @opponent = Guild.find(@war.guild1_id)
      @war.update(accepted: true) if !check_opponent_fail && !not_enough_points
      #TEST IT
      now = DateTime.now.new_offset(0)
      if @war.start < now
        year = now.year
        month = now.month
        day = now.day
      else
        year = @war.start.year
        month =  @war.start.month
        day =  @war.start.day
      end
      time_to_start_unmatch_counter_reset = DateTime.new(year, month, day,  @war.wartime_start.hour, @war.wartime_start.min, @war.wartime_start.sec, now.zone)
      ResetUnunsweredMatchesCounterJob.set(wait_until: time_to_start_unmatch_counter_reset).perform_later(@war)
    end
  end

  def destroy
    if @war.accepted
      render json: { error: "Accepted war request can't be canceled" }, status: :forbidden
    else
      @war.destroy
    end
  end

  private

  def find_war
    @war = War.find(params[:id])
  end

  def war_not_found
    render json: { error: 'War not found' }, status: :not_found
  end

  def check_active_war
    render json: { error: 'You have a war in progress' }, status: :forbidden if @guild_cur.active_war
  end

  def check_opponent_fail
    if !@opponent
      render json: { error: 'Opponent not found' }, status: :not_found
    elsif @opponent.id == current_user.guild_id
      render json: { error: "You can't start war with yourself" }, status: :forbidden
    elsif @opponent.active_war
      render json: { error: "#{@opponent.name} has a war in progress" }, status: :forbidden
    else
      false
    end
  end

  def not_enough_points
    stake = params[:stake].to_i
    if stake > @guild_cur.score
      render json: { error: "Your guild doesn't have enough points" }, status: :forbidden
    elsif stake > @opponent.score
      render json: { error: "#{@opponent.name} doesn't have enough points" }, status: :forbidden
    else
      false
    end
  end

  def find_current_guild
    unless current_user.guild_id && current_user.guild_accepted
      render json: { error: 'You are not a guild member' }, status: :forbidden
      return false
    end
    @guild_cur = current_user.guild
  end

  def check_master_rights
    render json: { error: 'You are not a guild master' }, status: :forbidden unless current_user.guild_master
  end

  def find_guild
    unless current_user.guild_id == params[:id].to_i && current_user.guild_master
      render json: { error: 'You are not this guild master' }, status: :forbidden
      return
    end
    @guild = Guild.find(params[:id])
  end

  def check_guild_permissions
    if (@guild_cur.id != @war.guild1_id) && (@guild_cur.id != @war.guild2_id)
      render json: { error: 'No permission' }, status: :forbidden
      return false
    end
    true
  end

  def war_params
    params.permit(:guild1_id, :guild2_id, :stake,
                  :start, :end, :wartime_start, :wartime_end,
                  :wait_minutes, :max_unanswered,
                  :ladder, :tournament, :duel)
  end

  def define_filters
    @filters = %i[id guild1_id guild2_id g1_name g2_name stake
                  start end finished accepted winner]
  end

end
