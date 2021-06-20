class AddGuildOfficerToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :guild_officer, :boolean, :default => false
  end
end
