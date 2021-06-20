class WarJob < ApplicationJob
  queue_as :default

  def perform(*war)
    # Do something later
    if war == nil
      return
    end
    @war = war.first
    if @war.accepted
      @war.update(finished: true, winner: @war.define_winner)
      if @war.winner != 0
        winner_guild = Guild.find(@war.winner == 1 ? @war.guild1_id : @war.guild2_id)
        loser_guild = Guild.find(@war.winner == 1 ? @war.guild2_id : @war.guild1_id)
        winner_guild.score += @war.stake
        loser_guild.score -= @war.stake
        winner_guild.save
        loser_guild.save
      end
    else
      @war.destroy
    end
  end

end
