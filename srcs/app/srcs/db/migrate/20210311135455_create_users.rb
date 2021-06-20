class CreateUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :users do |t|
      t.string  :intra, null: false
      t.string  :password_digest, null: false
      t.string  :nick
      t.string  :mail
      t.integer :wins
      t.integer :loses
      t.integer :elo
      t.timestamps
    end
  end
end
