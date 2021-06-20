class DropIntra < ActiveRecord::Migration[6.1]
  def change
    remove_column :users, :intra
  end
end
