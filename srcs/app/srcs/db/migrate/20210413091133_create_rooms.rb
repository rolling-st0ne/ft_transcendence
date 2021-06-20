class CreateRooms < ActiveRecord::Migration[6.1]
  def change
    create_table :rooms do |t|
      t.string      :name
      t.boolean     :password_present
      t.string      :password_digest
      t.string      :owner_name
      t.integer     :owner_id
      t.boolean     :private
      t.timestamps
    end
  end
end
