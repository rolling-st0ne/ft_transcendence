class BlockUserRoom < ApplicationRecord
    def user_id
        self[:user_id]
    end
end