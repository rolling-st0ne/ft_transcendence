class AddUserToGuildInvitation < ActiveRecord::Migration[6.1]
  def change
    add_reference :guild_invitations, :user, null: false, foreign_key: true
  end
end
