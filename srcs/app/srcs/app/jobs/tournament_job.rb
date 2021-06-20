class TournamentJob < ApplicationJob
  queue_as :default

  def perform(*args)
    Tournament.where(status: 'open').each do |t|
      if t.start_date <= DateTime.now
        t.update_attribute('status', 'started')
      end
    end
    TournamentJob.set(wait: 1.minute).perform_later
  end
end