class Match < ApplicationRecord
    belongs_to :player_one, class_name: "User", foreign_key: :first_player_id
    belongs_to :player_two, class_name: "User", foreign_key: :second_player_id
end
