class DirectMessage < ApplicationRecord
  belongs_to :direct_room
  belongs_to :user

  validates_presence_of :content, :direct_room_id, :user_id

  private
    def message_time
      created_at.strftime("%d/%m/%y at %l:%M %p")
    end
  
end
