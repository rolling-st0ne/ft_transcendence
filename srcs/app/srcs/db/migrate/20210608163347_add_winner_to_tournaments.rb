class AddWinnerToTournaments < ActiveRecord::Migration[6.1]
  def change
    change_table :tournaments do |t|
      t.belongs_to :winner, foreign_key: {to_table: :users}
    end
  end
end
