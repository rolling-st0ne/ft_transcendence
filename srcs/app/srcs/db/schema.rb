# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_06_12_130755) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "block_user_rooms", force: :cascade do |t|
    t.integer "user_id"
    t.integer "room_id"
    t.integer "time"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "direct_messages", force: :cascade do |t|
    t.text "content"
    t.bigint "direct_room_id", null: false
    t.bigint "user_id", null: false
    t.boolean "read"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["direct_room_id"], name: "index_direct_messages_on_direct_room_id"
    t.index ["user_id"], name: "index_direct_messages_on_user_id"
  end

  create_table "direct_rooms", force: :cascade do |t|
    t.integer "sender_id"
    t.integer "receiver_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "blocked1"
    t.string "blocked2"
  end

  create_table "friendships", id: :serial, force: :cascade do |t|
    t.string "friendable_type"
    t.integer "friendable_id"
    t.integer "friend_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "blocker_id"
    t.integer "status"
    t.index ["friendable_id", "friend_id"], name: "index_friendships_on_friendable_id_and_friend_id", unique: true
  end

  create_table "guild_invitations", force: :cascade do |t|
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "user_id", null: false
    t.bigint "guild_id", null: false
    t.index ["guild_id"], name: "index_guild_invitations_on_guild_id"
    t.index ["user_id"], name: "index_guild_invitations_on_user_id"
  end

  create_table "guilds", force: :cascade do |t|
    t.string "name"
    t.string "anagram", limit: 5
    t.integer "score", default: 0
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "matches", force: :cascade do |t|
    t.integer "first_player_id"
    t.integer "second_player_id"
    t.integer "status"
    t.bigint "tournament_id", default: 0
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "winner"
    t.integer "first_player_score"
    t.integer "second_player_score"
    t.bigint "war_id"
    t.integer "match_type"
    t.index ["first_player_id"], name: "index_matches_on_first_player_id"
    t.index ["second_player_id"], name: "index_matches_on_second_player_id"
    t.index ["war_id"], name: "index_matches_on_war_id"
  end

  create_table "messages", force: :cascade do |t|
    t.string "content"
    t.integer "room_id"
    t.boolean "private"
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "room_admins", force: :cascade do |t|
    t.integer "user_id"
    t.integer "room_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "room_members", force: :cascade do |t|
    t.integer "room_id"
    t.string "intra", null: false
    t.string "displayname"
    t.boolean "banned"
    t.boolean "muted"
    t.boolean "admin"
  end

  create_table "rooms", force: :cascade do |t|
    t.string "name"
    t.boolean "password_present"
    t.string "password_digest"
    t.string "owner_name"
    t.integer "owner_id"
    t.boolean "private"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "tournament_users", force: :cascade do |t|
    t.bigint "user_id"
    t.integer "wins", default: 0
    t.integer "loses", default: 0
    t.integer "rating", default: 0
    t.integer "stage", default: 0
    t.bigint "tournament_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "tournaments", force: :cascade do |t|
    t.datetime "start_date", null: false
    t.boolean "is_rating", default: false, null: false
    t.integer "stage", default: 0
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "winner_id"
    t.integer "status", default: 0, null: false
    t.datetime "end_date", null: false
    t.index ["winner_id"], name: "index_tournaments_on_winner_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "displayname"
    t.integer "wins", default: 0
    t.integer "loses", default: 0
    t.integer "elo", default: 0
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "nickname"
    t.string "provider"
    t.string "uid"
    t.binary "avatar"
    t.string "avatar_url"
    t.string "avatar_default_url"
    t.boolean "admin", default: false
    t.boolean "banned", default: false
    t.string "encrypted_otp_secret"
    t.string "encrypted_otp_secret_iv"
    t.string "encrypted_otp_secret_salt"
    t.integer "consumed_timestep"
    t.boolean "otp_required_for_login"
    t.boolean "otp_validated"
    t.boolean "guild_master", default: false
    t.boolean "guild_officer", default: false
    t.string "ban_reason"
    t.boolean "online"
    t.datetime "last_seen_at"
    t.boolean "guild_accepted", default: false
    t.bigint "guild_id"
    t.boolean "first_login", default: true
    t.boolean "owner", default: false, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["guild_id"], name: "index_users_on_guild_id"
    t.index ["provider"], name: "index_users_on_provider"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid"], name: "index_users_on_uid"
  end

  create_table "wars", force: :cascade do |t|
    t.bigint "guild1_id"
    t.bigint "guild2_id"
    t.string "g1_name"
    t.string "g2_name"
    t.boolean "finished", default: false
    t.boolean "accepted", default: false
    t.datetime "start"
    t.datetime "end"
    t.integer "stake", default: 0
    t.integer "g1_score", default: 0
    t.integer "g2_score", default: 0
    t.datetime "wartime_start"
    t.datetime "wartime_end"
    t.integer "wait_minutes", default: 10
    t.integer "max_unanswered", default: 5
    t.integer "matches_total", default: 0
    t.integer "g1_matches_won", default: 0
    t.integer "g1_unanswered_counter", default: 0
    t.integer "g1_matches_unanswered", default: 0
    t.integer "g2_matches_won", default: 0
    t.integer "g2_matches_unanswered", default: 0
    t.integer "g2_unanswered_counter", default: 0
    t.boolean "ladder", default: false
    t.boolean "tournament", default: false
    t.integer "winner"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["guild1_id"], name: "index_wars_on_guild1_id"
    t.index ["guild2_id"], name: "index_wars_on_guild2_id"
  end

  add_foreign_key "direct_messages", "direct_rooms"
  add_foreign_key "direct_messages", "users"
  add_foreign_key "guild_invitations", "guilds"
  add_foreign_key "guild_invitations", "users"
  add_foreign_key "matches", "wars"
  add_foreign_key "messages", "users"
  add_foreign_key "tournaments", "users", column: "winner_id"
  add_foreign_key "users", "guilds"
  add_foreign_key "wars", "guilds", column: "guild1_id"
  add_foreign_key "wars", "guilds", column: "guild2_id"
end
