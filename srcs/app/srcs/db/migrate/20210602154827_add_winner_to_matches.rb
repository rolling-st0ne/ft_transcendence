class AddWinnerToMatches < ActiveRecord::Migration[6.1]
  def change
    add_column :matches, :winner, :string
  end
end
