class AddTournamentsToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :tournament_id, :bigint
    add_index :users, :tournament_id, name: "index_users_on_tournament_id"
  end
end
