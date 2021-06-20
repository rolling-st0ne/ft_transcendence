class AddAvatarToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :avatar, :binary
    add_column :users, :avatar_url, :string
    add_column :users, :avatar_default_url, :string
  end
end
