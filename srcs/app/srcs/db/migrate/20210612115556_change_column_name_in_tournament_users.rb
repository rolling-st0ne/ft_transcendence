class ChangeColumnNameInTournamentUsers < ActiveRecord::Migration[6.1]
  def change
    rename_column :tournament_users, :raiting, :rating
  end
end
