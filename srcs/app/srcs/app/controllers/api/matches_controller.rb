class Api::MatchesController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  def index
    @matches = Match.where("first_player_id = ? OR second_player_id = ?", params[:user_id], params[:user_id])
    render json: @matches, status: :ok
  end

  def show
    @match = Match.find(params[:id])
    render json: @match, status: :ok
  end

  def update
    @match = Match.find(params[:id])
    if (params.has_key?(:winner) and params.has_key?(:first_player_score) and params.has_key?(:second_player_score))
      @player_winner = User.find(params[:winner])
      @player_loser = params[:winner] == params[:second_player_id] ? User.find(params[:first_player_id]) : User.find(params[:second_player_id])
      @player_loser.update(loses: @player_loser.loses + 1)
      @player_winner.update(wins: @player_winner.wins + 1)
      @player_winner.update(elo: @player_winner.elo + 25)
      if @player_loser.elo < 25
        @player_loser.update(elo: 0)
      else
        @player_loser.update(elo: @player_loser.elo - 25)
      end
    end

    if @match.tournament_id != 0 && (params.has_key?(:winner) and params.has_key?(:first_player_score) and params.has_key?(:second_player_score))
      @tournament_user_winner = TournamentUser.where(tournament_id: @match.tournament_id, user_id: params[:winner]).first
      @tournament_user_loser = params[:winner] == params[:second_player_id] ?
          TournamentUser.where(tournament_id: @match.tournament_id, user_id: params[:first_player_id]).first : TournamentUser.where(tournament_id: @match.tournament_id, user_id: params[:second_player_id]).first
      @tournament = Tournament.find(@match.tournament_id);
      rating = (@player_winner.elo - @player_loser.elo).abs
      @tournament_user_winner.update(wins: @tournament_user_winner.wins + 1, stage: @tournament_user_winner.stage + 1, rating: @tournament_user_winner.rating + rating)
      @tournament_user_loser.update(loses: @tournament_user_loser.loses + 1)
    end

    @match.update(status: params[:status]) if (params.has_key?(:status))
    if (params.has_key?(:winner))
      @match.update(winner: params[:winner])
      if @match.war_id && !((@war = War.find(@match.war_id)).finished)
        @war.matches_total += 1
        if @player_winner.guild_id == @war.guild1_id
          @war.g1_score += 1
          @war.g1_matches_won += 1
        else
          @war.g2_score += 1
          @war.g2_matches_won += 1
        end
        @war.save
      else
        if @player_winner.guild != nil && @player_winner.guild_accepted
          @player_winner.guild.score += 1;
          @player_winner.guild.save
        end
      end
    end
    if (params.has_key?(:first_player_score) and params.has_key?(:second_player_score))
      @match.update(first_player_score: params[:first_player_score], second_player_score: params[:second_player_score])
    end
    render json: [], status: :ok
  end

  # match types: 
  #   1 -- duel
  #   2 -- ladder
  #   3 -- tournament

  def create
    if find_invitation(params[:user_id], params[:invited_user_id], 1, 1) or find_invitation(params[:invited_user_id], params[:user_id], 1, 1)
      render json: {error: 'Invitation already exists'}, status: :unprocessable_entity
    else
      user1 = User.find(params[:user_id])
      user2 = User.find(params[:invited_user_id])
      if user1.guild_accepted && user2.guild_accepted
        @war = War.find_by_guild1_id_and_guild2_id_and_finished_and_accepted(user1.guild_id, user2.guild_id, false, true)
        @war = War.find_by_guild1_id_and_guild2_id_and_finished_and_accepted(user2.guild_id, user1.guild_id, false, true) if !@war
      end

      @match = Match.create(player_one: User.find(params["user_id"]),
                          player_two: User.find(params["invited_user_id"]),
                          status: 1, match_type: params[:type])
      if @war && check_war
        another_match = Match.find_by_war_id(@war.id)
        if !another_match || another_match.status != 2
          @match.update(war_id: @war.id)
          WarMatchJob.set(wait_until: DateTime.now + @war.wait_minutes.minutes).perform_later(@match)
        end
      end
      puts 'MATCH CREATED'
      render json: @match, status: :ok
    end
  end

  def destroy
    Match.find(params[:id]).destroy
    render json: [], status: :ok
  end

    private

  def find_invitation(first_player_id, second_player_id, status, type)
    first_player_id = current_user.id if first_player_id == 'current'
    return Match.find_by_first_player_id_and_second_player_id_and_status_and_match_type(first_player_id, second_player_id, status, type)
  end

  def check_war
    !@war.finished && @war.accepted && @war.start <= DateTime.now && check_wartime && check_match_type
  end

  def check_match_type
    @match.match_type == 1 || (@match.match_type == 2 && @war.ladder) ||  (@match.match_type == 3 && @war.tournament)
  end

  def check_wartime
    return true if @war.wartime_start == @war.wartime_end

    now = DateTime.now.new_offset(0)
    end_day = @war.wartime_end.day == @war.wartime_start.day ? now.day : now.day + 1
    check_start = DateTime.new(now.year, now.month, now.day, @war.wartime_start.hour, @war.wartime_start.min, @war.wartime_start.sec, now.zone)
    check_end = DateTime.new(now.year, now.month, end_day, @war.wartime_end.hour, @war.wartime_end.min, @war.wartime_end.sec, now.zone)
    check_start <= now && check_end > now
  end

end
