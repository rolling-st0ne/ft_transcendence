class AddOtpValidatedToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :otp_validated, :boolean
  end
end
