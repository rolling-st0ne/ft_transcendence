class Guild < ApplicationRecord
  has_many :members, -> { where(guild_accepted: true) }, dependent: :nullify, class_name: "User", :foreign_key => :guild_id
  has_many :soldiers, -> { where(guild_accepted: true, guild_officer: false, guild_master: false) }, class_name: "User", :foreign_key => :guild_id
  has_one :master, -> { where(guild_master: true) }, class_name: "User", :foreign_key => :guild_id
  has_many :officers, -> { where(guild_officer: true) }, class_name: "User", :foreign_key => :guild_id
  has_many :requests, -> { where(guild_accepted: false) },  dependent: :nullify, class_name: "User", :foreign_key => :guild_id
  has_many :guild_invitations, dependent: :destroy, class_name: "GuildInvitation", :foreign_key => :guild_id
  has_many :war_requests, -> { where(accepted: false) }, dependent: :destroy,   class_name: "War", foreign_key: "guild1_id"
  has_many :war_invites, -> { where(accepted: false) }, dependent: :destroy,   class_name: "War", foreign_key: "guild2_id"
  has_many :wars_started, -> { where(accepted: true) },  dependent: :nullify, class_name: "War", foreign_key: "guild1_id"
  has_many :wars_accepted, -> { where(accepted: true) },  dependent: :nullify, class_name: "War", foreign_key: "guild2_id"

  include ActiveModel::Validations
  validates :name, uniqueness: { case_sensitive: false }, presence: true
  validates :anagram, uniqueness: { case_sensitive: true }, presence: true
  validates_with GuildValidator

  def wars
    War.where('guild1_id = :id OR guild2_id = :id', id: id).where(accepted: true)
  end

  def active_war
    wars = War.where('guild1_id = :id OR guild2_id = :id', id: id).where(accepted: true).where(finished: false)
    if wars.empty?
      false
    else
      [wars[0].id, wars[0].g1_name, wars[0].g2_name]
    end
  end

  def wars_counter
    wars = War.where('guild1_id = :id OR guild2_id = :id', id: id).where(accepted: true)
    wars.length
  end

  def members_counter
    members.length
  end

  def join_requests_counter
    requests.length
  end

  def war_invites_counter
    war_invites.length
  end

  def war_requests_counter
    war_requests.length
  end

  def current_user_role
    user = Guild.current_user
    if user.guild_id == id
      if user.guild_accepted
        if user.guild_master
          'master'
        else
          user.guild_officer ? 'officer' : 'member'
        end
      else
        'seeker'
      end
    elsif user.guild_master
      wars = War.where('guild1_id = :id OR guild2_id = :id', id: user.guild_id).where(accepted: true).where(finished: false)
      wars.empty? ? 'other-free-master' : 'other-member'
    elsif user.guild_accepted
      'other-member'
    else
      invite = GuildInvitation.find_by_user_id_and_guild_id(user.id, id)
      invite ? 'invited' : 'none'
    end
  end

  class << self
    def current_user=(user)
      Thread.current[:current_user] = user
    end

    def current_user
      Thread.current[:current_user]
    end
  end
end
