class DirectRoom < ApplicationRecord

    def receiver_id
        self[:receiver_id]
    end

    def sender_id
        self[:sender_id]
    end

    def blocked_user1
        self[:blocked_user1]
    end

    def blocked_user2
        self[:blocked_user2]
    end
    
    belongs_to :sender, class_name: "User", foreign_key: "sender_id"
    belongs_to :receiver, class_name: "User", foreign_key: "receiver_id"
    has_many :direct_messages, dependent: :destroy

    validates_uniqueness_of :sender_id, scope: :receiver_id
    scope :between, -> (sender_id,receiver_id) do
        where("(direct_rooms.sender_id = ? AND direct_rooms.receiver_id = ?) OR (direct_rooms.receiver_id = ? AND direct_rooms.sender_id = ?)", sender_id, receiver_id, sender_id, receiver_id)
    end


end