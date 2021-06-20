class WarValidator < ActiveModel::Validator
  def validate(record)
    record.errors.add :stake, 'Stake must be not less then 1 point' if record.stake < 1
    record.errors.add :max_unanswered, 'Max numbers of unanswered calls must be not less then 0' if record.max_unanswered < 0
    record.errors.add :wait_minutes, 'Wait time must be from 1 to 1440 min' if record.wait_minutes < 1 || record.wait_minutes > 1440
  end

end