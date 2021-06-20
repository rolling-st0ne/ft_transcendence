class TournamentValidator < ActiveModel::Validator
  def validate(record)
    if record.start_date.nil? || record.end_date.nil?
      return
    end

    # validate date
    if record.start_date.to_time < DateTime.now.to_time + 3600
      record.errors.add :start_date, "Start datetime is earlier than 1 hour in future"
    end
    if record.end_date.to_time < record.start_date.to_time + 3600
      record.errors.add :end_date, "Tournament length is less than 1 hour"
    end
  end
end
