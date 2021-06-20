class ChangeTournamentStatusType < ActiveRecord::Migration[6.1]
  def change
    remove_column :tournaments, :status
    add_column :tournaments, :status, :integer, null: false, default: 0
  end
end
