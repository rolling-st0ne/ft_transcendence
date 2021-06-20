class AddMatchTypeToMatches < ActiveRecord::Migration[6.1]
  def change
    add_column :matches, :match_type, :integer
  end
end
