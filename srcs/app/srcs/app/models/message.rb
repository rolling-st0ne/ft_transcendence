class Message < ApplicationRecord
  belongs_to :user
  belongs_to :room

  def user_guild_anagram
    user = User.find(user_id)
    return user.guild_accepted ? user.guild.anagram : nil
  end

end
