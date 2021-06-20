class CreateMatches < ActiveRecord::Migration[6.1]
  def change
    create_table :matches do |t|
      t.integer :first_player_id
      t.integer :second_player_id
      t.integer :status
      t.bigint  :tournament_id, default: 0


      t.timestamps
    end
    add_index :matches, :first_player_id
    add_index :matches, :second_player_id
  end
end
