class CreateMessages < ActiveRecord::Migration[6.1]
  def change
    create_table :messages do |t|
      t.string    :content
      t.integer   :room_id
      t.boolean   :private
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
