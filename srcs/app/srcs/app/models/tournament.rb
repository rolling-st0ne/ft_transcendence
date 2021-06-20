class Tournament < ApplicationRecord
  include ActiveModel::Validations
  validates :start_date, :end_date, presence: true
  validates_with TournamentValidator, on: :create

  # has_many :users
  has_many :tournament_users
  belongs_to :winner, class_name: "User", optional: true

  enum status: [ :open, :closed, :active, :finished ]
end
