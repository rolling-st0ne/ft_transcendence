include Api::UsersHelper
require 'open-uri'

class User < ApplicationRecord
  belongs_to :guild, required: false, :foreign_key => :guild_id
  has_many :guild_invitations, dependent: :destroy, class_name: "GuildInvitation", :foreign_key => :user_id

  include ActiveModel::Validations
  validates :email, uniqueness: { case_sensitive: false }, presence: true
  validates :displayname, uniqueness: { case_sensitive: false }, presence: true
  validates_with UserValidator

  has_friendship

#match stuff
  has_many :matches, foreign_key: "first_player_id"
  def matches
    Match.where("first_player_id = ? OR second_player_id = ?", self.id, self.id)
  end
  has_one :current_match,
            -> { where matches: {status: 2} },
            class_name: "Match",
            foreign_key: "first_player_id"

  has_many :requested_matches, -> { where matches: {status: 1} }, foreign_key: "first_player_id", class_name: "Match"
  has_many :pending_matches, -> { where matches: {status: 1} }, foreign_key: "second_player_id", class_name: "Match"

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :two_factor_authenticatable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:marvin]

  def self.from_omniauth(auth)
    # auth may return nil uid
    return if auth.nil? || auth.uid.nil?
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
      user.nickname = auth.info.nickname
      user.displayname = user.nickname
      # user.avatar = URI.open(user_gravatar(auth.info.email, user.nickname)).read
      user.avatar_url = user_gravatar(auth.info.email, user.nickname)
      user.avatar_default_url = user_gravatar(auth.info.email, user.nickname)
    end
  end

  def otp_qrcode
    issuer = 'ft_transcendence'
    begin
      qrcode = RQRCode::QRCode.new(otp_provisioning_uri(email, issuer: issuer))
    rescue  # no secret key
      qrcode = RQRCode::QRCode.new('otpauth://{type}/{label}?{parameters}')
    end
    qrcode.as_svg(module_size: 4)
  end

  def update_online!(is_online)
    self.update({online: is_online, last_seen_at: Time.now})
  end

  def on_friendship_created(friendship)
    puts "friendship started"
  end

  def on_friendship_accepted(friendship)
    puts "friendship accepted"
  end

  def on_friendship_blocked(friendship)
    puts "friendship blocked"
  end

  def on_friendship_destroyed(friendship)
    puts "friendship ended"
  end

  def guild_invites_counter
    guild_invitations.length
  end

  class << self
    def current_user=(user)
      Thread.current[:current_user] = user
    end

    def current_user
      Thread.current[:current_user]
    end
  end

  def current_owner
    User.current_user.owner?
  end
end
