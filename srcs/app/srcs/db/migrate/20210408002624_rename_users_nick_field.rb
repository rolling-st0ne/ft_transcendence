class RenameUsersNickField < ActiveRecord::Migration[6.1]
  def change
    rename_column :users, :nick, :displayname
  end
end
