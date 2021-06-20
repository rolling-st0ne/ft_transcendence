class AddOwnerToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :owner, :boolean, null: false, default: false
  end
end
