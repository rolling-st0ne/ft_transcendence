class CreateTournamentUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :tournament_users do |t|
      t.bigint  :user_id
      t.integer :wins, default: 0
      t.integer :loses, default: 0
      t.integer :raiting, default: 0
      t.integer :stage, default: 0
      t.bigint  :tournament_id
      t.boolean :winner, default: true
      
      t.timestamps
    end
  end
end
