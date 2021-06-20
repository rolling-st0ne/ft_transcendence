class AddGuildMasterToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :guild_master, :boolean, :default => false
  end
end
