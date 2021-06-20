class CreateBlockUserRooms < ActiveRecord::Migration[6.1]
  def change
    create_table :block_user_rooms do |t|
      t.integer :user_id
      t.integer :room_id
      t.integer :time

      t.timestamps
    end
  end
end
