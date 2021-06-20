class WarMatchJob < ApplicationJob
  queue_as :default

  def perform(*args)
    @match = args.first
    if @match.status == 1 && !(war = War.find(@match.war_id)).finished
      winner_id = @match.first_player_id
      @match.update(status: 3, winner: winner_id)
      war.matches_total += 1
      winner_guild_id = User.find(winner_id).guild_id
      if winner_guild_id == war.guild1_id
        if (war.g2_unanswered_counter < war.max_unanswered)
          war.g1_score += 1
          war.g1_matches_won += 1
          war.g2_matches_unanswered += 1
          war.g2_unanswered_counter += 1
        end
      else
        if (war.g1_unanswered_counter < war.max_unanswered)
          war.g2_score += 1
          war.g2_matches_won += 1
          war.g1_matches_unanswered += 1
          war.g1_unanswered_counter += 1
        end
      end
      war.save
    end
  end
end
