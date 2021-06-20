class ChangeUsersFiels < ActiveRecord::Migration[6.1]
  def change
    change_column :users, :wins, :integer, default: 0
    change_column :users, :loses, :integer, default: 0
    change_column :users, :elo, :integer, default: 0
    remove_column :users, :mail
  end
end
