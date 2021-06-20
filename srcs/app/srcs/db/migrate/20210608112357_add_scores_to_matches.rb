class AddScoresToMatches < ActiveRecord::Migration[6.1]
  def change
    add_column :matches, :first_player_score, :integer
    add_column :matches, :second_player_score, :integer
  end
end
