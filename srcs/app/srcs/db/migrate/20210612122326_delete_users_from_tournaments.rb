class DeleteUsersFromTournaments < ActiveRecord::Migration[6.1]
  def change
    remove_column :users, :tournament_id
    remove_column :tournaments, :users
  end
end
