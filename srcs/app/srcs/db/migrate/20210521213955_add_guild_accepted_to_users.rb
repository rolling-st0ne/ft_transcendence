class AddGuildAcceptedToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :guild_accepted, :boolean, default: false
  end
end
