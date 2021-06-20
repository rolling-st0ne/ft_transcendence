class GuildInvitation < ApplicationRecord
  has_one :user, class_name: "User", :foreign_key => :id
  has_one :guild, class_name: "Guild", :foreign_key => :id
end