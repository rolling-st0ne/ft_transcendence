class AddBanReasonToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :ban_reason, :string
  end
end
