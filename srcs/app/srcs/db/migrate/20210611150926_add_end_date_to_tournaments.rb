class AddEndDateToTournaments < ActiveRecord::Migration[6.1]
  def change
    add_column :tournaments, :end_date, :datetime, null: false
  end
end
