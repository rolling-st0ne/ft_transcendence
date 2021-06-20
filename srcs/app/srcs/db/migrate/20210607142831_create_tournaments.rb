class CreateTournaments < ActiveRecord::Migration[6.1]
  def change
    create_table :tournaments do |t|
      t.bigint "users", references: :users
      t.datetime :start_date, null: false
      t.boolean :is_rating, null: false, default: false
      t.string :status, null: false, default: "open"
      t.integer :stage, default: 0

      t.timestamps
    end
  end
end
