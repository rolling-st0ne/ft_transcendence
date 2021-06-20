class ChangeTypeOfWinner < ActiveRecord::Migration[6.1]
  def change
    change_column :matches, :winner, 'integer USING CAST(winner AS integer)'
  end
end
