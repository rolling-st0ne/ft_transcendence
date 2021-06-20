class CreateGuildInvitation < ActiveRecord::Migration[6.1]
  def change
    create_table :guild_invitations do |t|

      t.timestamps
    end
  end
end
