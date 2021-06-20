class AddBlockedToDirectRooms < ActiveRecord::Migration[6.1]
  def change
    add_column :direct_rooms, :blocked1, :string
    add_column :direct_rooms, :blocked2, :string
  end
end
