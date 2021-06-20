class ResetUnunsweredMatchesCounterJob < ApplicationJob
  queue_as :default

  def perform(*args)
    @war = args.first
    @war.g1_unanswered_counter = 0
    @war.g2_unanswered_counter = 0
    if @war.end > DateTime.now.new_offset(0)
      ResetUnunsweredMatchesCounterJob.set(wait: 24.hour).perform_later(@war)
    end
  end
end
