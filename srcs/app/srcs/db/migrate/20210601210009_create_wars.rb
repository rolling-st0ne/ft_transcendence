class CreateWars < ActiveRecord::Migration[6.1]
  def change
    create_table :wars do |t|
      t.references :guild1
      t.references :guild2
      t.string  :g1_name
      t.string  :g2_name
      t.boolean :finished, default: false
      t.boolean :accepted, default: false
      t.datetime :start
      t.datetime :end
      t.integer :stake, default: 0
      t.integer :g1_score, default: 0
      t.integer :g2_score, default: 0
      t.datetime :wartime_start
      t.datetime :wartime_end
      t.integer :wait_minutes, default: 10
      t.integer :max_unanswered, default: 5
      t.integer :matches_total, default: 0
      t.integer :g1_matches_won, default: 0
      t.integer :g1_unanswered_counter, default: 0
      t.integer :g1_matches_unanswered, default: 0
      t.integer :g2_matches_won, default: 0
      t.integer :g2_matches_unanswered, default: 0
      t.integer :g2_unanswered_counter, default: 0
      t.boolean :ladder, default: false
      t.boolean :tournament, default: false
      t.integer :winner # numbers 1 or 2

      t.timestamps
    end
    add_foreign_key :wars, :guilds, column: :guild1_id, primary_key: :id
    add_foreign_key :wars, :guilds, column: :guild2_id, primary_key: :id
  end
end
