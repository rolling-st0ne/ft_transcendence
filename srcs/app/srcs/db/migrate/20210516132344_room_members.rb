class RoomMembers < ActiveRecord::Migration[6.1]
  def change
    create_table :room_members do |t|
      t.integer :room_id
      t.string  :intra, null: false
      t.string  :displayname
      t.boolean :banned
      t.boolean :muted
      t.boolean :admin
    end
  end
end
