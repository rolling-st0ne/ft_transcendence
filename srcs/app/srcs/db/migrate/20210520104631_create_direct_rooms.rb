class CreateDirectRooms < ActiveRecord::Migration[6.1]
  def change
    create_table :direct_rooms do |t|
      t.integer :sender_id
      t.integer :receiver_id

      t.timestamps
    end
  end
end
