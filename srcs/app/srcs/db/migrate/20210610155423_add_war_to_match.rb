class AddWarToMatch < ActiveRecord::Migration[6.1]
  def change
      add_reference :matches, :war, null: true, index: true, foreign_key: true
  end
end
