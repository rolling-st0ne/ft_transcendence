class DeleteWinnerFromTournamentUsers < ActiveRecord::Migration[6.1]
  def change
    remove_column :tournament_users, :winner
  end
end
